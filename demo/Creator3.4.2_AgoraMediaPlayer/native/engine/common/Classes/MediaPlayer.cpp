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

void MediaPlayer::open()
{
    CC_LOG_INFO("MediaPlayer open");
    media_player_->open("rtmp://mobliestream.c3tv.com:554/live/goodtv.sdp", 0);
}

void MediaPlayer::play()
{
    CC_LOG_INFO("MediaPlayer play");
    media_player_->play();
}

cc::Data MediaPlayer::getFrameData()
{
    int witdh = 0;
    int height = 0;
    unsigned char* data = getOneFrame(witdh, height);
    if (data == nullptr || data[0]=='\0'){
        CC_LOG_INFO("MediaPlayer getFrameData null");
        
        return cc::Data::NULL_DATA;
    }

    CC_LOG_INFO("MediaPlayer getFrameData");
    
    cc::Data ret;
    unsigned char * cData = (unsigned char *) malloc(witdh * height * 4);
    memcpy(cData, data, witdh * height * 4);
    ret.fastSet(cData, witdh * height * 4);

    return ret;
}
