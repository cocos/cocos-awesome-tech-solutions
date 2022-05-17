#include <jni.h>
#include <string>
#include <android/native_window_jni.h>
#include "AgoraMediaBase.h"
#include "IAgoraMediaPlayer.h"
#include <thread>
#include <iostream>

#include <stdio.h>
#include <stdlib.h>

#include <sstream>
#include <mutex>

//#include "./HelloWorldScene.h"

//extern HelloWorld* test;

#ifdef ANDROID
#include <thread>
#include <android/log.h>
#define XLOGD(...) __android_log_print(ANDROID_LOG_DEBUG,"[player_cpp]",__VA_ARGS__)
#define XLOGI(...) __android_log_print(ANDROID_LOG_INFO,"[player_cpp]",__VA_ARGS__)
#define XLOGW(...) __android_log_print(ANDROID_LOG_WARN,"[player_cpp]",__VA_ARGS__)
#define XLOGE(...) __android_log_print(ANDROID_LOG_ERROR,"[player_cpp]",__VA_ARGS__)
#else
#include <stdio.h>
#define XLOGD(format, ...) printf("[player_cpp][DEBUG][%s][%d]: " format "\n", __FUNCTION__,\
                            __LINE__, ##__VA_ARGS__)
#define XLOGI(format, ...) printf("[player_cpp][INFO][%s][%d]: " format "\n", __FUNCTION__,\
                            __LINE__, ##__VA_ARGS__)
#define XLOGW(format, ...) printf("[player_cpp][WARN][%s][%d]: " format "\n", __FUNCTION__,\
                            __LINE__, ##__VA_ARGS__)
#define XLOGE(format, ...) printf("[player_cpp][ERROR][%s][%d]: " format "\n", __FUNCTION__,\
                            __LINE__, ##__VA_ARGS__)
#endif

static unsigned char* frame_data = nullptr;
static int frame_width = 0;
static int frame_height = 0;
static std::mutex safe;

unsigned char* I420ToRGB(unsigned char* src, int width, int height){
    const int R = 0;
    const int G = 1;
    const int B = 2;
    const int A = 3;

    int numOfPixel = width * height;
    int positionOfU = numOfPixel;
    int positionOfV = numOfPixel/4 + numOfPixel;
    unsigned char* rgba = new unsigned char[numOfPixel*4];

    for(int i=0; i<height; i++){
        int startY = i*width;
        int step = (i/2)*(width/2);
        int startU = positionOfV + step;
        int startV = positionOfU + step;
        for(int j = 0; j < width; j++){
            int Y = startY + j;
            int V = startV + j/2;
            int U = startU + j/2;
            int index = Y*4;
            rgba[index+B] = (unsigned char)((src[Y]&0xff) + 1.4075 * ((src[V]&0xff)-128));
            rgba[index+G] = (unsigned char)((src[Y]&0xff) - 0.3455 * ((src[U]&0xff)-128) - 0.7169*((src[V]&0xff)-128));
            rgba[index+R] = (unsigned char)((src[Y]&0xff) + 1.779 * ((src[U]&0xff)-128));
            rgba[index+A] = 255;
        }
    }

    return rgba;
}

extern unsigned char* getOneFrame(int& width, int& height) {
    safe.lock();
    width = frame_width;
    height = frame_height;
    unsigned char* ret = frame_data;
    frame_data = nullptr;
    safe.unlock();
    return ret;
}

static JavaVM *gJVM = nullptr;

class AndroidAgoraPlayerObserver : public agora::rtc::IMediaPlayerObserver,
                                   public agora::media::base::IVideoFrameObserver,
                                   public agora::media::base::IAudioFrameObserver {
public:

    void onPlayerStateChanged(agora::media::base::MEDIA_PLAYER_STATE state,
                              agora::media::base::MEDIA_PLAYER_ERROR ec) override {
        std::stringstream iout;
        iout << "onPlayerStateChanged " << state << "," << ec;
//        test->updateMsgContent(iout.str().c_str());
        // XLOGI("onPlayerStateChanged %d,%d",state,ec);
    };

    void onPositionChanged(const int64_t position) override {
        std::stringstream iout;
        iout << "onPositionChanged " << position;
//        test->updateMsgContent(iout.str().c_str());
        // XLOGI("onPositionChanged %lld",position);
    }

    void onPlayerEvent(agora::media::base::MEDIA_PLAYER_EVENT event) override {
        std::stringstream iout;
        iout << "onPlayerEvent " << event;
//        test->updateMsgContent(iout.str().c_str());
        // XLOGI("onPlayerEvent %d",event);
    }

    void onMetadata(agora::media::base::MEDIA_PLAYER_METADATA_TYPE type, const uint8_t* data, uint32_t length) override {
        std::stringstream iout;
        iout << "onMetadata " << type;
//        test->updateMsgContent(iout.str().c_str());
        // XLOGI("onMetadata %d %d %s",type,length,data);
    }

    void onPreloadEvent(const char* src, agora::media::base::PLAYER_PRELOAD_EVENT event) override {}

    void onPlayBufferUpdated(int64_t playCachedBuffer) override {}

    void onCompleted() override {}

public:

    void onFrame(const agora::media::base::VideoFrame* frame) {
        XLOGI("onFrame video %d,%d,%d,%d,%lld", frame->type, frame->yStride, frame->height, frame->width, frame->renderTimeMs);
        safe.lock();
        if (frame_data != nullptr) {
            safe.unlock();
            return;
        }
        frame_data = I420ToRGB(frame->yBuffer, frame->width, frame->height);
        frame_width = frame->width;
        frame_height = frame->height;
        safe.unlock();
    }

    void onFrame(const agora::media::base::AudioPcmFrame* frame) {
        // XLOGI("onFrame audio %d,%d,%d,%d,%d", frame->samples_per_channel_, frame->sample_rate_hz_, frame->num_channels_, frame->bytes_per_sample, frame->capture_timestamp);
    }
};

AndroidAgoraPlayerObserver *observer_ = new AndroidAgoraPlayerObserver();
agora::rtc::IMediaPlayer* media_player_ = nullptr;

extern "C"
JNIEXPORT void JNICALL
Java_io_agora_mediaplayer_PlayerCppFragment_initMediaPlayerCpp(JNIEnv *env,jobject thiz, jobject context) {
    XLOGI("initMediaPlayerCpp");
    jobject m_app_context = (jobject)env->NewGlobalRef(context);
    media_player_ = createAgoraMediaPlayer();
    agora::rtc::MediaPlayerContext context_android;
    context_android.context = m_app_context;
    media_player_->initialize(context_android);
    media_player_->registerPlayerObserver(observer_);
    media_player_->registerVideoFrameObserver(observer_);
    media_player_->registerAudioFrameObserver(observer_);
}

extern "C"
JNIEXPORT void JNICALL
Java_io_agora_mediaplayer_PlayerCppFragment_setViewMediaPlayerCpp(JNIEnv *env,jobject thiz,jobject video_view) {
    XLOGI("setViewMediaPlayerCpp");
    jobject m_view = env->NewGlobalRef(video_view);
    media_player_->setView(m_view);
}
