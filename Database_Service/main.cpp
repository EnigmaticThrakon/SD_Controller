#include <sqlite3.h>
#include <iostream>
#include <sw/redis++/redis++.h>
#include <pthread.h>
#include <nlohmann/json.hpp>

sw::redis::Redis redis_handler = sw::redis::Redis("tcp://127.0.0.1:6379");
bool listening_for_data = true;
bool listening_for_commands = true;
using json = nlohmann::json;

int callback(void *, int, char **, char **);
bool execute(sqlite3 **, const char *, std::string);
void *listen_for_data(void *);
void *listen_for_commands(void *);

int main(int argc, char* argv[])
{
    sqlite3 *db;
    char *zErrMsg = 0;
    int rc;

    rc = sqlite3_open("test.db", &db);

    if(rc) 
    {
        std::cout << "Can't open database: " << sqlite3_errmsg(db);
        exit(1);
    }
    else
    {
        std::cout << "Opened database successfully" << std::endl;
    }

    sqlite3_close(db);

    sw::redis::OptionalString reply = redis_handler.get("test");
    if(reply) {
        std::cout << *reply << std::endl;
    }

    pthread_t data_thread;
    int data_thread_index = pthread_create(&data_thread, NULL, listen_for_data, NULL);

    pthread_t command_thread;
    int command_thread_index = pthread_create(&command_thread, NULL, listen_for_commands, NULL);

    pthread_join(data_thread, NULL);
    pthread_join(command_thread, NULL);

    return 0;
}

void *listen_for_data(void *)
{
    sw::redis::Subscriber data_subscriber = redis_handler.subscriber();

    data_subscriber.on_message([](std::string channel, std::string msg) {
        std::cout << msg << " from " << channel << std::endl;
        listening_for_data = false;
    });

    data_subscriber.subscribe("test_channel");

    while(listening_for_data)
    {
        try
        {
            data_subscriber.consume();
        }
        catch(const sw::redis::Error &err)
        {
            std::cout << "data error" << std::endl;
        }
    }

    return NULL;
}

void *listen_for_commands(void *)
{
    sw::redis::Subscriber command_subscriber = redis_handler.subscriber();

    command_subscriber.on_message([](std::string channel, std::string msg) {
        std::cout << msg << " from " << channel << std::endl;

        json parsedCommand = json::parse(msg);

        std::cout << parsedCommand["temp"] << std::endl;
        listening_for_commands = false;
    });

    command_subscriber.subscribe("test2_channel");

    while(listening_for_commands)
    {
        try
        {
            command_subscriber.consume();
        }
        catch(const sw::redis::Error &err)
        {
            std::cout << "command error" << std::endl;
        }
    }

    return NULL;
}

// Callback function required by SQLite connector
int callback(void *NotUsed, int argc, char **argv, char **azColName)
{
    for (int i = 0; i < argc; i++)
        printf("%s = %s\n", azColName[i], argv[i] ? argv[i] : "NULL");

    std::cout << std::endl;
    return 0;
}

// Wrapper for executing SQLite commands
bool execute(sqlite3 **db, const char *command, std::string successString)
{
    char *errorMessage;
    bool success;

    if (sqlite3_exec(*db, command, callback, 0, &errorMessage) != SQLITE_OK)
    {
        success = false;
        printf("SQL Error: %s\n", errorMessage);
    }
    else
    {
        success = true;
        std::cout << successString << std::endl;
    }

    if (errorMessage)
        sqlite3_free(errorMessage);

    return success;
}