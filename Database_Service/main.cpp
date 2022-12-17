#include <sqlite3.h>
#include <iostream>
#include <sw/redis++/redis++.h>
#include <pthread.h>
#include <nlohmann/json.hpp>
#include <fstream>
#include <vector>
#include <chrono>
#include <mutex>

using json = nlohmann::json;

sw::redis::Redis _redis_handler = sw::redis::Redis("tcp://127.0.0.1:6379?keep_alive=true");
sqlite3 *_database_handler;
char *_err_msg = 0;

std::mutex database_response_mutex;
std::string database_response;
const std::string _database_name = "AgerDevice.db";
const std::string _database_schema_file = "/home/pi/SD_Controller/Database_Service/table_schema.json";

bool _service_running = true;
std::string _current_run_id = "";
json _run_data_schema;

std::string parse_run_id(std::string run_id) {
    std::string parsed_run_id = run_id;
    int dash_index = 0;
    while ((dash_index = parsed_run_id.find('-')) != std::string::npos)
    {
        parsed_run_id.erase(dash_index, 1);
    }

    return parsed_run_id;
}

int callback(void *NotUsed, int argc, char **argv, char **azColName)
{
    database_response = std::string(argv[0]);
    database_response_mutex.unlock();

    return 0;
}

bool execute_command(const char *command)
{
    char *errorMessage;
    bool success;

    if (sqlite3_exec(_database_handler, command, callback, 0, &errorMessage) != SQLITE_OK)
    {
        success = false;
        printf("SQL Error: %s\n", errorMessage);
    }
    else
    {
        success = true;
        std::cout << "Command Executed Successfully: " << command << std::endl;
    }

    if (errorMessage)
        sqlite3_free(errorMessage);

    return success;
}

void create_table(std::string table_name, std::string table_type) {
    json parsed_table_schema;

    std::ifstream table_schema(_database_schema_file.c_str());
    table_schema >> parsed_table_schema;
    table_schema.close();

    std::string sql_command = "CREATE TABLE IF NOT EXISTS '" + table_name + "' (";
    std::vector<std::string> table_columns = parsed_table_schema[table_type]["columns"].get<std::vector<std::string>>();

    for(int i = 0; i < table_columns.size(); i++)
    {
        sql_command = sql_command + table_columns[i] + " " + parsed_table_schema[table_type][table_columns[i]].get<std::string>();

        if(i == 0) {
            sql_command = sql_command + " PRIMARY KEY, ";
        } else {
            sql_command = sql_command + ", ";
        }
    }

    sql_command.pop_back();
    sql_command.pop_back();

    sql_command = sql_command + ") WITHOUT ROWID;";
    execute_command(sql_command.c_str());
}

void initialize_new_run(std::string run_id) {
    if(_current_run_id.size() == 0)
    {
        _current_run_id = run_id;
        std::chrono::_V2::system_clock::time_point start_time = std::chrono::system_clock::now();
        std::string sql_command = "INSERT INTO Runs VALUES('" + run_id + "', '" + std::to_string(std::chrono::duration_cast<std::chrono::seconds>(start_time.time_since_epoch()).count()) + "', NULL, NULL, NULL);";

        execute_command(sql_command.c_str());

        std::string parsed_run_id = parse_run_id(run_id);
        create_table(parsed_run_id, "RunData");
    }

    _redis_handler.set("acquisition:started", "1");
}

void close_run() {
    _redis_handler.set("acquisition:started", "0");
    
    if(_current_run_id.size() != 0) {
        std::string sql_command = "SELECT COUNT(*) FROM '" + parse_run_id(_current_run_id) + "';";
        database_response_mutex.lock();

        execute_command(sql_command.c_str());

        database_response_mutex.lock();
        long num_entries = std::stol(database_response);
        database_response = "";
        database_response_mutex.unlock();

        sql_command = "SELECT StartTime FROM Runs WHERE Id='" + _current_run_id + "';";
        database_response_mutex.lock();

        execute_command(sql_command.c_str());
        int64_t start_time_unix = std::stol(database_response);
        database_response = "";
        database_response_mutex.unlock();

        std::chrono::_V2::system_clock::time_point end_time = std::chrono::system_clock::now();
        int64_t end_time_unix = std::chrono::duration_cast<std::chrono::seconds>(end_time.time_since_epoch()).count();

        int run_duration = end_time_unix - start_time_unix;
        sql_command = "UPDATE Runs SET EndTime=" + std::to_string(end_time_unix) + ", Duration=" + 
            std::to_string(run_duration) + ", NumEntries=" + std::to_string(num_entries) + " WHERE Id='" + _current_run_id + "';";

        execute_command(sql_command.c_str());
        _current_run_id = "";
    }
}

