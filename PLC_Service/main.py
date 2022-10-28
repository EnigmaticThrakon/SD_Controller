from datetime import datetime
import json
import random
from time import sleep
import redis
import threading
import sys

def simulate():
    while not stop_thread:
        simulated_data = {
            "timestamp": datetime.utcnow(),
            "temperature": random.randrange(30, 35),
            "humidity": random.randrange(10, 20),
            "airflow": random.randrange(5, 15)
        }

        simulated_data_string = json.dumps(simulated_data, default=str)

        redis_context.publish("live:data", simulated_data_string)
        sleep(1)

def shutdown(data):
    global service_running

    start_sub.unsubscribe()
    stop_sub.unsubscribe()
    shutdown_sub.unsubscribe()

    stop(None)

    redis_context.rpush("logs:" + service_name, "Shutting Down Service")
    redis_context.close()

    service_running = False

def stop(data):
    global stop_thread
    global work_th

    stop_thread = True

    while work_th.is_alive():
        work_th.join()
        sleep(1)

    redis_context.rpush("logs:" + service_name, "Stopping Data Acquisition")
    work_th = threading.Thread(target=simulate, daemon=True)

def start(data):
    global stop_thread

    stop_thread = False

    work_th.start()

    redis_context.rpush("logs:" + service_name, "Starting Data Acquisition")

def setup_subscribers():
    global start_th
    global stop_th
    global shutdown_th
    global start_sub
    global stop_sub
    global shutdown_sub

    start_sub = redis_context.pubsub()
    start_sub.subscribe(**{'start:acquisition':start})
    start_th = start_sub.run_in_thread(sleep_time=1, daemon=True)

    stop_sub = redis_context.pubsub()
    stop_sub.subscribe(**{'stop:acquisition':stop})
    stop_th = stop_sub.run_in_thread(sleep_time=1, daemon=True)

    shutdown_sub = redis_context.pubsub()
    shutdown_sub.subscribe(**{'system:shutdown':shutdown})
    shutdown_th = shutdown_sub.run_in_thread(sleep_time=1, daemon=True)

def main():
    global redis_context
    global service_name
    global work_th
    global service_running

    service_name = "plc_service"

    redis_context = redis.Redis(decode_responses=True, charset="utf-8")
    if not redis_context.ping():
        print("Error Connecting to Redis")

    redis_context.rpush("logs:" + service_name, "Successfully Connected to Redis")
    work_th = threading.Thread(target=simulate, daemon=True)
    setup_subscribers()
    
    service_running = True
    while service_running:
        sleep(1)

if __name__ == '__main__':
    main()