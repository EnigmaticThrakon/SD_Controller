# PLC Service

## Purpose

This service is responsible for listening to data coming in from the PLC
and sending that data into Redis for it to be sent to its final destination

## Expected Operation

### General

This service should be constantly reading data from the PLC and outputting that data to the console,
if an acquisition has started then the service will send those values into the Redis database utilizing
a pub/sub key.

### Systemd Service Specific

If the program exits with a status code that isn't 0 due to an error or exception, the service should
be constantly restarted to attempt to fulfill it's purpose. If the program exits with a status code
of 0, then the service will not be restarted, because this should only occur when a system shutdown is
occurring

## Prerequisites

*This is assuming running on a Debian machine - typically python and pip are already installed*

1. `sudo apt-get install python` 
    * You can replace `python` with `python3` depending on which version you want, make sure you use same selection for all subsequent commands*
2. `sudo apt-get install python-pip`

## Compiling

Install modules utilizing the `pip install <module>` command if any module reference errors occur

## Creating the Service

1. Make sure the service is currently stopped with `sudo systemctl stop plc`
2. Copy `plc.service` file to the `lib/systemd/system/` directory
3. Enable the service with `sudo systemctl enable plc`
4. Start the service with `sudo systemctl start plc`

## Debugging

*This is assuming through VS Code*
1. Make sure the `Pylance` and `Python` VS Code extensions are installed
2. Go to the VS Code debugging tab
3. Select the `PLC Service` option in the dropdown
4. Hit `F5` or the green arrow

## Running Locally

*Through the console*
1. Move to the `PLC_Service` directory
2. Execute the command `python main.py`

## Running the Service

*The service should constantly be running/restarting when device starts up*
> Run `sudo systemctl start plc` *if the service is not already running*

**Check the current output of the service using `journalctl -fu plc`**

