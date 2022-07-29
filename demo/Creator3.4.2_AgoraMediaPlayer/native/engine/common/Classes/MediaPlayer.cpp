#include <base/Log.h>
#include <IAgoraMediaPlayer.h>
#include <GLES2/gl2.h>
#include "MediaPlayer.h"
#include "base/Data.h"

extern agora::rtc::IMediaPlayer* media_player_;

// singleton stuff
static MediaPlayer *s_SharedMediaPlayer = nullptr;

MediaPlayer::MediaPlayer()
{
    CC_LOG_INFO("Construct MediaPlayer %p", this);
    init();
}

MediaPlayer::~MediaPlayer()
{
    CC_LOG_INFO("Destruct MediaPlayer %p", this);
    s_SharedMediaPlayer = nullptr;
}

MediaPlayer* MediaPlayer::getInstance()
{
    if (!s_SharedMediaPlayer)
    {
        CC_LOG_INFO("getInstance MediaPlayer ");
        s_SharedMediaPlayer = new (std::nothrow) MediaPlayer();
//        CCASSERT(s_SharedMediaPlayer, "FATAL: Not enough memory for create MediaPlayer");
    }

    return s_SharedMediaPlayer;
}

bool MediaPlayer::init(void)
{
    CC_LOG_INFO("init MediaPlayer ");

    return true;
}

extern unsigned char* getOneFrame(int& width, int& height);

void MediaPlayer::stop()
{
    CC_LOG_INFO("MediaPlayer stop");
    media_player_->stop();
}

void MediaPlayer::open(const char* url)
{
    CC_LOG_INFO("MediaPlayer open");
    media_player_->open(url, 0);
}

void MediaPlayer::play()
{
    CC_LOG_INFO("MediaPlayer play");
    media_player_->play();
}

void MediaPlayer::getFrameData(void* ptr, size_t len, int& width, int& height)
{
    unsigned char* data = getOneFrame(width, height);
    if (data == nullptr){
        width = 0;
        height = 0;
        return;
    }
    memcpy(ptr, data, width * height * 4);
    delete[] data;
}
