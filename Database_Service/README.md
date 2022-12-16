# Database Service

## Purpose

This service is dedicated to handling data that needs to be inserted, modified, and retrieved from the local database

## Compiling

1. Create a directory named `build` in this directory
2. Through the console
    1. Move to the `build` directory
    2. Execute the command `cmake .. && make`
3. If the program compiled correctly then a program named `database_service` should now exist in the *build* directory

## Running

*Through the console*
1. Move to the `build` directory
2. Execute the command `./database_service`

Installing dependencies
sudo apt-get install libsqlite3-dev
cd ~ && git clone https://github.com/redis/hiredis.git
cd hiredis && make && sudo make install
cd ~ && git clone https://github.com/sewenew/redis-plus-plus.git
cd redis-plus-plus
mkdir build && cd build
cmake -DREDIS_PLUS_PLUS_BUILD_TEST=OFF ..
make && sudo make install
cd ~ && sudo rm -r hiredis && sudo rm -r redis-plus-plus
export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/lib"