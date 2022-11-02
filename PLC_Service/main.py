from datetime import datetime
import json
import random
from time import sleep
import redis

def main():
    service_name = "plc_service"

    redis_context = redis.Redis(decode_responses=True, charset="utf-8")

    try:
        redis_context.ping()
    except Exception as ex:
        print("Error connecting to Redis " + str(ex))
        quit()

    redis_context.rpush("logs:" + service_name, "Successfully Connected to Redis")

    weight = 50
    stop_service = 0
    while stop_service != 1:
        simulated_data = {
                "timestamp": datetime.utcnow(),
                "temperature": random.randrange(0, 50) / 10,
                "humidity": random.randrange(60, 90),
                "airFlow": random.randrange(16, 66) / 10,
                "weight": weight,
                "door": random.randrange(0, 1)}

        simulated_data_string = json.dumps(simulated_data, default=str)
        print(simulated_data_string)

        acquisition_started = int(redis_context.get("acquisition:started"))
        if acquisition_started is not None and acquisition_started == 1:
            print(simulated_data_string + " -> Redis")
            redis_context.publish("live:data", simulated_data_string)

        weight = weight - 0.00001
        stop_service = int(redis_context.get('shutdown')) if redis_context.get('shutdown') is not None else 0
        sleep(1)

    redis_context.rpush("logs:" + service_name, "Shutting Down Service")
    redis_context.close()

if __name__ == '__main__':
    main()