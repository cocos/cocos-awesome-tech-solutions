//
//  Agora Engine SDK
//
//  Created by Sting Feng in 2020-05.
//  Copyright (c) 2017 Agora.io. All rights reserved.

#pragma once  // NOLINT(build/header_guard)

#include <stdint.h>

/**
 * set analyze duration for real time stream
 * @example "setPlayerOption(KEY_PLAYER_REAL_TIME_STREAM_ANALYZE_DURATION,1000000)"
 */
#define KEY_PLAYER_REAL_TIME_STREAM_ANALYZE_DURATION    "analyze_duration"

/**
 * make the player to enable audio or not
 * @example  "setPlayerOption(KEY_PLAYER_ENABLE_AUDIO,0)"
 */
#define KEY_PLAYER_ENABLE_AUDIO                  "enable_audio"

/**
 * make the player to enable video or not
 * @example  "setPlayerOption(KEY_PLAYER_ENABLE_VIDEO,0)"
 */
#define KEY_PLAYER_ENABLE_VIDEO                  "enable_video"

/**
 * set the player enable to search metadata
 * @example  "setPlayerOption(KEY_PLAYER_DISABLE_SEARCH_METADATA,0)"
 */
#define KEY_PLAYER_ENABLE_SEARCH_METADATA         "enable_search_metadata"

/**
 * set the player sei metadata filter type
 * @example  "setPlayerOption(KEY_PLAYER_SEI_FILTER_TYPE,"5,100")"
 */
