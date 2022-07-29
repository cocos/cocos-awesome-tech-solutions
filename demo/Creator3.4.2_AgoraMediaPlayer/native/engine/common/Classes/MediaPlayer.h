#pragma once

#include <string>
#include "base/Data.h"

#define AGORA_APP_ID "174bb61eae7346d3a4f770b96b11a80c"
#define AGORA_TOKEN ""


class MediaPlayer
{
public:
    void stop();
    void open(const char* url);
    void play();
    void getFrameData(void* ptr, size_t len, int& width, int& height);
    static MediaPlayer* getInstance();
    MediaPlayer();
    ~MediaPlayer();
    bool init();
};
