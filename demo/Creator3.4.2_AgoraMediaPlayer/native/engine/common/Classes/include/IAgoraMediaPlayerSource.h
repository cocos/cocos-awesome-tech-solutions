//
//  Agora SDK
//
//  Copyright (c) 2018 Agora.io. All rights reserved.
//
#pragma once  // NOLINT(build/header_guard)

#include "AgoraBase.h"
#include "AgoraMediaBase.h"
#include "AgoraMediaPlayerTypes.h"
#include "AgoraRefPtr.h"

namespace agora {
namespace rtc {

class IMediaPlayerSourceObserver;
class IPreRenderFrameObserver;
/**
 * The IMediaPlayerSource class provides access to a media player source. To playout multiple media sources simultaneously,
 * create multiple media player source objects.
 */
class IMediaPlayerSource : public RefCountInterface {
protected:
  virtual ~IMediaPlayerSource() = default;

public:

  /**
   * Get unique source id of the media player source.
   * @return
   * - >= 0: The source id of this media player source.
   * - < 0: Failure.
   */
  virtual int getSourceId() const = 0;

  /**
   * Opens a media file with a specified URL.
   * @param url The URL of the media file that you want to play.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int open(const char* url, int64_t startPos) = 0;

  /**
   * Plays the media file.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int play() = 0;

  /**
   * Pauses playing the media file.
   */
  virtual int pause() = 0;

  /**
   * Stops playing the current media file.
   */
  virtual int stop() = 0;

  /**
   * Resumes playing the media file.
   */
  virtual int resume() = 0;

  /**
   * Sets the current playback position of the media file.
   * @param newPos The new playback position (ms).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int seek(int64_t newPos) = 0;

  /**
   * Gets the duration of the media file.
   * @param duration A reference to the duration of the media file.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int getDuration(int64_t& duration) = 0;

  /**
   * Gets the current playback position of the media file.
   * @param currentPosition A reference to the current playback position (ms).
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int getPlayPosition(int64_t& pos) = 0;

  virtual int getStreamCount(int64_t& count) = 0;

  virtual int getStreamInfo(int64_t index, media::base::MediaStreamInfo* info) = 0;

  /**
   * Sets whether to loop the media file for playback.
   * @param loopCount the number of times looping the media file.
   * - 0: Play the audio effect once.
   * - 1: Play the audio effect twice.
   * - -1: Play the audio effect in a loop indefinitely, until stopEffect() or stop() is called.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int setLoopCount(int loopCount) = 0;

  /**
   * Change playback speed
   * @param speed the enum of playback speed
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int changePlaybackSpeed(media::base::MEDIA_PLAYER_PLAYBACK_SPEED speed) = 0;

  /**
   * Slect playback audio track of the media file
   * @param speed the index of the audio track in meia file
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int selectAudioTrack(int index) = 0;

  /**
   * change player option before play a file
   * @param key the key of the option param
   * @param value the value of option param
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int setPlayerOption(const char* key, int value) = 0;

  /**
   * change player option before play a file
   * @param key the key of the option param
   * @param value the value of option param
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int setPlayerOption(const char* key, const char* value) = 0;
  /**
   * take screenshot while playing  video
   * @param filename the filename of screenshot file
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int takeScreenshot(const char* filename) = 0;

  /**
   * select internal subtitles in video
   * @param index the index of the internal subtitles
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int selectInternalSubtitle(int index) = 0;

  /**
   * set an external subtitle for video
   * @param url The URL of the subtitle file that you want to load.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int setExternalSubtitle(const char* url) = 0;

  virtual media::base::MEDIA_PLAYER_STATE getState() = 0;

  /**
   * Registers a media player source observer.
   *
   * Once the media player source observer is registered, you can use the observer to monitor the state change of the media player.
   * @param observer The pointer to the IMediaPlayerSourceObserver object.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int registerPlayerSourceObserver(IMediaPlayerSourceObserver* observer) = 0;

  /**
   * Releases the media player source observer.
   * @param observer The pointer to the IMediaPlayerSourceObserver object.
   * @return
   * - 0: Success.
   * - < 0: Failure.
   */
  virtual int unregisterPlayerSourceObserver(IMediaPlayerSourceObserver* observer) = 0;

  virtual int registerPreRenderFrameObserver(IPreRenderFrameObserver* observer) = 0;

  virtual int unregisterPreRenderFrameObserver(IPreRenderFrameObserver* observer) = 0;
};

class IMediaPlayerSourceObserver {
 public:
  virtual ~IMediaPlayerSourceObserver() = default;

  /**
   * @brief Triggered when the player state changes
   *
   * @param state New player state
   * @param ec Player error message
   */
  virtual void onPlayerSourceStateChanged(media::base::MEDIA_PLAYER_STATE state,
                                          media::base::MEDIA_PLAYER_ERROR ec) = 0;

  /**
   * @brief Triggered when the player progress changes, once every 1 millisecond
   *
   * @param position Current playback progress, in millisecond
   */
  virtual void onPositionChanged(int64_t position_ms) = 0;

  /**
   * @brief Triggered when the player have some event
   *
   * @param event
   */
  virtual void onPlayerEvent(media::base::MEDIA_PLAYER_EVENT event) = 0;

  /**
   * @brief Triggered when meta data is obtained
   *
   * @param data meta data
   * @param length meta data length
   */
  virtual void onMetaData(const void* data, int length) = 0;

  /**
   * @brief Triggered when play buffer updated, once every 1 second
   *
   * @param int cached buffer during playing, in milliseconds
   */
  virtual void onPlayBufferUpdated(int64_t playCachedBuffer) = 0;

  /**
   * @brief Triggered when the player addPreloadSrc
   *
   * @param event
   */
  virtual void onPreloadEvent(const char* src, media::base::PLAYER_PRELOAD_EVENT event) = 0;

  /**
   * @brief Triggered when media file are played once
   */
  virtual void onCompleted() = 0;
};

} //namespace rtc
} // namespace agora
