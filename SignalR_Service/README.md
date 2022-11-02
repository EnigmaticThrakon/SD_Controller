# PLC Service

## Purpose

This service is responsible for establishing a connection to the server and monitoring the Redis
database. The purpose of this is to send data to the server that is sent to this service through Redis
or to send commands into Redis that are sent it the device from the server

## Expected Operation

### General

This service should form a SignalR connection with the server and be constantly reading in values from
the Redis database, which it adds to the queue, and sends that data to the database at regular intervals.
In addition, the service will receive commands from the server and send the necessary values into the 
Redis database depending on the values received.

### Systemd Service Specific

If the program exits with a status code that isn't 0 due to an error or exception, the service should
be constantly restarted to attempt to fulfill it's purpose. If the program exits with a status code
of 0, then the service will not be restarted, because this should only occur when a system shutdown is
occurring

## Prerequisites

*This is assuming running on a Debian machine*
* Node is installed on the device
    1. `sudo apt install curl`
    2. `curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash`
    3. `source ~/.bashrc`
    4. `nvm install node`

## Compiling

Ensure that all packages are installed utilizing the `npm install` command from the `SignalR_Service`
directory

## Debugging

*This is assuming through VS Code*
1. Go to the VS Code debugging tab
2. Select the `SignalR Service` option in the dropdown
3. Hit `F5` or the green arrow

## Running Locally

*Through the console*
1. Move to the `SignalR_Service` directory
2. Execute the command `node ./app.js`

## Creating the Service

1. Make sure the service is currently stopped with `sudo systemctl stop signalr`
2. Copy `signalr.service` file to the `lib/systemd/system/` directory
3. Enable the service with `sudo systemctl enable signalr`
4. Start the service with `sudo systemctl start signalr`

## Running the Service

*The service should constantly be running/restarting when device starts up*
> Run `sudo systemctl start signalr` *if the service is not already running*

**Check the current output of the service using `journalctl -fu signalr`**