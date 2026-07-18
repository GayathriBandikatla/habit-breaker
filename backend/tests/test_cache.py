import time
from backend.utils.cache import SimpleCache

def test_cache_set_get():
    cache = SimpleCache(default_ttl=2)
    cache.set("key1", "val1")
    assert cache.get("key1") == "val1"
    assert cache.get("nonexistent") is None

def test_cache_expiration():
    cache = SimpleCache(default_ttl=1)
    cache.set("key1", "val1")
    # Wait for expiration
    time.sleep(1.5)
    assert cache.get("key1") is None

def test_cache_clear():
    cache = SimpleCache(default_ttl=10)
    cache.set("key1", "val1")
    cache.set("key2", "val2")
    cache.clear()
    assert cache.get("key1") is None
    assert cache.get("key2") is None
