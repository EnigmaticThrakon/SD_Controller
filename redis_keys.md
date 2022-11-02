# Key Definitions

## System Commands

* `acquisition:started`
    * `1`: Acquisition has started and the system acts accordingly
    * `0`: Acquisition has stopped and system remains idle (no live data passed into Redis)
* `system:shutdown`
    * `1`: Shutdown actions begin to be performed and device powers off
    * `0`: System is on and operates normally

## PLC Service

* `live:data` - Pub/Sub key used to push out the live data as it's parsed

## Database Service

* `live:data` - Pub/Sub key that is used to read in data as it comes in to insert into database