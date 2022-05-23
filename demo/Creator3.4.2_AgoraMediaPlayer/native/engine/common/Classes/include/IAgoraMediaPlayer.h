/*
 * @Author: your name
 * @Date: 2021-05-31 17:16:37
 * @LastEditTime: 2021-05-31 18:16:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /build/Volumes/wd/AgoraDemos/BigSdk_3.2.400/media_sdk_script/rte_sdk/interface/cpp/media_player_kit/IAgoraMediaPlayer.h
 */
//
//  Agora Rtc Engine SDK
//
//  Copyright (c) 2019 Agora.io. All rights reserved.
//

#ifndef AGORA_MEDIA_PLAYER_H_
#define AGORA_MEDIA_PLAYER_H_

#include "AgoraMediaBase.h"
#include "AgoraMediaPlayerTypes.h"

namespace agora {
namespace rtc {

/** Definition of MediaPlayerContext.
 */
struct MediaPlayerContext {
  /** User Context, i.e., activity context in Android.
   */
  bool enable_chat_voice_mode = false;
  void *context = nullptr;
};

class IMediaPlayerObserver;

/**
 * @brief Player interface
 *
 */
class IMediaPlayer {
 protected:
  virtual ~IMediaPlayer() = default;

 public:

  virtual int initialize(const MediaPlayerContext& context) = 0;

  /**
   * @brief Open media file
   *
   * @param src Media path, local path or network path
   * @param startPos Set the starting position for playback, in seconds
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int open(const char* src, int64_t startPos) = 0;

  /**
   * @brief Play
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int play() = 0;

  /**
   * @brief pause
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int pause() = 0;

  /**
   * @brief stop
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int stop() = 0;

  /**
   * @brief Play to a specified position
   *
   * @param pos The position to play, in seconds
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int seek(int64_t pos) = 0;

  /**
   * @brief Turn mute on or off
   *
   * @param mute Whether to mute on
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int mute(bool mute) = 0;

  /**
   * @brief Get mute state
   *
   * @param[out] mute Whether is mute on
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int getMute(bool& mute) = 0;

  /**
   * @brief Adjust playback volume
   *
   * @param volume The volume value to be adjusted
   * The volume can be adjusted from 0 to 400:
   * 0: mute;
   * 100: original volume;
   * 400: Up to 4 times the original volume (with built-in overflow protection).
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int adjustPlayoutVolume(int volume) = 0;

  /**
   * @brief Get the current playback volume
   *
   * @param[out] volume
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int getPlayoutVolume(int& volume) = 0;

  /**
   * @brief Get media duration
   *
   * @param[out] duration Duration in seconds
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int getDuration(int64_t& duration) = 0;

  /**
   * @brief Get the current playback progress
   *
   * @param[out] pos Progress in milliseconds
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int getPlayPosition(int64_t& pos) = 0;

  /**
   * @brief Get the streams info count in the media
   *
   * @param[out] count
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int getStreamCount(int64_t& count) = 0;

  /**
   * @brief Get the streams info by index
   *
   * @param[in] index, index
   * @param[out] info, stream info for return
   */
  virtual int getStreamInfo(int64_t index, media::base::MediaStreamInfo* info) = 0;

  /**
   * @brief Get player state
   *
   * @return PLAYER_STATE
   */
  virtual media::base::MEDIA_PLAYER_STATE getState() = 0;

