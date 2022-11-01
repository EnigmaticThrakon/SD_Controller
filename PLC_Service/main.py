from datetime import datetime
import json
import random
from time import sleep
import redis
import threading
import sys

def simulate():
    weight = 50
    while not stop_thread:
        simulated_data = {
            "timestamp": datetime.utcnow(),
            "temperature": random.randrange(0, 50) / 10,
            "humidity": random.randrange(60, 90),
            "airFlow": random.randrange(16, 66) / 10,
            "weight": weight,
            "door": random.randrange(0, 1)
        }

        simulated_data_string = json.dumps(simulated_data, default=str)
        print(simulated_data_string)
        if acquisition_started:
            redis_context.publish("live:data", simulated_data_string)

        weight = weight - 0.00001
        sleep(1)

def shutdown(data):
    global service_running

    service_running = False

def acquisitionAction(command):
    global acquisition_started

    if command["data"] == "start":
        acquisition_started = True
        redis_context.rpush("logs:" + service_name, "Starting Data Acquisition")
    
    if command["data"] == "stop":
        acquisition_started = False
        redis_context.rpush("logs:" + service_name, "Stopping Data Acquisition")

def setup_subscribers():
    global shutdown_sub
    global acquisition_sub

    acquisition_sub = redis_context.pubsub()
    acquisition_sub.subscribe(**{'acquisition:command':acquisitionAction})
    acquisition_th = acquisition_sub.run_in_thread(sleep_time=1, daemon=True)

    shutdown_sub = redis_context.pubsub()
    shutdown_sub.subscribe(**{'system:shutdown':shutdown})
    shutdown_th = shutdown_sub.run_in_thread(sleep_time=1, daemon=True)

def main():
    global redis_context
    global service_name
    global service_running
    global acquisition_started
    global stop_thread

    service_name = "plc_service"

    redis_context = redis.Redis(decode_responses=True, charset="utf-8")

    try:
        redis_context.ping()
    except Exception as ex:
        print("Error connecting to Redis " + str(ex))
        quit()

    redis_context.rpush("logs:" + service_name, "Successfully Connected to Redis")

    stop_thread = False
    work_th = threading.Thread(target=simulate, daemon=True)
    work_th.start()

    acquisition_started = False
    setup_subscribers()
    
    service_running = True
    while service_running:
        sleep(1)

    acquisition_sub.unsubscribe()
    shutdown_sub.unsubscribe()

    stop_thread = True
    while work_th.is_alive():
        work_th.join()
        sleep(1)

    redis_context.rpush("logs:" + service_name, "Shutting Down Service")
    redis_context.close()

if __name__ == '__main__':
    main()