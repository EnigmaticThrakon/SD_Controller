from datetime import datetime
from pylogix import PLC
import json
import random
from time import sleep
import redis

#L00S05O00 3200 - 10000

def writePLC(data):
    comm = PLC('10.1.1.10', timeout=1)

    if data is not None and data["data"] is not None:
        writeObj = json.loads(data["data"])

        ret = comm.Write([('L00S05O00', writeObj['AirFlow']), ('DiskEnable', writeObj['Humidity'])])

# Main function to handle the operations of the service
def main():

    # Variable to hold the service name if needed for logging
    service_name = "plc_service"

    # Declaring the conection to the Redis database
    redis_context = redis.Redis(decode_responses=True, charset="utf-8")

    # Testing the connection to Redis and stopping the service with a failure status
    #       code if a connection cannot be established
    try:
        redis_context.ping()
    except Exception as ex:
        print("Error connecting to Redis " + str(ex))
        quit(1)

    # A log is pushed into Redis stating the service has successfully connected
    #       to Redis
    redis_context.rpush("logs:" + service_name, "Successfully Connected to Redis")

    action_listener = redis_context.pubsub()
    action_listener.subscribe(**{'write:plc':writePLC})
    action_listener_th = action_listener.run_in_thread(sleep_time=1, daemon=True)

    # Variable to hold whether or not the service should be stopped
    stop_service = 0

    comm = PLC('10.1.1.10', timeout=1)

    # Starting value of the weight (used for simulating)
    weight = 50

    # While loop to continue running while the service is running
    while stop_service != 1:

        ret = comm.Read('L00S02I00')

        # Data blob that is composed into an object before being sent into Redis
        simulated_data = {
                "timestamp": datetime.utcnow(),
                "temperature": random.randrange(0, 50) / 10,
                "humidity": random.randrange(60, 90),
                "airFlow": random.randrange(16, 66) / 10,
                "weight": weight,
                "door": ret.Value if ret.Value is not None else 0}

        # Data blob is serialized into a JSON string
        simulated_data_string = json.dumps(simulated_data, default=str)

        # Reads in Redis key to determine if data should be sent through Redis
        acquisition_started = int(redis_context.get('acquisition:started')) if redis_context.get('acquisition:started') is not None else 0
        if acquisition_started is not None and acquisition_started == 1:
            print(simulated_data_string + " -> Redis")
            redis_context.publish("live:data", simulated_data_string)
        else:
            print(simulated_data_string)

        # Weight is decremented (used for simulating)
        weight = weight - 0.00001

        # Reads in Redis key to determine if the service should be shutdown
        stop_service = int(redis_context.get('shutdown')) if redis_context.get('shutdown') is not None else 0

        # Letting the loop sleep for a second (might be removed after no longer simulating)
        sleep(0.5)

    action_listener.unsubscribe('write:plc')

    # Pushing another log to show the service is shutting down and closing the connection to Redis
    redis_context.rpush("logs:" + service_name, "Shutting Down Service")
    redis_context.close()

    # Exiting with a success status code
    quit(0)

# Starting the service with the main function
if __name__ == '__main__':
    main()