  /**
   * @brief Set video rendering view
   *
   * @param view view object, windows platform is HWND
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int setView(media::base::view_t view) = 0;

  /**
   * @brief Set video display mode
   *
   * @param renderMode Video display mode
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int setRenderMode(media::base::RENDER_MODE_TYPE renderMode) = 0;

  /**
   * @brief Register the player observer
   *
   * @param observer observer object
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int registerPlayerObserver(IMediaPlayerObserver* observer) = 0;

  /**
   * @brief Unregister the player observer
   *
   * @param observer observer object
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int unregisterPlayerObserver(IMediaPlayerObserver* observer) = 0;

  /**
   * @brief Register the player video observer
   *
   * @param observer observer object
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int registerVideoFrameObserver(media::base::IVideoFrameObserver* observer) = 0;

  /**
   * @brief UnRegister the player video observer
   *
   * @param observer observer object
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int unregisterVideoFrameObserver(agora::media::base::IVideoFrameObserver* observer) = 0;

  /**
   * @brief register the player audio observer
   *
   * @param observer observer object
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int registerAudioFrameObserver(media::base::IAudioFrameObserver* observer) = 0;

  /**
   * @brief Unregister the player audio observer
   *
   * @param observer observer object
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int unregisterAudioFrameObserver(agora::media::base::IAudioFrameObserver* observer) = 0;

  /**
   * @brief This method starts connecting to an Agora Channel
   * @param token The token to join the channel, if this is set to NULL, appID
   * passed in IAgoraService::initialize() will be used as static key.
   * @param channelId The identifier of channel specifies which channel you wish
   * to join.
   * @param userId Your identifier as local user. If a *uid* is not assigned (or set to null),
   * the SDK will return a *uid* in the IRtcConnection::onConnected "onConnected" callback.
   * The application must record and maintain the returned *uid* since the SDK does not do so.
   */
  virtual int connect(const char* token, const char* channelId, media::base::user_id_t userId) = 0;

  /** This method disconnects the current connection to the channel.
   * If this method returns successfully, the Connection state will change to
   * STATE_DISCONNECTED. You will be notified with the event onDisconnected().
   */
  virtual int disconnect() = 0;

  /**
   * @brief publish video stream
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int publishVideo() = 0;

  /**
   * @brief unpublish video stream
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int unpublishVideo() = 0;

  /**
   * @brief publish audio stream
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int publishAudio() = 0;

  /**
   * @brief unpublish audio stream
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int unpublishAudio() = 0;

  /**
   * @brief adjust publish signal volume
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int adjustPublishSignalVolume(int volume) = 0;

  /**
   * @brief change log file position
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int setLogFile(const char* filePath) = 0;

  /**
   * Sets the output log level of the SDK.
   *
   * You can use one or a combination of the filters. The log level follows the
   * sequence of `OFF`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`, and `DEBUG`. Choose a l
evel
   * and you will see logs preceding that level. For example, if you set the log level
to
   * `WARNING`, you see the logs within levels `CRITICAL`, `ERROR`, and `WARNING`.
   *
   * @param filter Sets the log filter level:
   * - LOG_FILTER_DEBUG (0x80f): Output all API logs. Set your log filter as DEBUG
   * if you want to get the most complete log file.
   * - LOG_FILTER_INFO (0x0f): Output logs of the CRITICAL, ERROR, WARNING, and INFO
   * level. We recommend setting your log filter as this level.
   * - LOG_FILTER_WARNING (0x0e): Output logs of the CRITICAL, ERROR, and WARNING level.
   * - LOG_FILTER_ERROR (0x0c): Output logs of the CRITICAL and ERROR level.
   * - LOG_FILTER_CRITICAL (0x08): Output logs of the CRITICAL level.
   * - LOG_FILTER_OFF (0): Do not output any log.
   *
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int setLogFilter(unsigned int filter) = 0;

  /**
   * @brief change playback speed
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int changePlaybackSpeed(media::base::MEDIA_PLAYER_PLAYBACK_SPEED speed) = 0;

  /**
   * @brief change audio track
   *
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int selectAudioTrack(int index) = 0;

     /**
   * @brief modify player option before play,
   * @param [in] key
   *        the option key name
   * @param [in] value
   *        the option value
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int setPlayerOption(const char *key ,int value) = 0;

    /**
   * @brief modify player option before play,
   * @param [in] key
   *        the option key name
   * @param [string] value
   *        the option value
   * @return int <= 0 On behalf of an error, the value corresponds to one of PLAYER_ERROR
   */
  virtual int setPlayerOption(const char *key ,const char *value) = 0;

