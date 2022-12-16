cmake_minimum_required(VERSION 3.18)
project(database_service VERSION 0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED)

add_executable(database_service main.cpp)

find_path(HIREDIS_HEADER hiredis)
target_include_directories(database_service PUBLIC ${HIREDIS_HEADER})

find_library(HIREDIS_LIB hiredis)
target_link_libraries(database_service ${HIREDIS_LIB})

find_path(REDIS_PLUS_PLUS_HEADER sw)
target_include_directories(database_service PUBLIC ${REDIS_PLUS_PLUS_HEADER})

find_library(REDIS_PLUS_PLUS_LIB redis++)
target_link_libraries(database_service ${REDIS_PLUS_PLUS_LIB})

set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)
# find_package(hiredis REQUIRED)
find_package(sqlite3 REQUIRED)

# if(NOT HIREDIS_FOUND)
#     message(STATUS "Could not find hiredis package")
# else()
#     message(STATUS "Found hiredis package")
# endif()

# if(NOT SQLITE3_FOUND)
#     message(STATUS "Could not find sqlite3 package")
# else()
#     message(STATUS "Found sqlite3 package")
# endif()

# add_executable(database_service main.cpp)
# target_link_libraries(database_service ${HIREDIS_LIBRARIES})
target_link_libraries(database_service ${SQLITE3_LIBRARIES})