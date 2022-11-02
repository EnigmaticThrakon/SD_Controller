# PLC Service

## Purpose

This service is responsible for listening to data coming in from the PLC
and sending that data into Redis for it to be sent to its final destination

## Compiling

*No compiling necessary since this is a Python program*

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

## Creating the Service

1. Make sure the service is currently stopped with `sudo systemctl stop plc`
2. Copy `plc.service` file to the `lib/systemd/system/` directory
3. Enable the service with `sudo systemctl enable plc`
4. Start the service with `sudo systemctl start plc`

## Running the Service

*The service should constantly be running/restarting when device starts up*
> Run `sudo systemctl start plc` *if the service is not already running*

**Check the current output of the service using `journalctl -fu plc`**

