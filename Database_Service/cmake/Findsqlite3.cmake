# Try to find sqlite3
# Once done, this will define
#
# SQLITE3_FOUND        - system has sqlite3
# SQLITE3_INCLUDE_DIRS - sqlite3 include directories
# SQLITE3_LIBRARIES    - libraries need to use sqlite3

if(SQLITE3_INCLUDE_DIRS AND SQLITE3_LIBRARIES)
  set(SQLITE3_FIND_QUIETLY TRUE)
else()
  find_path(
    SQLITE3_INCLUDE_DIR
    NAMES sqlite3.h
    HINTS ${SQLITE3_ROOT_DIR}
    PATH_SUFFIXES include)

  find_library(
    SQLITE3_LIBRARY
    NAMES sqlite3
    HINTS ${SQLITE3_ROOT_DIR}
    PATH_SUFFIXES ${CMAKE_INSTALL_LIBDIR})

  set(SQLITE3_INCLUDE_DIRS ${SQLITE3_INCLUDE_DIR})
  set(SQLITE3_LIBRARIES ${SQLITE3_LIBRARY})

  include (FindPackageHandleStandardArgs)
  find_package_handle_standard_args(
    sqlite3 DEFAULT_MSG SQLITE3_LIBRARY SQLITE3_INCLUDE_DIR)

  mark_as_advanced(SQLITE3_LIBRARY SQLITE3_INCLUDE_DIR)
endif()