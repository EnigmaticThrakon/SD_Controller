cmake_minimum_required(VERSION 3.18)
project(database_service VERSION 0.0 LANGUAGES CXX)

# Specifying the CPP standard to match the Redis++ CPP standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED)

# Creating the executable
add_executable(database_service main.cpp)

# Finding and linking the necessary Hiredis directories and libraries
find_path(HIREDIS_HEADER hiredis)
target_include_directories(database_service PUBLIC ${HIREDIS_HEADER})

find_library(HIREDIS_LIB hiredis)
target_link_libraries(database_service ${HIREDIS_LIB})

# Finding and linking the necessary Redis++ directories and libraries
find_path(REDIS_PLUS_PLUS_HEADER sw)
target_include_directories(database_service PUBLIC ${REDIS_PLUS_PLUS_HEADER})

find_library(REDIS_PLUS_PLUS_LIB redis++)
target_link_libraries(database_service ${REDIS_PLUS_PLUS_LIB})

# Adding the CMAKE module path to find SQLite libraries
set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

# Finding and linking the necessary SQLite libraries
find_package(sqlite3 REQUIRED)
target_link_libraries(database_service ${SQLITE3_LIBRARIES})

# Finding and linking the necessary PThreads libraries
set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)
target_link_libraries(database_service Threads::Threads)

# Finding and linking the necessary JsonCpp libraries
find_package(nlohmann_json REQUIRED)
target_link_libraries(database_service nlohmann_json::nlohmann_json)