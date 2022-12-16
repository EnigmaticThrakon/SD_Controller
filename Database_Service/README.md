# Database Service

## Purpose

This service is dedicated to handling data that needs to be inserted, modified, and retrieved from the local database

## Expected Operation

### General

This service should be constantly reading data that is published into Redis from the PLC service and inserting the data into the local database for the current run. It should also be listening for any incoming commands to then publish or set any needed data into the Redis database.

### Systemd Service Specific

If the program exists with a status code that isn't a `Success` then it should restart. Otherwise the program will remain terminated until manually restarted or the device restarts.

## Prerequisites

* Install CMake
* Install Dependencies
    1. SQLite Libraries: `sudo apt-get install libsqlite3-dev`
    2. Hiredis Libraries
    ```
    git clone https://github.com/redis/hiredis.git
    cd hiredis
    make
    sudo make install
    cd ..
    sudo rm -r hiredis
    ```
    3. Redis++ Libraries
    ```
    git clone https://github.com/sewenew/redis-plus-plus.git
    cd redis-plus-plus
    mkdir build && cd build
    cmake -DREDIS_PLUS_PLUS_BUILD_TEST=OFF ..
    make
    sudo make install
    cd ../..
    sudo rm -r redis-plus-plus
    ```
    4. JsonCpp Libraries
    ```
    git clone https://github.com/nlohmann/json.git
    cd json
    mkdir build && cd build
    cmake -DJSON_BuildTests=OFF ..
    make
    sudo make install
    cd ..
    sudo rm -r json
    ```
* Update Libraries Path: 
    1. Add the line `export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/lib"` to the end of the `~/.bashrc`
    2. Enable the changes by running the command `source ~/.bashrc`

## Compiling

1. Create a directory named `build` in this directory
2. Through the console
    1. Move to the `build` directory
    2. Execute the command `cmake .. && make`
3. If the program compiled correctly then a program named `database_service` should now exist in the *build* directory

## Creating the Service

1. Make sure the service is currently stopped with `sudo systemctl stop database_service`
2. Copy `database_service.service` file to the `lib/systemd/system/` directory
3. Enable the service with `sudo systemctl enable database_service`
4. Start the service with `sudo systemctl start database_service`

## Debugging

*This is assuming through VS Code*
1. Make sure the `C/C++ Extension Pack` and `CMake Tools` extensions are installed
2. Open the `Database_Service` directory through `> File > Open Folder...`
3. Build the targets by selecting `Build` in the bottom navbar
4. Set the default build target by selecting the list next to the `Build` button
5. Start debugging by selecting the debug button in the bottom navbar

## Running Locally

*Through the console*
1. Move to the `build` directory
2. Execute the command `./database_service`

## Running the Service

*The service should be constantly be running/restarting when device starts up*
> Run `sudo systemctl start database_service` *if the service is not already running*

**Check the current output of the service using `journalctl -fu database_service`**