#define KEY_PLAYER_SEI_FILTER_TYPE         "set_sei_filter_type"
namespace agora {

namespace media {

namespace base {
static const uint8_t kMaxCharBufferLength = 50;
/**
 * @brief Player state
 *
 */
enum MEDIA_PLAYER_STATE {
  /** Player idle
   */
  PLAYER_STATE_IDLE = 0,
  /** Opening media file
   */
  PLAYER_STATE_OPENING,
  /** Media file opened successfully
   */
  PLAYER_STATE_OPEN_COMPLETED,
  /** Player playing
   */
  PLAYER_STATE_PLAYING,
  /** Player paused
   */
  PLAYER_STATE_PAUSED,
  /** Player playback one loop completed
   */
  PLAYER_STATE_PLAYBACK_COMPLETED,
  /** Player playback all loops completed
   */
  PLAYER_STATE_PLAYBACK_ALL_LOOPS_COMPLETED,
  /** Player stopped
   */
  PLAYER_STATE_STOPPED = PLAYER_STATE_IDLE,
  /** Player pausing (internal)
   */
  PLAYER_STATE_PAUSING_INTERNAL = 50,
  /** Player stopping (internal)
   */
  PLAYER_STATE_STOPPING_INTERNAL,
  /** Player seeking state (internal)
   */
  PLAYER_STATE_SEEKING_INTERNAL,
  /** Player getting state (internal)
   */
  PLAYER_STATE_GETTING_INTERNAL,
  /** None state for state machine (internal)
   */
  PLAYER_STATE_NONE_INTERNAL,
  /** Do nothing state for state machine (internal)
   */
  PLAYER_STATE_DO_NOTHING_INTERNAL,
  /** Player failed
   */
  PLAYER_STATE_FAILED = 100,
};
/**
 * @brief Player error code
 *
 */
enum MEDIA_PLAYER_ERROR {
  /** No error
   */
  PLAYER_ERROR_NONE = 0,
  /** The parameter is incorrect
   */
  PLAYER_ERROR_INVALID_ARGUMENTS = -1,
  /** Internel error
   */
  PLAYER_ERROR_INTERNAL = -2,
  /** No resource error
   */
  PLAYER_ERROR_NO_RESOURCE = -3,
  /** Media source is invalid
   */
  PLAYER_ERROR_INVALID_MEDIA_SOURCE = -4,
  /** Unknown stream type
   */
  PLAYER_ERROR_UNKNOWN_STREAM_TYPE = -5,
  /** Object is not initialized
   */
  PLAYER_ERROR_OBJ_NOT_INITIALIZED = -6,
  /** Decoder codec not supported
   */
  PLAYER_ERROR_CODEC_NOT_SUPPORTED = -7,
  /** Video renderer is invalid
   */
  PLAYER_ERROR_VIDEO_RENDER_FAILED = -8,
  /** Internal state error
   */
  PLAYER_ERROR_INVALID_STATE = -9,
  /** Url not found
   */
  PLAYER_ERROR_URL_NOT_FOUND = -10,
  /** Invalid connection state
   */
  PLAYER_ERROR_INVALID_CONNECTION_STATE = -11,
  /** Insufficient buffer data
   */
  PLAYER_ERROR_SRC_BUFFER_UNDERFLOW = -12,
};

/**
 * @brief Playback speed type
 *
 */
enum MEDIA_PLAYER_PLAYBACK_SPEED {
  /** original playback speed
   */
  PLAYBACK_SPEED_ORIGINAL = 100,
  /** playback speed slow down to 0.5
 */
  PLAYBACK_SPEED_50_PERCENT = 50,
  /** playback speed slow down to 0.75
   */
  PLAYBACK_SPEED_75_PERCENT = 75,
  /** playback speed speed up to 1.25
   */
  PLAYBACK_SPEED_125_PERCENT = 125,
  /** playback speed speed up to 1.5
   */
  PLAYBACK_SPEED_150_PERCENT = 150,
    /** playback speed speed up to 2.0
   */
  PLAYBACK_SPEED_200_PERCENT = 200,
};

/**
 * @brief Media stream type
 *
 */
enum MEDIA_STREAM_TYPE {
  /** Unknown stream type
   */
  STREAM_TYPE_UNKNOWN = 0,
  /** Video stream
   */
  STREAM_TYPE_VIDEO = 1,
  /** Audio stream
   */
  STREAM_TYPE_AUDIO = 2,
  /** Subtitle stream
   */
  STREAM_TYPE_SUBTITLE = 3,
};

/**
 * @brief Player event
 *
 */
enum MEDIA_PLAYER_EVENT {
  /** player seek begin
   */
  PLAYER_EVENT_SEEK_BEGIN = 0,
  /** player seek complete
   */
  PLAYER_EVENT_SEEK_COMPLETE = 1,
  /** player seek error
   */
  PLAYER_EVENT_SEEK_ERROR = 2,
  /** player video published
   */
  PLAYER_EVENT_VIDEO_PUBLISHED = 3,
  /** player audio published
   */
  PLAYER_EVENT_AUDIO_PUBLISHED = 4,
  /** player audio track changed
   */
  PLAYER_EVENT_AUDIO_TRACK_CHANGED = 5,
    /** player buffer low
   */
  PLAYER_EVENT_BUFFER_LOW = 6,
    /** player buffer recover
   */
  PLAYER_EVENT_BUFFER_RECOVER = 7,
  /** switch source begin
  */
  PLAYER_EVENT_SWITCH_BEGIN = 8,
  /** switch source complete
  */
  PLAYER_EVENT_SWITCH_COMPLETE = 9,
  /** switch source error
  */
  PLAYER_EVENT_SWITCH_ERROR = 10,
};

/**
 * @brief The play preload another source event.
 *
 */
enum PLAYER_PRELOAD_EVENT  {
  /** preload source begin
  */
  PLAYER_PRELOAD_EVENT_BEGIN = 0,
  /** preload source complete
  */
  PLAYER_PRELOAD_EVENT_COMPLETE = 1,
  /** preload source error
  */
  PLAYER_PRELOAD_EVENT_ERROR = 2,
};

/**
 * @brief Media stream object
 *
 */
struct MediaStreamInfo { /* the index of the stream in the media file */
  int streamIndex;

  /* stream type */
  MEDIA_STREAM_TYPE streamType;

  /* stream encoding name */
  char codecName[kMaxCharBufferLength];

  /* streaming language */
  char language[kMaxCharBufferLength];

  /* If it is a video stream, video frames rate */
  int videoFrameRate;

  /* If it is a video stream, video bit rate */
  int videoBitRate;

  /* If it is a video stream, video width */
  int videoWidth;

  /* If it is a video stream, video height */
  int videoHeight;

  /* If it is a video stream, video rotation */
  int videoRotation;

  /* If it is an audio stream, audio bit rate */
  int audioSampleRate;

  /* If it is an audio stream, the number of audio channels */
  int audioChannels;

  /* If it is an audio stream, bits per sample */
  int audioBitsPerSample;

  /* stream duration in second */
  int64_t duration;};

/**
 * @brief Player Metadata type
 *
 */
enum MEDIA_PLAYER_METADATA_TYPE {
  /** data type unknown
   */
  PLAYER_METADATA_TYPE_UNKNOWN = 0,
  /** sei data
   */
  PLAYER_METADATA_TYPE_SEI = 1,
};

}  // namespace base
}  // namespace media
}  // namespace agora
