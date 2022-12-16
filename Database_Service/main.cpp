#include <sqlite3.h>
#include <iostream>
#include <sw/redis++/redis++.h>
#include <pthread.h>

sw::redis::Redis redis_handler = sw::redis::Redis("tcp://127.0.0.1:6379");

int callback(void *, int, char **, char **);
bool execute(sqlite3 **, const char *, std::string);
void listen_for_data();

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

    sw::redis::OptionalString reply = redis_handler.get("acquisition:started");
    if(reply) {
        std::cout << *reply << std::endl;
    }

    return 0;
}

void listen_for_data()
{
    sw:redis::Subscriber data_subscriber = redis_handler.subscriber();
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