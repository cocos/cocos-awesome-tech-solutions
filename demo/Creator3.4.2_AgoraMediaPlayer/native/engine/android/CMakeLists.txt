cmake_minimum_required(VERSION 3.8)

option(APP_NAME "Project Name" "AgoraMediaPlayer")
project(${APP_NAME} CXX)

include(${CMAKE_CURRENT_LIST_DIR}/../common/CMakeLists.txt)


set(LIB_NAME cocos)

set(PROJ_SOURCES
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/Game.h
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/Game.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/AgoraPlayer.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/MediaPlayer.h
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/MediaPlayer.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/jsb_player_auto.h
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/jsb_player_auto.cpp
    ${CMAKE_CURRENT_LIST_DIR}/jni/main.cpp
)



# -------------- SRART ---------------
# USED BY COCOS SERVICE, DON'T REMOVE!
if(EXISTS ${RES_DIR}/proj/service.cmake)
    set(SERVICE_NATIVE_DIR ${CMAKE_CURRENT_LIST_DIR})
    include(${RES_DIR}/proj/service.cmake)
endif()
# --------------  END ----------------

add_library(${LIB_NAME} SHARED ${PROJ_SOURCES})
target_include_directories(${LIB_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/include)

# -------------- SRART ---------------
# USED BY COCOS SERVICE, DON'T REMOVE!
if(COMMAND service_insert_library)
    service_insert_library()
endif()
# --------------  END ----------------

target_link_libraries(${LIB_NAME}
    "-Wl,--whole-archive" cocos2d_jni "-Wl,--no-whole-archive"
    cocos2d
    ${CMAKE_CURRENT_LIST_DIR}/../android/app/libs/${ANDROID_ABI}/libAgoraMediaPlayer.so
    ${CMAKE_CURRENT_LIST_DIR}/../android/app/libs/${ANDROID_ABI}/libagora-player-ffmpeg.so
)

target_include_directories(${LIB_NAME} PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes
)
