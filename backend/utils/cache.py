import time
from typing import Dict, Any, Optional

class SimpleCache:
    def __init__(self, default_ttl: int = 300):
        self.default_ttl = default_ttl
        self.store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self.store:
            return None
        entry = self.store[key]
        if time.time() > entry["expires_at"]:
            del self.store[key]
            return None
        return entry["value"]

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        duration = ttl if ttl is not None else self.default_ttl
        self.store[key] = {
            "value": value,
            "expires_at": time.time() + duration
        }

    def clear(self) -> None:
        self.store.clear()

# Global cache instance
cache_instance = SimpleCache(default_ttl=300) # 5 minutes TTL