void parse_action(json command_json)
{
    if(command_json["category"] == "run") {
        if(command_json["command"] == "start") {
            initialize_new_run(command_json["rid"]);
        } else if(command_json["command"] == "stop")
            close_run();
    } else if(command_json["category"] == "action") {
        if(command_json["command"] == "shutdown") {
            _service_running = false;
        } else if(command_json["command"] == "get") {

        }
    }
}

void parse_data(json data_json)
{
    std::string sql_command = "INSERT INTO '" + parse_run_id(_current_run_id) + "' VALUES('" +
        data_json["timestamp"].get<std::string>() + "', '" + std::to_string(data_json["temperature"].get<double>()) + "', '" + 
        std::to_string(data_json["weight"].get<double>()) + "', '" + std::to_string(data_json["airFlow"].get<double>()) +
        "', '" + std::to_string(data_json["humidity"].get<double>()) + "', '" + std::to_string(data_json["door"].get<int>()) + "');";

    execute_command(sql_command.c_str());
}

void *listen_for_data(void *)
{
    sw::redis::Subscriber subscriber = _redis_handler.subscriber();

    subscriber.on_message([](std::string channel, std::string msg) {
        json parsed_msg = json::parse(msg);
        parse_data(parsed_msg);
    });

    subscriber.subscribe("live:data");

    while(_service_running)
    {
        try
        {
            subscriber.consume();
        }
        catch(const sw::redis::Error &err)
        {
            std::cout << "command error" << std::endl;
        }
    }

    return NULL;
}

void *listen_for_commands(void *)
{
    sw::redis::Subscriber subscriber = _redis_handler.subscriber();

    subscriber.on_message([](std::string channel, std::string msg) {
        json parsed_msg = json::parse(msg);
        parse_action(parsed_msg);
    });

    subscriber.subscribe("database:command");

    while(_service_running)
    {
        try
        {
            subscriber.consume();
        }
        catch(const sw::redis::Error &err)
        {
            std::cout << "command error" << std::endl;
        }
    }

    return NULL;
}

int main(int argc, char* argv[])
{
    //Pull the latest schema for the Run Data so it can be stored
    //  and referenced whenever live data is passed in from the PLC
    std::ifstream table_schema(_database_schema_file.c_str());
    table_schema >> _run_data_schema;
    table_schema.close();

    _run_data_schema = _run_data_schema["RunData"];

    //Open the database and check to ensure the database was successfully open
    if(sqlite3_open(_database_name.c_str(), &_database_handler)) 
    {
        std::cout << "Can't open database: " << sqlite3_errmsg(_database_handler);
        exit(1);
    }
    else
    {
        std::cout << "Opened database successfully" << std::endl;
        create_table("Runs", "Runs");
    }

    //Declare and start the thread to listen for the live data
    pthread_t data_thread;
    int data_thread_index = pthread_create(&data_thread, NULL, listen_for_data, NULL);

    //Declare and start the thread to listen for incoming commands
    pthread_t command_thread;
    int command_thread_index = pthread_create(&command_thread, NULL, listen_for_commands, NULL);

    //Join the threads when they complete
    pthread_join(data_thread, NULL);
    pthread_join(command_thread, NULL);

    //Close the database and complete the program
    sqlite3_close(_database_handler);
    return 0;
}

/*
Example JSON Package:
{
    "category":"run",
    "command":"new",
    "rid":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" or "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
 */