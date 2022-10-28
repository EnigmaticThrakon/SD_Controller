# Key Definitions

## Global

* `start:acquisition` - Pub/Sub key used to signal that an acquisition is starting
* `stop:acquisition` - Pub/Sub key used to signal that an acquisition is being stopped
* `logs:<service_name>` - List key used to hold all the logs from each of the services
* `system:shutdown` - Pub/Sub key makes all services cleanup before shutting down the system

## PLC Service

* `live:data` - Pub/Sub key used to push out the live data as it's parsed

## Database Service

* `live:data` - Pub/Sub key that is used to read in data as it comes in to insert into database