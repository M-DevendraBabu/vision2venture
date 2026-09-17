"""
Lightweight disk cache for real-world data fetches.
=================================================

Purpose (project improvement #2 — reproducibility + reliability):
- Google Trends, World Bank, Google News and Wikipedia are free public APIs that
  are frequently rate-limited or blocked from cloud servers (e.g. Render).
- Without caching, a blocked call silently falls back to a baseline, so two runs
  of the SAME idea can produce different market/trend signals.
- This module caches ONLY genuinely successful ("real") responses to disk, keyed
  by the call arguments, so once real data is fetched it is reused for a while.
  Fallback/empty responses are NOT cached, so the next run can still get real data.

Design notes:
- Pure standard library, no new dependencies.
- Fails open: any cache error falls back to calling the wrapped function directly.
- `cache_if` lets each caller decide what counts as a "real" result worth caching.
"""
import os
import json
import time
import hashlib
import functools
import logging

logger = logging.getLogger("vision2venture.cache")

# Cache lives under backend/app/.cache (created on first use, safe to delete anytime)
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".cache")


def _make_key(namespace, args, kwargs):
    payload = json.dumps(
        {"a": [str(a) for a in args], "k": {k: str(v) for k, v in sorted(kwargs.items())}},
        sort_keys=True,
    )
    digest = hashlib.md5(payload.encode("utf-8")).hexdigest()
    return f"{namespace or 'cache'}_{digest}"


def disk_cache(ttl_seconds=86400, namespace="", cache_if=None):
    """
    Decorator that caches a function's return value to disk for `ttl_seconds`.

    ttl_seconds : how long a cached entry stays valid.
    namespace   : short prefix so different functions don't collide.
    cache_if    : optional predicate(result) -> bool. Only results for which this
                  returns True are written to the cache. Defaults to "cache any
                  non-empty result".
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                os.makedirs(CACHE_DIR, exist_ok=True)
                key = _make_key(namespace, args, kwargs)
                path = os.path.join(CACHE_DIR, key + ".json")

                # 1. Serve fresh cache hit
                if os.path.exists(path):
                    try:
                        with open(path, "r", encoding="utf-8") as fh:
                            entry = json.load(fh)
                        if (time.time() - entry.get("ts", 0)) < ttl_seconds:
                            logger.debug(f"[cache] HIT {namespace}")
                            return entry["data"]
                    except Exception:
                        pass  # corrupt entry -> ignore and recompute

                # 2. Miss -> compute
                result = func(*args, **kwargs)

                # 3. Store only if it qualifies as a "real" result
                should_store = cache_if(result) if cache_if else bool(result)
                if should_store:
                    try:
                        with open(path, "w", encoding="utf-8") as fh:
                            json.dump({"ts": time.time(), "data": result}, fh, default=str)
                        logger.debug(f"[cache] STORE {namespace}")
                    except Exception as e:
                        logger.debug(f"[cache] store notice: {e}")
                return result
            except Exception as e:
                # Fail open: caching must never break the pipeline
                logger.debug(f"[cache] bypass ({e})")
                return func(*args, **kwargs)

        return wrapper

    return decorator
