#pragma once

#include <string>
#include "base/Data.h"

#define AGORA_APP_ID "174bb61eae7346d3a4f770b96b11a80c"
#define AGORA_TOKEN ""


class MediaPlayer
{
public:
    void stop();
    void open();
    void play();
    cc::Data getFrameData();
    /**
    * Returns a shared instance of the director.
    * @js _getInstance
    */
    static MediaPlayer* getInstance();

    /** @private */
    MediaPlayer();
    /** @private */
    ~MediaPlayer();
    bool init();
};
