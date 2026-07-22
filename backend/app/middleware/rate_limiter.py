from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time
from collections import defaultdict

class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_limit: int = 100, time_window: int = 60):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.time_window = time_window
        self.clients = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        now = time.time()
        
        # Clean up old requests
        self.clients[client_ip] = [req_time for req_time in self.clients[client_ip] if now - req_time < self.time_window]
        
        if len(self.clients[client_ip]) >= self.requests_limit:
            raise HTTPException(status_code=429, detail="Too many requests")
            
        self.clients[client_ip].append(now)
        
        response = await call_next(request)
        return response
