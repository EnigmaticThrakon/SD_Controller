cmake_minimum_required(VERSION 3.18)
project(database_service VERSION 0.0 LANGUAGES CXX)

set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)
find_package(hiredis REQUIRED)
find_package(sqlite3 REQUIRED)

if(NOT HIREDIS_FOUND)
    message(STATUS "Could not find hiredis package")
else()
    message(STATUS "Found hiredis package")
endif()

if(NOT SQLITE3_FOUND)
    message(STATUS "Could not find sqlite3 package")
else()
    message(STATUS "Found sqlite3 package")
endif()

add_executable(database_service main.cpp)
target_link_libraries(database_service ${HIREDIS_LIBRARIES})
target_link_libraries(database_service ${SQLITE3_LIBRARIES})