  /**
   * take a screenshot while play a video
   * @param [in] filename, the filename of screenshot file
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int takeScreenshot(const char* filename) = 0;

  /**
   * select internal subtitles in video
   * @param [in] index, the index of the internal subtitles
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int selectInternalSubtitle(int index) = 0;

  /**
   * set an external subtitle for video
   * @param [in] url, The URL of the subtitle file that you want to load.
   * @return int < 0 on behalf of an error, the value corresponds to one of MEDIA_PLAYER_ERROR
   */
  virtual int setExternalSubtitle(const char* url) = 0;

  /**
   * Sets whether to loop the media file for playback.
   * @param loopCount the number of times looping the media file.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */

  virtual int setLoopCount(int loopCount) = 0;
  /**
    * get sdk version and build number of player SDK.
    * @return String of the SDK version.
   */

  virtual const char* getPlayerSdkVersion() = 0;
  /**
   * @brief release IMediaPlayer object.
   *
   */
  
  /**
   * @description: 
   * @param src  need switch src
   * @param syncPts sync timestamp
     * @return
   * - 0: Success.
   * - < 0: Failure.
   */  
  virtual int switchSrc(const char* src, bool syncPts = true) = 0;
  
  /**
   * @description: 
   * @param char preloadSrc
   * @param startPos start timestamp
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */  
  virtual int addPreloadSrc(const char* src, int64_t startPos) = 0;

  /**
   * @description: 
   * @param src playPreload
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int playPreload(const char* src) = 0;
  

  virtual void release(bool sync = true) = 0;
};

class IMediaPlayerObserver {
 public:
  /**
   * @brief Triggered when the player state changes
   *
   * @param state New player state
   * @param ec Player error message
   */
  virtual void onPlayerStateChanged(media::base::MEDIA_PLAYER_STATE state,
                                    media::base::MEDIA_PLAYER_ERROR ec) = 0;

  /**
   * @brief Triggered when the player progress changes, once every 1 millisecond
   *
   * @param position Current playback progress, in millisecond
   */
  virtual void onPositionChanged(const int64_t position_ms) = 0;

  /**
   * @brief Triggered when the player have some event
   *
   * @param event
   */
  virtual void onPlayerEvent(media::base::MEDIA_PLAYER_EVENT event) = 0;

  /**
   * @brief Triggered when metadata is obtained
   *
   * @param type Metadata type
   * @param data data
   * @param length  data length
   */
  virtual void onMetadata(media::base::MEDIA_PLAYER_METADATA_TYPE type, const uint8_t* data,
                                  uint32_t length) = 0;

  /**
   * @brief Triggered when the player addPreloadSrc
   *
   * @param event
   */
  virtual void onPreloadEvent(const char* src, media::base::PLAYER_PRELOAD_EVENT event) = 0;

  /**
   * @brief Triggered when play buffer updated, once every 1 second
   *
   * @param int cached buffer during playing, in milliseconds
   */
  virtual void onPlayBufferUpdated(int64_t playCachedBuffer) = 0;

  /**
   * @brief Triggered when media file are played once
   */
  virtual void onCompleted() = 0;

  virtual ~IMediaPlayerObserver() {}
};

}  // namespace rtc
}  // namespace agora

#if defined(_WIN32)

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif // WIN32_LEAN_AND_MEAN

#include <windows.h>
#define AGORA_PLAYER_API extern "C"
#define AGORA_PLAYER_CALL

#elif defined(__APPLE__)

#include <TargetConditionals.h>
#define AGORA_PLAYER_API __attribute__((visibility("default"))) extern "C"
#define AGORA_PLAYER_CALL

#elif defined(__ANDROID__) || defined(__linux__)

#define AGORA_PLAYER_API extern "C" __attribute__((visibility("default")))
#define AGORA_PLAYER_CALL

#else

#define AGORA_PLAYER_API extern "C"
#define AGORA_PLAYER_CALL

#endif

/**
 * Creates an Agora media player object and returns the pointer.
 * @return
 * - The pointer to \ref rtc::IMediaPlayer "IMediaPlayer", if the method call succeeds.
 * - The empty pointer NULL, if the method call fails.
 */
AGORA_PLAYER_API agora::rtc::IMediaPlayer* AGORA_PLAYER_CALL createAgoraMediaPlayer();

#endif  // AGORA_MEDIA_PLAYER_H_
