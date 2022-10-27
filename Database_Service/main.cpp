#include <sqlite3.h>
#include <iostream>
#include <hiredis/hiredis.h>

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

    redisContext *c;
    const char *hostname = "127.0.0.1";
    int port = 6379;

    c = redisConnect(hostname, port);

    if(c == NULL || c->err)
    {
        if(c)
        {
            std::cout << "Connection Error: " << c->errstr;
            redisFree(c);
        }
        else
        {
            std::cout << "Connection Errror: Can't Allocate Redis Context";
        }

        exit(1);
    }

    std::cout << "Successfully connected to Redis";
    redisFree(c);

    return 0;
}