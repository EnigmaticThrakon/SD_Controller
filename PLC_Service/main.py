import redis

def main():
    r = redis.Redis()
    assert r.ping()
    print("Successfully Connected to Redis")

if __name__ == '__main__':
    main()