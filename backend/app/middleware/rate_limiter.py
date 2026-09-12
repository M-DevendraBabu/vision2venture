from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict
import logging

logger = logging.getLogger("vision2venture.ratelimit")

import ipaddress
import os

def _is_valid_ip(candidate: str) -> bool:
    if not candidate:
        return False
    try:
        ipaddress.ip_address(candidate)
        return True
    except ValueError:
        return False

def get_client_ip(request: Request) -> str:
    """Safely extracts real client IP behind reverse proxies (Render, Cloudflare, Vercel, Nginx),
    validating IP syntax and preventing spoofed/malformed header injection."""
    trust_proxy = os.getenv("RENDER") or os.getenv("TRUST_PROXY", "true").lower() in ("1", "true", "yes")

    if trust_proxy:
        # 1. Cloudflare
        cf_ip = request.headers.get("cf-connecting-ip")
        if cf_ip and _is_valid_ip(cf_ip.strip()):
            return cf_ip.strip()
        
        # 2. X-Forwarded-For (first valid IP in comma-separated chain)
        xff = request.headers.get("x-forwarded-for")
        if xff:
            parts = [p.strip() for p in xff.split(",") if p.strip()]
            for part in parts:
                if _is_valid_ip(part):
                    return part
                
        # 3. X-Real-IP
        x_real = request.headers.get("x-real-ip")
        if x_real and _is_valid_ip(x_real.strip()):
            return x_real.strip()

    # 4. Direct socket
    if request.client and request.client.host and _is_valid_ip(request.client.host):
        return request.client.host

    return "127.0.0.1"


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_limit: int = 200, time_window: int = 60):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.time_window = time_window
        self.clients = defaultdict(list)
        self._last_cleanup = time.time()

    def _cleanup_old_entries(self, now: float):
        """Prevents unbounded memory growth by pruning inactive client IPs."""
        if now - self._last_cleanup > 300:  # Every 5 minutes
            stale_ips = [ip for ip, timestamps in self.clients.items() if not timestamps or now - timestamps[-1] > self.time_window]
            for ip in stale_ips:
                del self.clients[ip]
            self._last_cleanup = now

    async def dispatch(self, request: Request, call_next):
        # Health checks bypass rate limiting to prevent false-negative uptime alerts
        if request.url.path in ("/api/health", "/health"):
            return await call_next(request)

        client_ip = get_client_ip(request)
        now = time.time()
        
        self._cleanup_old_entries(now)

        # Clean up timestamps for this client
        self.clients[client_ip] = [req_time for req_time in self.clients[client_ip] if now - req_time < self.time_window]
        
        if len(self.clients[client_ip]) >= self.requests_limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down and try again later."},
                headers={"Retry-After": str(self.time_window)}
            )
            
        self.clients[client_ip].append(now)
        
        response = await call_next(request)
        return response

