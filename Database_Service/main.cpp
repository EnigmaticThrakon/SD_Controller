#include <sqlite3.h>

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