//
//  Agora Engine SDK
//
//  Created by Sting Feng in 2017-11.
//  Copyright (c) 2017 Agora.io. All rights reserved.
//

// This header file is included by both high level and low level APIs,
#pragma once  // NOLINT(build/header_guard)

#include <stdarg.h>
#include <stddef.h>
#include <stdio.h>
#include <cassert>

#include "IAgoraParameter.h"
#include "AgoraMediaBase.h"
#include "AgoraRefPtr.h"

#define MAX_PATH_260 (260)

#if defined(_WIN32)
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <windows.h>
#define AGORA_CALL __cdecl
#if defined(AGORARTC_EXPORT)
#define AGORA_API extern "C" __declspec(dllexport)
#else
#define AGORA_API extern "C" __declspec(dllimport)
#endif
#elif defined(__APPLE__)
#include <TargetConditionals.h>

#define AGORA_API __attribute__((visibility("default"))) extern "C"
#define AGORA_CALL
#elif defined(__ANDROID__) || defined(__linux__)
#define AGORA_API extern "C" __attribute__((visibility("default")))
#define AGORA_CALL
#else
#define AGORA_API extern "C"
#define AGORA_CALL
#endif

namespace agora {
namespace commons {
namespace cjson {
class JsonWrapper;
}  // namespace cjson
}  // namespace commons

using any_document_t = commons::cjson::JsonWrapper;

namespace base {
class IEngineBase;

class IParameterEngine {
 public:
  virtual int setParameters(const char* parameters) = 0;
  virtual int getParameters(const char* key, any_document_t& result) = 0;
  virtual ~IParameterEngine() {}
};
}  // namespace base

namespace util {

template <class T>
class AutoPtr {
 protected:
  typedef T value_type;
  typedef T* pointer_type;

 public:
  explicit AutoPtr(pointer_type p = 0) : ptr_(p) {}

  ~AutoPtr() {
    if (ptr_) ptr_->release();
  }

  operator bool() const { return ptr_ != (pointer_type)0; }

  value_type& operator*() const { return *get(); }

  pointer_type operator->() const { return get(); }

  pointer_type get() const { return ptr_; }

  pointer_type release() {
    pointer_type tmp = ptr_;
    ptr_ = 0;
    return tmp;
  }

  void reset(pointer_type ptr = 0) {
    if (ptr != ptr_ && ptr_) ptr_->release();
    ptr_ = ptr;
  }

  template <class C1, class C2>
  bool queryInterface(C1* c, C2 iid) {
    pointer_type p = NULL;
    if (c && !c->queryInterface(iid, reinterpret_cast<void**>(&p))) {
      reset(p);
    }
    return p != NULL;
  }

 private:
  AutoPtr(const AutoPtr&);
  AutoPtr& operator=(const AutoPtr&);

 private:
  pointer_type ptr_;
};

template <class T>
class CopyableAutoPtr : public AutoPtr<T> {
  typedef typename AutoPtr<T>::pointer_type pointer_type;

 public:
  explicit CopyableAutoPtr(pointer_type p = 0) : AutoPtr<T>(p) {}
  explicit CopyableAutoPtr(const CopyableAutoPtr& rhs) { this->reset(rhs.clone()); }
  CopyableAutoPtr& operator=(const CopyableAutoPtr& rhs) {
    if (this != &rhs) this->reset(rhs.clone());
    return *this;
  }
  pointer_type clone() const {
    if (!this->get()) return nullptr;
    return this->get()->clone();
  }
};

class IString {
 public:
  virtual bool empty() const = 0;
  virtual const char* c_str() = 0;
  virtual const char* data() = 0;
  virtual size_t length() = 0;
  virtual IString* clone() = 0;
  virtual void release() = 0;
  virtual ~IString() {}
};
typedef CopyableAutoPtr<IString> AString;

class IIterator {
 public:
  virtual void* current() = 0;
  virtual const void* const_current() const = 0;
  virtual bool next() = 0;
  virtual void release() = 0;
  virtual ~IIterator() {}
};

class IContainer {
 public:
  virtual IIterator* begin() = 0;
  virtual size_t size() const = 0;
  virtual void release() = 0;
  virtual ~IContainer() {}
};

template <class T>
class AOutputIterator {
  IIterator* p;

 public:
  typedef T value_type;
  typedef value_type& reference;
  typedef const value_type& const_reference;
  typedef value_type* pointer;
  typedef const value_type* const_pointer;
  explicit AOutputIterator(IIterator* it = NULL) : p(it) {}
  ~AOutputIterator() {
    if (p) p->release();
  }
  AOutputIterator(const AOutputIterator& rhs) : p(rhs.p) {}
  AOutputIterator& operator++() {
    p->next();
    return *this;
  }
  bool operator==(const AOutputIterator& rhs) const {
    if (p && rhs.p)
      return p->current() == rhs.p->current();
    else
      return valid() == rhs.valid();
  }
  bool operator!=(const AOutputIterator& rhs) const { return !this->operator==(rhs); }
  reference operator*() { return *reinterpret_cast<pointer>(p->current()); }
  const_reference operator*() const { return *reinterpret_cast<const_pointer>(p->const_current()); }
  bool valid() const { return p && p->current() != NULL; }
};

template <class T>
class AList {
  IContainer* container;
  bool owner;

 public:
  typedef T value_type;
  typedef value_type& reference;
  typedef const value_type& const_reference;
  typedef value_type* pointer;
  typedef const value_type* const_pointer;
  typedef size_t size_type;
  typedef AOutputIterator<value_type> iterator;
  typedef const AOutputIterator<value_type> const_iterator;

 public:
  AList() : container(NULL), owner(false) {}
  AList(IContainer* c, bool take_ownership) : container(c), owner(take_ownership) {}
  ~AList() { reset(); }
  void reset(IContainer* c = NULL, bool take_ownership = false) {
    if (owner && container) container->release();
    container = c;
    owner = take_ownership;
  }
  iterator begin() { return container ? iterator(container->begin()) : iterator(NULL); }
  iterator end() { return iterator(NULL); }
  size_type size() const { return container ? container->size() : 0; }
  bool empty() const { return size() == 0; }
};

}  // namespace util

/**
 * The channel profile.
 */
enum CHANNEL_PROFILE_TYPE {
  /**
   * 0: Communication.
   *
   * This profile prioritizes smoothness and applies to the one-to-one scenario.
   */
  CHANNEL_PROFILE_COMMUNICATION = 0,
  /**
   * 1: Live Broadcast.
   *
   * This profile prioritizes supporting a large audience in a live broadcast channel.
   */
  CHANNEL_PROFILE_LIVE_BROADCASTING = 1,
  /**
   * 2: Gaming.
   * @deprecated This profile is deprecated.
   */
  CHANNEL_PROFILE_GAME = 2,
  /**
   * 3: Cloud Gaming.
   *
   * This profile prioritizes low end-to-end latency and applies to scenarios where users interact
   * with each other, and any delay affects the user experience.
   */
  CHANNEL_PROFILE_CLOUD_GAMING = 3,

  /**
   * 4: Communication 1v1.
   *
   * This profile uses a special network transport strategy for communication 1v1.
   */
  CHANNEL_PROFILE_COMMUNICATION_1v1 = 4,
};

/**
 * The warning codes.
 */
enum WARN_CODE_TYPE {
  /**
   * 8: The specified view is invalid. To use the video function, you need to specify
   * a valid view.
   */
  WARN_INVALID_VIEW = 8,
  /**
   * 16: Fails to initialize the video function, probably due to a lack of
   * resources. Users fail to see each other, but can still communicate with voice.
   */
  WARN_INIT_VIDEO = 16,
  /**
   * 20: The request is pending, usually because some module is not ready,
   * and the SDK postpones processing the request.
   */
  WARN_PENDING = 20,
  /**
   * 103: No channel resources are available, probably because the server cannot
   * allocate any channel resource.
   */
  WARN_NO_AVAILABLE_CHANNEL = 103,
  /**
   * 104: A timeout occurs when looking for the channel. When joining a channel,
   * the SDK looks up the specified channel. This warning usually occurs when the
   * network condition is too poor to connect to the server.
   */
  WARN_LOOKUP_CHANNEL_TIMEOUT = 104,
  /**
   * 105: The server rejects the request to look for the channel. The server
   * cannot process this request or the request is illegal.
   */
  WARN_LOOKUP_CHANNEL_REJECTED = 105,
  /**
   * 106: A timeout occurs when opening the channel. Once the specific channel
   * is found, the SDK opens the channel. This warning usually occurs when the
   * network condition is too poor to connect to the server.
   */
  WARN_OPEN_CHANNEL_TIMEOUT = 106,
  /**
   * 107: The server rejects the request to open the channel. The server
   * cannot process this request or the request is illegal.
   */
  WARN_OPEN_CHANNEL_REJECTED = 107,

  // sdk: 100~1000
  /**
   * 111: A timeout occurs when switching the live video.
   */
  WARN_SWITCH_LIVE_VIDEO_TIMEOUT = 111,
  /**
   * 118: A timeout occurs when setting the user role.
   */
  WARN_SET_CLIENT_ROLE_TIMEOUT = 118,
  /**
   * 121: The ticket to open the channel is invalid.
   */
  WARN_OPEN_CHANNEL_INVALID_TICKET = 121,
  /**
   * 122: The SDK is trying connecting to another server.
   */
  WARN_OPEN_CHANNEL_TRY_NEXT_VOS = 122,
  /**
   * 131: The channel connection cannot be recovered.
   */
  WARN_CHANNEL_CONNECTION_UNRECOVERABLE = 131,
  /**
   * 132: The SDK connection IP has changed.
   */
  WARN_CHANNEL_CONNECTION_IP_CHANGED = 132,
  /**
   * 133: The SDK connection port has changed.
   */
  WARN_CHANNEL_CONNECTION_PORT_CHANGED = 133,
  /**
   * 701: An error occurs when opening the file for audio mixing.
   */
  WARN_AUDIO_MIXING_OPEN_ERROR = 701,
  /**
   * 1014: Audio Device Module: An exception occurs in the playback device.
   */
  WARN_ADM_RUNTIME_PLAYOUT_WARNING = 1014,
  /**
   * 1016: Audio Device Module: A warning occurs in the recording device.
   */
  WARN_ADM_RUNTIME_RECORDING_WARNING = 1016,
  /**
   * 1019: Audio Device Module: No valid audio data is collected.
   */
  WARN_ADM_RECORD_AUDIO_SILENCE = 1019,
  /**
   * 1020: Audio Device Module: The playback device fails to start.
   */
  WARN_ADM_PLAYOUT_MALFUNCTION = 1020,
  /**
   * 1021: Audio Device Module: The recording device fails to start.
   */
  WARN_ADM_RECORD_MALFUNCTION = 1021,
  /**
   * 1029: Audio Device Module: During a call, the audio session category should be
   * set to `AVAudioSessionCategoryPlayAndRecord`, and the SDK monitors this value.
   * If the audio session category is set to any other value, this warning occurs
   * and the SDK forcefully sets it back to `AVAudioSessionCategoryPlayAndRecord`.
   */
  WARN_ADM_IOS_CATEGORY_NOT_PLAYANDRECORD = 1029,
  /**
   * 1030: Audio Device Module: An exception occurs when changing the audio sample rate.
   */
  WARN_ADM_IOS_SAMPLERATE_CHANGE = 1030,
  /**
   * 1031: Audio Device Module: The recorded audio volume is too low.
   */
  WARN_ADM_RECORD_AUDIO_LOWLEVEL = 1031,
  /**
   * 1032: Audio Device Module: The playback audio volume is too low.
   */
  WARN_ADM_PLAYOUT_AUDIO_LOWLEVEL = 1032,
  /**
   * 1040: Audio device module: An exception occurs with the audio drive.
   * Choose one of the following solutions:
   * - Disable or re-enable the audio device.
   * - Re-enable your device.
   * - Update the sound card drive.
   */
  WARN_ADM_WINDOWS_NO_DATA_READY_EVENT = 1040,
  /**
   * 1051: Audio Device Module: The SDK detects howling.
   */
  WARN_APM_HOWLING = 1051,
  /**
   * 1052: Audio Device Module: The audio device is in a glitching state.
   */
  WARN_ADM_GLITCH_STATE = 1052,
  /**
   * 1053: Audio Device Module: The settings are improper.
   */
  WARN_ADM_IMPROPER_SETTINGS = 1053,
  /**
   * 1322: No recording device.
   */
  WARN_ADM_WIN_CORE_NO_RECORDING_DEVICE = 1322,
  /**
   * 1323: Audio device module: No available playback device.
   * You can try plugging in the audio device.
   */
  WARN_ADM_WIN_CORE_NO_PLAYOUT_DEVICE = 1323,
  /**
   * 1324: Audio device module: The capture device is released improperly.
   * Choose one of the following solutions:
   * - Disable or re-enable the audio device.
   * - Re-enable your audio device.
   * - Update the sound card drive.
   */
  WARN_ADM_WIN_CORE_IMPROPER_CAPTURE_RELEASE = 1324,
};

/**
 * The error codes.
 */
enum ERROR_CODE_TYPE {
  /**
   * 0: No error occurs.
   */
  ERR_OK = 0,
  // 1~1000
  /**
   * 1: A general error occurs (no specified reason).
   */
  ERR_FAILED = 1,
  /**
   * 2: The argument is invalid. For example, the specific channel name
   * includes illegal characters.
   */
  ERR_INVALID_ARGUMENT = 2,
  /**
   * 3: The SDK module is not ready. Choose one of the following solutions:
   * - Check the audio device.
   * - Check the completeness of the app.
   * - Reinitialize the RTC engine.
   */
  ERR_NOT_READY = 3,
  /**
   * 4: The SDK does not support this function.
   */
  ERR_NOT_SUPPORTED = 4,
  /**
   * 5: The request is rejected.
   */
  ERR_REFUSED = 5,
  /**
   * 6: The buffer size is not big enough to store the returned data.
   */
  ERR_BUFFER_TOO_SMALL = 6,
  /**
   * 7: The SDK is not initialized before calling this method.
   */
  ERR_NOT_INITIALIZED = 7,
  /**
   * 8: The state is invalid.
   */
  ERR_INVALID_STATE = 8,
  /**
   * 9: No permission. This is for internal use only, and does
   * not return to the app through any method or callback.
   */
  ERR_NO_PERMISSION = 9,
  /**
   * 10: An API timeout occurs. Some API methods require the SDK to return the
   * execution result, and this error occurs if the request takes too long
   * (more than 10 seconds) for the SDK to process.
   */
  ERR_TIMEDOUT = 10,
  /**
   * 11: The request is cancelled. This is for internal use only,
   * and does not return to the app through any method or callback.
   */
  ERR_CANCELED = 11,
  /**
   * 12: The method is called too often. This is for internal use
   * only, and does not return to the app through any method or
   * callback.
   */
  ERR_TOO_OFTEN = 12,
  /**
   * 13: The SDK fails to bind to the network socket. This is for internal
   * use only, and does not return to the app through any method or
   * callback.
   */
  ERR_BIND_SOCKET = 13,
  /**
   * 14: The network is unavailable. This is for internal use only, and
   * does not return to the app through any method or callback.
   */
  ERR_NET_DOWN = 14,
  /**
   * 15: No network buffers are available. This is for internal
   * use only, and does not return to the application through any method or
   * callback.
   */
  ERR_NET_NOBUFS = 15,
  /**
   * 17: The request to join the channel is rejected. This error usually occurs
   * when the user is already in the channel, and still calls the method to join
   * the channel, for example, \ref agora::rtc::IRtcEngine::joinChannel "joinChannel()".
   */
  ERR_JOIN_CHANNEL_REJECTED = 17,
  /**
   * 18: The request to leave the channel is rejected. This error usually
   * occurs when the user has already left the channel, and still calls the
   * method to leave the channel, for example, \ref agora::rtc::IRtcEngine::leaveChannel
   * "leaveChannel".
   */
  ERR_LEAVE_CHANNEL_REJECTED = 18,
  /**
   * 19: The resources have been occupied and cannot be reused.
   */
  ERR_ALREADY_IN_USE = 19,
  /**
   * 20: The SDK gives up the request due to too many requests. This is for
   * internal use only, and does not return to the app through any method or callback.
   */
  ERR_ABORTED = 20,
  /**
   * 21: On Windows, specific firewall settings can cause the SDK to fail to
   * initialize and crash.
   */
  ERR_INIT_NET_ENGINE = 21,
  /**
   * 22: The app uses too much of the system resource and the SDK
   * fails to allocate any resource.
   */
  ERR_RESOURCE_LIMITED = 22,
  /**
   * 101: The App ID is invalid, usually because the data format of the App ID is incorrect.
   *
   * Solution: Check the data format of your App ID. Ensure that you use the correct App ID to initialize the Agora service.
   */
  ERR_INVALID_APP_ID = 101,
  /**
   * 102: The specified channel name is invalid. Please try to rejoin the
   * channel with a valid channel name.
   */
  ERR_INVALID_CHANNEL_NAME = 102,
  /**
   * 109: The token has expired, usually for the following reasons:
   * - Timeout for token authorization: Once a token is generated, you must use it to access the
   * Agora service within 24 hours. Otherwise, the token times out and you can no longer use it.
   * - The token privilege expires: To generate a token, you need to set a timestamp for the token
   * privilege to expire. For example, If you set it as seven days, the token expires seven days after
   * its usage. In that case, you can no longer access the Agora service. The users cannot make calls,
   * or are kicked out of the channel.
   *
   * Solution: Regardless of whether token authorization times out or the token privilege expires,
   * you need to generate a new token on your server, and try to join the channel.
   */
  ERR_TOKEN_EXPIRED = 109,
  /**
   * 110: The token is invalid, usually for one of the following reasons:
   * - Did not provide a token when joining a channel in a situation where the project has enabled the
   * App Certificate.
   * - Tried to join a channel with a token in a situation where the project has not enabled the App
   * Certificate.
   * - The App ID, user ID and channel name that you use to generate the token on the server do not match
   * those that you use when joining a channel.
   *
   * Solution:
   * - Before joining a channel, check whether your project has enabled the App certificate. If yes, you
   * must provide a token when joining a channel; if no, join a channel without a token.
   * - When using a token to join a channel, ensure that the App ID, user ID, and channel name that you
   * use to generate the token is the same as the App ID that you use to initialize the Agora service, and
   * the user ID and channel name that you use to join the channel.
   */
  ERR_INVALID_TOKEN = 110,
  /**
   * 111: The internet connection is interrupted. This applies to the Agora Web
   * SDK only.
   */
  ERR_CONNECTION_INTERRUPTED = 111,  // only used in web sdk
  /**
   * 112: The internet connection is lost. This applies to the Agora Web SDK
   * only.
   */
  ERR_CONNECTION_LOST = 112,  // only used in web sdk
  /**
   * 113: The user is not in the channel when calling the
   * \ref agora::rtc::IRtcEngine::sendStreamMessage "sendStreamMessage()" method.
   */
  ERR_NOT_IN_CHANNEL = 113,
  /**
   * 114: The data size is over 1024 bytes when the user calls the
   * \ref agora::rtc::IRtcEngine::sendStreamMessage "sendStreamMessage()" method.
   */
  ERR_SIZE_TOO_LARGE = 114,
  /**
   * 115: The bitrate of the sent data exceeds the limit of 6 Kbps when the
   * user calls the \ref agora::rtc::IRtcEngine::sendStreamMessage "sendStreamMessage()".
   */
  ERR_BITRATE_LIMIT = 115,
  /**
   * 116: Too many data streams (over 5) are created when the user
   * calls the \ref agora::rtc::IRtcEngine::createDataStream "createDataStream()" method.
   */
  ERR_TOO_MANY_DATA_STREAMS = 116,
  /**
   * 117: A timeout occurs for the data stream transmission.
   */
  ERR_STREAM_MESSAGE_TIMEOUT = 117,
  /**
   * 119: Switching the user role fails. Please try to rejoin the channel.
   */
  ERR_SET_CLIENT_ROLE_NOT_AUTHORIZED = 119,
  /**
   * 120: Decryption fails. The user may have tried to join the channel with a wrong
   * password. Check your settings or try rejoining the channel.
   */
  ERR_DECRYPTION_FAILED = 120,
  /**
   * 121: The user ID is invalid.
   */
  ERR_INVALID_USER_ID = 121,
  /**
   * 123: The app is banned by the server.
   */
  ERR_CLIENT_IS_BANNED_BY_SERVER = 123,
  /**
   * 124: Incorrect watermark file parameter.
   */
  ERR_WATERMARK_PARAM = 124,
  /**
   * 125: Incorrect watermark file path.
   */
  ERR_WATERMARK_PATH = 125,
  /**
   * 126: Incorrect watermark file format.
   */
  ERR_WATERMARK_PNG = 126,
  /**
   * 127: Incorrect watermark file information.
   */
  ERR_WATERMARKR_INFO = 127,
  /**
   * 128: Incorrect watermark file data format.
   */
  ERR_WATERMARK_ARGB = 128,
  /**
   * 129: An error occurs in reading the watermark file.
   */
  ERR_WATERMARK_READ = 129,
  /**
   * 130: Encryption is enabled when the user calls the
   * \ref agora::rtc::IRtcEngine::addPublishStreamUrl "addPublishStreamUrl()" method
   * (CDN live streaming does not support encrypted streams).
   */
  ERR_ENCRYPTED_STREAM_NOT_ALLOWED_PUBLISH = 130,
  /// @cond
  // signaling: 400~600
  ERR_LOGOUT_OTHER = 400,          //
  ERR_LOGOUT_USER = 401,           // logout by user
  ERR_LOGOUT_NET = 402,            // network failure
  ERR_LOGOUT_KICKED = 403,         // login in other device
  ERR_LOGOUT_PACKET = 404,         //
  ERR_LOGOUT_TOKEN_EXPIRED = 405,  // token expired
  ERR_LOGOUT_OLDVERSION = 406,     //
  ERR_LOGOUT_TOKEN_WRONG = 407,
  ERR_LOGOUT_ALREADY_LOGOUT = 408,
  ERR_LOGIN_OTHER = 420,
  ERR_LOGIN_NET = 421,
  ERR_LOGIN_FAILED = 422,
  ERR_LOGIN_CANCELED = 423,
  ERR_LOGIN_TOKEN_EXPIRED = 424,
  ERR_LOGIN_OLD_VERSION = 425,
  ERR_LOGIN_TOKEN_WRONG = 426,
  ERR_LOGIN_TOKEN_KICKED = 427,
  ERR_LOGIN_ALREADY_LOGIN = 428,
  ERR_JOIN_CHANNEL_OTHER = 440,
  ERR_SEND_MESSAGE_OTHER = 440,
  ERR_SEND_MESSAGE_TIMEOUT = 441,
  ERR_QUERY_USERNUM_OTHER = 450,
  ERR_QUERY_USERNUM_TIMEOUT = 451,
  ERR_QUERY_USERNUM_BYUSER = 452,
  ERR_LEAVE_CHANNEL_OTHER = 460,
  ERR_LEAVE_CHANNEL_KICKED = 461,
  ERR_LEAVE_CHANNEL_BYUSER = 462,
  ERR_LEAVE_CHANNEL_LOGOUT = 463,
  ERR_LEAVE_CHANNEL_DISCONNECTED = 464,
  ERR_INVITE_OTHER = 470,
  ERR_INVITE_REINVITE = 471,
  ERR_INVITE_NET = 472,
  ERR_INVITE_PEER_OFFLINE = 473,
  ERR_INVITE_TIMEOUT = 474,
  ERR_INVITE_CANT_RECV = 475,
  /// @endcond
  // 1001~2000
  /**
   * 1001: Fails to load the media engine.
   */
  ERR_LOAD_MEDIA_ENGINE = 1001,
  /**
   * 1002: Fails to start the call after enabling the media engine.
   */
  ERR_START_CALL = 1002,
  /**
   * 1003: Fails to start the camera.
   */
  ERR_START_CAMERA = 1003,
  /**
   * 1004: Fails to start the video rendering module.
   */
  ERR_START_VIDEO_RENDER = 1004,
  /**
   * 1005: Audio device module: A general error occurs in the Audio Device Module (no specified
   * reason). Check if the audio device is used by another app, or try
   * rejoining the channel.
   */
  ERR_ADM_GENERAL_ERROR = 1005,
  /**
   * 1006: Audio Device Module: An error occurs in using the Java resources.
   */
  ERR_ADM_JAVA_RESOURCE = 1006,
  /**
   * 1007: Audio Device Module: An error occurs in setting the sample rate
   */
  ERR_ADM_SAMPLE_RATE = 1007,
  /**
   * 1008: Audio Device Module: An error occurs in initializing the playback
   * device.
   */
  ERR_ADM_INIT_PLAYOUT = 1008,
  /**
   * 1009: Audio Device Module: An error occurs in starting the playback device.
   */
  ERR_ADM_START_PLAYOUT = 1009,
  /**
   * 1010: Audio Device Module: An error occurs in stopping the playback device.
   */
  ERR_ADM_STOP_PLAYOUT = 1010,
  /**
   * 1011: Audio Device Module: An error occurs in initializing the recording
   * device.
   */
  ERR_ADM_INIT_RECORDING = 1011,
  /**
   * 1012: Audio Device Module: An error occurs in starting the recording device.
   */
  ERR_ADM_START_RECORDING = 1012,
  /**
   * 1013: Audio Device Module: An error occurs in stopping the recording device.
   */
  ERR_ADM_STOP_RECORDING = 1013,
  /**
   * 1015: Audio Device Module: A playback error occurs. Check your playback
   * device, or try rejoining the channel.
   */
  ERR_ADM_RUNTIME_PLAYOUT_ERROR = 1015,
  /**
   * 1017: Audio Device Module: A recording error occurs.
   */
  ERR_ADM_RUNTIME_RECORDING_ERROR = 1017,
  /**
   * 1018: Audio Device Module: The SDK fails to record audio.
   */
  ERR_ADM_RECORD_AUDIO_FAILED = 1018,
  /**
   * 1022: Audio Device Module: An error occurs in initializing the loopback
   * device.
   */
  ERR_ADM_INIT_LOOPBACK = 1022,
  /**
   * 1023: Audio Device Module: An error occurs in starting the loopback
   * device.
   */
  ERR_ADM_START_LOOPBACK = 1023,
  /**
   * 1027: Audio Device Module: No recording permission. Please check if the
   * recording permission is granted.
   */
  ERR_ADM_NO_PERMISSION = 1027,
  /**
   * 1033: Audio device module: The device is occupied.
   */
  ERR_ADM_RECORD_AUDIO_IS_ACTIVE = 1033,
  /**
   * 1101: Audio device module: A fatal exception occurs.
   */
  ERR_ADM_ANDROID_JNI_JAVA_RESOURCE = 1101,
  /**
   * 1108: Audio device module: The recording frequency is lower than 50.
   * 0 indicates that the recording is not yet started. Agora recommends
   * checking your recording permission.
   */
  ERR_ADM_ANDROID_JNI_NO_RECORD_FREQUENCY = 1108,
  /**
   * 1109: The playback frequency is lower than 50. 0 indicates that the
   * playback is not yet started. Agora recommends checking if you have created
   * too many AudioTrack instances.
   */
  ERR_ADM_ANDROID_JNI_NO_PLAYBACK_FREQUENCY = 1109,
  /**
   * 1111: Audio device module: AudioRecord fails to start up. A ROM system
   error occurs. Agora recommends the following options to debug:
   - Restart your App.
   - Restart your cellphone.
   - Check your recording permission.
   */
  ERR_ADM_ANDROID_JNI_JAVA_START_RECORD = 1111,
  /**
   * 1112: Audio device module: AudioTrack fails to start up. A ROM system
   error occurs. We recommend the following options to debug:
   - Restart your App.
   - Restart your cellphone.
   - Check your playback permission.
   */
  ERR_ADM_ANDROID_JNI_JAVA_START_PLAYBACK = 1112,
  /**
   * 1115: Audio device module: AudioRecord returns error. The SDK will
   * automatically restart AudioRecord.
   */
  ERR_ADM_ANDROID_JNI_JAVA_RECORD_ERROR = 1115,
  /** @deprecated */
  ERR_ADM_ANDROID_OPENSL_CREATE_ENGINE = 1151,
  /** @deprecated */
  ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_RECORDER = 1153,
  /** @deprecated */
  ERR_ADM_ANDROID_OPENSL_START_RECORDER_THREAD = 1156,
  /** @deprecated */
  ERR_ADM_ANDROID_OPENSL_CREATE_AUDIO_PLAYER = 1157,
  /** @deprecated */
  ERR_ADM_ANDROID_OPENSL_START_PLAYER_THREAD = 1160,
  /**
   * 1201: Audio device module: The current device does not support audio
   * input, possibly because you have mistakenly configured the audio session
   * category, or because some other app is occupying the input device. Agora
   * recommends terminating all background apps and re-joining the channel.
   */
  ERR_ADM_IOS_INPUT_NOT_AVAILABLE = 1201,
  /**
   * 1206: Audio device module: Cannot activate the audio session.
   */
  ERR_ADM_IOS_ACTIVATE_SESSION_FAIL = 1206,
  /**
   * 1210: Audio device module: Fails to initialize the audio device,
   * usually because the audio device parameters are not properly set.
   */
  ERR_ADM_IOS_VPIO_INIT_FAIL = 1210,
  /**
   * 1213: Audio device module: Fails to re-initialize the audio device,
   * usually because the audio device parameters are not properly set.
   */
  ERR_ADM_IOS_VPIO_REINIT_FAIL = 1213,
  /**
   * 1214:  Audio device module: Fails to re-start up the Audio Unit, usually because the audio
   * session category is not compatible with the settings of the Audio Unit.
   */
  ERR_ADM_IOS_VPIO_RESTART_FAIL = 1214,
  ERR_ADM_IOS_SET_RENDER_CALLBACK_FAIL = 1219,
  /** @deprecated */
  ERR_ADM_IOS_SESSION_SAMPLERATR_ZERO = 1221,
  /**
   * 1301: Audio device module: An exception with the audio driver or a
   * compatibility issue occurs.
   *
   * Solutions: Disable and restart the audio
   * device, or reboot the system.
   */
  ERR_ADM_WIN_CORE_INIT = 1301,
  /**
   * 1303: Audio device module: An exception with the recording driver or a
   * compatibility issue occurs.
   *
   * Solutions: Disable and restart the audio device, or reboot the system.
   */
  ERR_ADM_WIN_CORE_INIT_RECORDING = 1303,
  /**
   * 1306: Audio device module: An exception with the playback driver or a
   * compatibility issue occurs.
   *
   * Solutions: Disable and restart the audio device, or reboot the system.
   */
  ERR_ADM_WIN_CORE_INIT_PLAYOUT = 1306,
  /**
   * 1307: Audio device module: No audio device is available.
   *
   * Solutions: Plug in a proper audio device.
   */
  ERR_ADM_WIN_CORE_INIT_PLAYOUT_NULL = 1307,
  /**
   * 1309: Audio device module: An exception with the audio driver or a
   * compatibility issue occurs.
   *
   * Solutions: Disable and restart the audio device, or reboot the system.
   */
  ERR_ADM_WIN_CORE_START_RECORDING = 1309,
  /**
   * 1311: Audio device module: Insufficient system memory or poor device
   * performance.
   *
   * Solutions: Reboot the system or replace the device.
   */
  ERR_ADM_WIN_CORE_CREATE_REC_THREAD = 1311,
  /**
   * 1314: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_CORE_CAPTURE_NOT_STARTUP = 1314,
  /**
   * 1319: Audio device module: Insufficient system memory or poor device
   * performance.
   *
   * Solutions: Reboot the system or replace the device.
   */
  ERR_ADM_WIN_CORE_CREATE_RENDER_THREAD = 1319,
  /**
   * 1320: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Replace the device.
   */
  ERR_ADM_WIN_CORE_RENDER_NOT_STARTUP = 1320,
  /**
   * 1322: Audio device module: No audio recording device is available.
   *
   * Solutions: Plug in a proper recording device.
   */
  ERR_ADM_WIN_CORE_NO_RECORDING_DEVICE = 1322,
  /**
   * 1323: Audio device module: No audio playback device is available.
   *
   * Solutions: Plug in a proper playback device.
   */
  ERR_ADM_WIN_CORE_NO_PLAYOUT_DEVICE = 1323,
  /**
   * 1351: Audio device module: An exception with the audio driver or a
   * compatibility issue occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_WAVE_INIT = 1351,
  /**
   * 1353: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_WAVE_INIT_RECORDING = 1353,
  /**
   * 1354: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_WAVE_INIT_MICROPHONE = 1354,
  /**
   * 1355: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_WAVE_INIT_PLAYOUT = 1355,
  /**
   * 1356: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_WAVE_INIT_SPEAKER = 1356,
  /**
   * 1357: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_WAVE_START_RECORDING = 1357,
  /**
   * 1358: Audio device module: An exception with the audio driver occurs.
   *
   * Solutions:
   * - Disable and then re-enable the audio device.
   * - Reboot the system.
   * - Upgrade your audio card driver.
   */
  ERR_ADM_WIN_WAVE_START_PLAYOUT = 1358,
  /**
   * 1359: Audio Device Module: No recording device.
   */
  ERR_ADM_NO_RECORDING_DEVICE = 1359,
  /**
   * 1360: Audio Device Module: No playback device.
   */
  ERR_ADM_NO_PLAYOUT_DEVICE = 1360,

  // VDM error code starts from 1500
  /**
   * 1501: Video Device Module: The camera is not authorized.
   */
  ERR_VDM_CAMERA_NOT_AUTHORIZED = 1501,

  // VDM error code starts from 1500
  /**
   * 1501: Video Device Module: The camera is in use.
   */
  ERR_VDM_WIN_DEVICE_IN_USE = 1502,

  // VCM error code starts from 1600
  /**
   * 1600: Video Device Module: An unknown error occurs.
   */
  ERR_VCM_UNKNOWN_ERROR = 1600,
  /**
   * 1601: Video Device Module: An error occurs in initializing the video
   * encoder.
   */
  ERR_VCM_ENCODER_INIT_ERROR = 1601,
  /**
   * 1602: Video Device Module: An error occurs in encoding.
   */
  ERR_VCM_ENCODER_ENCODE_ERROR = 1602,
  /**
   * 1603: Video Device Module: An error occurs in setting the video encoder.
   */
  ERR_VCM_ENCODER_SET_ERROR = 1603,
};

// Doesn't contain anything beyond a type and message now, but will in the
// future as more errors are implemented.
class AgoraError {
 public:
  // Constructors.

  // Creates a "no error" error.
  AgoraError() {}
  explicit AgoraError(ERROR_CODE_TYPE type) : type_(type) {}
  // For performance, prefer using the constructor that takes a const char* if
  // the message is a static string.
  AgoraError(ERROR_CODE_TYPE type, const char* message) : type_(type), static_message_(message) {}

  // Delete the copy constructor and assignment operator; there aren't any use
  // cases where you should need to copy an AgoraError, as opposed to moving it.
  // Can revisit this decision if use cases arise in the future.
  AgoraError(const AgoraError& other) = delete;
  AgoraError& operator=(const AgoraError& other) = delete;

  // Move constructor and move-assignment operator.
  AgoraError(AgoraError&& other);
  AgoraError& operator=(AgoraError&& other);

  ~AgoraError();

  // Identical to default constructed error.
  //
  // Preferred over the default constructor for code readability.
  static AgoraError OK();

  // Error type.
  ERROR_CODE_TYPE type() const { return type_; }
  void setType(ERROR_CODE_TYPE type) { type_ = type; }

  // Human-readable message describing the error. Shouldn't be used for
  // anything but logging/diagnostics, since messages are not guaranteed to be
  // stable.
  const char* message() const;
  // For performance, prefer using the method that takes a const char* if the
  // message is a static string.
  void setMessage(const char* message);

  // Convenience method for situations where you only care whether or not an
  // error occurred.
  bool ok() const { return type_ == ERROR_CODE_TYPE::ERR_OK; }

 private:
  ERROR_CODE_TYPE type_ = ERROR_CODE_TYPE::ERR_OK;

  const char* static_message_ = "";
};

typedef const char* user_id_t;
typedef void* view_t;

/**
 * The definition of the UserInfo struct.
 */
struct UserInfo {
  /**
   * ID of the user.
   */
  util::AString userId;
  /**
   * Whether the user has enabled audio:
   * - true: The user has enabled audio.
   * - false: The user has disabled audio.
   */
  bool hasAudio;
  /**
   * Whether the user has enabled video:
   * - true: The user has enabled video.
   * - false: The user has disabled video.
   */
  bool hasVideo;
};

typedef util::AList<UserInfo> UserList;

// Shared between Agora Service and Rtc Engine
namespace rtc {

/**
 * Reasons for a user being offline.
 */
enum USER_OFFLINE_REASON_TYPE {
  /**
   * 0: The user leaves the current channel.
   */
  USER_OFFLINE_QUIT = 0,
  /**
   * 1: The SDK times out and the user drops offline because no data packet was received within a certain
   * period of time. If a user quits the call and the message is not passed to the SDK (due to an
   * unreliable channel), the SDK assumes that the user drops offline.
   */
  USER_OFFLINE_DROPPED = 1,
  /**
   * 2: (Live Broadcast only.) The user role switches from broadcaster to audience.
   */
  USER_OFFLINE_BECOME_AUDIENCE = 2,
};

enum INTERFACE_ID_TYPE {
  AGORA_IID_AUDIO_DEVICE_MANAGER = 1,
  AGORA_IID_VIDEO_DEVICE_MANAGER = 2,
  AGORA_IID_PARAMETER_ENGINE = 3,
  AGORA_IID_MEDIA_ENGINE = 4,
  AGORA_IID_AUDIO_ENGINE = 5,
  AGORA_IID_VIDEO_ENGINE = 6,
  AGORA_IID_RTC_CONNECTION = 7,
  AGORA_IID_SIGNALING_ENGINE = 8,
  AGORA_IID_MEDIA_ENGINE_REGULATOR = 9,
};

/**
 * The network quality types.
 */
enum QUALITY_TYPE {
  /**
   * 0: The network quality is unknown.
   * @deprecated This member is deprecated.
   */
  QUALITY_UNKNOWN = 0,
  /**
   * 1: The quality is excellent.
   */
  QUALITY_EXCELLENT = 1,
  /**
   * 2: The quality is quite good, but the bitrate may be slightly
   * lower than excellent.
   */
  QUALITY_GOOD = 2,
  /**
   * 3: Users can feel the communication slightly impaired.
   */
  QUALITY_POOR = 3,
  /**
   * 4: Users cannot communicate smoothly.
   */
  QUALITY_BAD = 4,
  /**
   * 5: Users can barely communicate.
   */
  QUALITY_VBAD = 5,
  /**
   * 6: Users cannot communicate at all.
   */
  QUALITY_DOWN = 6,
  /**
   * 7: (For future use) The network quality cannot be detected.
   */
  QUALITY_UNSUPPORTED = 7,
  /**
   * 8: Detecting the network quality.
   */
  QUALITY_DETECTING
};

/**
 * Content fit modes.
 */
enum FIT_MODE_TYPE {
  /**
   * 1: Uniformly scale the video until it fills the visible boundaries (cropped).
   * One dimension of the video may have clipped contents.
   */
  MODE_COVER = 1,

  /**
   * 2: Uniformly scale the video until one of its dimension fits the boundary
   * (zoomed to fit). Areas that are not filled due to disparity in the aspect
   * ratio are filled with black.
   */
  MODE_CONTAIN = 2,
};

/**
 * The rotation information.
 */
enum VIDEO_ORIENTATION {
  /**
   * 0: Rotate the video by 0 degree clockwise.
   */
  VIDEO_ORIENTATION_0 = 0,
  /**
   * 90: Rotate the video by 90 degrees clockwise.
   */
  VIDEO_ORIENTATION_90 = 90,
  /**
   * 180: Rotate the video by 180 degrees clockwise.
   */
  VIDEO_ORIENTATION_180 = 180,
  /**
   * 270: Rotate the video by 270 degrees clockwise.
   */
  VIDEO_ORIENTATION_270 = 270
};

/**
 * The video frame rate.
 */
enum FRAME_RATE {
  /**
   * 1: 1 fps.
   */
  FRAME_RATE_FPS_1 = 1,
  /**
   * 7: 7 fps.
   */
  FRAME_RATE_FPS_7 = 7,
  /**
   * 10: 10 fps.
   */
  FRAME_RATE_FPS_10 = 10,
  /**
   * 15: 15 fps.
   */
  FRAME_RATE_FPS_15 = 15,
  /**
   * 24: 24 fps.
   */
  FRAME_RATE_FPS_24 = 24,
  /**
   * 30: 30 fps.
   */
  FRAME_RATE_FPS_30 = 30,
  /**
   * 60: 60 fps. Applies to Windows and macOS only.
   */
  FRAME_RATE_FPS_60 = 60,
};

enum FRAME_WIDTH {
  FRAME_WIDTH_640 = 640,
};

enum FRAME_HEIGHT {
  FRAME_HEIGHT_360 = 360,
};


/**
 * Types of the video frame.
 */
enum VIDEO_FRAME_TYPE {
  VIDEO_FRAME_TYPE_BLANK_FRAME = 0,
  VIDEO_FRAME_TYPE_KEY_FRAME = 3,
  VIDEO_FRAME_TYPE_DELTA_FRAME = 4,
  VIDEO_FRAME_TYPE_B_FRAME = 5,
  VIDEO_FRAME_TYPE_DROPPABLE_FRAME = 6,
  VIDEO_FRAME_TYPE_UNKNOW
};

/**
 * (For future use) Video output orientation modes.
 */
enum ORIENTATION_MODE {
  /**
   * 0: (Default) Adaptive mode.
   *
   * In this mode, the output video always follows the orientation of the captured video.
   * - If the captured video is in landscape mode, the output video is in landscape mode.
   * - If the captured video is in portrait mode, the output video is in portrait mode.
   */
  ORIENTATION_MODE_ADAPTIVE = 0,
  /**
   * 1: Landscape mode.
   *
   * In this mode, the output video is always in landscape mode. If the captured video is in portrait
   * mode, the video encoder crops it to fit the output. Applies to scenarios where the receiver
   * cannot process the rotation information, for example, CDN live streaming.
   */
  ORIENTATION_MODE_FIXED_LANDSCAPE = 1,
  /**
   * 2: Portrait mode.
   *
   * In this mode, the output video is always in portrait mode. If the captured video is in landscape
   * mode, the video encoder crops it to fit the output. Applies to scenarios where the receiver
   * cannot process the rotation information, for example, CDN live streaming.
   */
  ORIENTATION_MODE_FIXED_PORTRAIT = 2,
};

/**
 * (For future use) Video degradation preferences under limited bandwidth.
 */
enum DEGRADATION_PREFERENCE {
  /**
   * 0: (Default) Degrade the frame rate and keep resolution to guarantee the video quality.
   */
  MAINTAIN_QUALITY = 0,
  /**
   * 1: Degrade resolution in order to maintain framerate.
   */
  MAINTAIN_FRAMERATE = 1,
  /**
   * 2: Maintain resolution in video quality control process. Under limited bandwidth, degrade video quality first and then degrade frame rate.
   */
  MAINTAIN_BALANCED = 2,
  /**
   * 3: Degrade framerate in order to maintain resolution.
   */
  MAINTAIN_RESOLUTION = 3,
};

/**
 * The definition of the VideoDimensions struct.
 */
struct VideoDimensions {
  /**
   * The width of the video in number of pixels.
   */
  int width;
  /**
   * The height of the video in number of pixels.
   */
  int height;
  VideoDimensions() : width(640), height(480) {}
  VideoDimensions(int w, int h) : width(w), height(h) {}
};

/**
 * (Recommended) 0: Standard bitrate mode.
 *
 * In this mode, the bitrates differ between the live broadcast and communication
 * profiles:
 *
 * - Communication profile: The video bitrate is the same as the base bitrate.
 * - Live Broadcast profile: The video bitrate is twice the base bitrate.
 */
const int STANDARD_BITRATE = 0;

/**
 * -1: Compatible bitrate mode.
 *
 * In this mode, the bitrate remains the same regardless of the channel profile. If you choose
 * this mode in the live-broadcast profile, the video frame rate may be lower
 * than the set value.
 */
const int COMPATIBLE_BITRATE = -1;

/**
 * -1: (For future use) The default minimum bitrate.
 */
const int DEFAULT_MIN_BITRATE = -1;

/**
 * -2: (For future use) Set minimum bitrate the same as target bitrate.
 */
const int DEFAULT_MIN_BITRATE_EQUAL_TO_TARGET_BITRATE = -2;

/**
 * Video codec types.
 */
enum VIDEO_CODEC_TYPE {
  /**
   * 1: VP8.
   */
  VIDEO_CODEC_VP8 = 1,
  /**
   * 2: H.264.
   */
  VIDEO_CODEC_H264 = 2,
  /**
   * 3: H.265.
   */
  VIDEO_CODEC_H265 = 3,
  /**
   * 5: VP9.
   */
  VIDEO_CODEC_VP9 = 5,
  /** 
   * 6: Generic. 
   */
  VIDEO_CODEC_GENERIC = 6,
};

/**
 * Audio codec types.
 */
enum AUDIO_CODEC_TYPE {
  /**
   * 1: OPUS.
   */
  AUDIO_CODEC_OPUS = 1,
  // kIsac = 2,
  /**
   * 3: PCMA.
   */
  AUDIO_CODEC_PCMA = 3,
  /**
   * 4: PCMU.
   */
  AUDIO_CODEC_PCMU = 4,
  /**
   * 5: G722.
   */
  AUDIO_CODEC_G722 = 5,
  // kIlbc = 6,
  /** 7: AAC. */
  // AUDIO_CODEC_AAC = 7,
  /**
   * 8: AAC LC.
   */
  AUDIO_CODEC_AACLC = 8,
  /**
   * 9: HE AAC.
   */
  AUDIO_CODEC_HEAAC = 9,
  /**
   * 10: JC1.
   */
  AUDIO_CODEC_JC1 = 10,
  AUDIO_CODEC_HEAAC2 = 11,
};

/**
 * Watermark fit mode
 */
enum WATERMARK_FIT_MODE {
  /**
   * Use the position of positionInLandscapeMode/positionInPortraitMode in #WatermarkOptions
   * the widthRatio will be invalid.
   */
  FIT_MODE_COVER_POSITION,
  /**
   * Use width rotio of video, in this mode, positionInLandscapeMode/positionInPortraitMode
   * in #WatermarkOptions will be invalid, and watermarkRatio will valid.
   */
  FIT_MODE_USE_IMAGE_RATIO
};

/**
 * The definition of the EncodedAudioFrameInfo struct.
 */
struct EncodedAudioFrameInfo {
  EncodedAudioFrameInfo()
      : speech(true),
        codec(AUDIO_CODEC_AACLC),
        sampleRateHz(0),
        samplesPerChannel(0),
        sendEvenIfEmpty(true),
        numberOfChannels(0) {}

  EncodedAudioFrameInfo(const EncodedAudioFrameInfo& rhs)
      : speech(rhs.speech),
        codec(rhs.codec),
        sampleRateHz(rhs.sampleRateHz),
        samplesPerChannel(rhs.samplesPerChannel),
        sendEvenIfEmpty(rhs.sendEvenIfEmpty),
        numberOfChannels(rhs.numberOfChannels) {}
  /**
   * Determines whether the audio source is speech.
   * - true: (Default) The audio source is speech.
   * - false: The audio source is not speech.
   */
  bool speech;
  /**
   * The audio codec: #AUDIO_CODEC_TYPE.
   */
  AUDIO_CODEC_TYPE codec;
  /**
   * The sample rate (Hz) of the audio frame.
   */
  int sampleRateHz;
  /**
   * The number of samples per audio channel.
   *
   * If this value is not set, it is 1024 for AAC, or 960 for OPUS by default.
   */
  int samplesPerChannel;
  /**
   * Whether to send the audio frame even when it is empty.
   * - true: (Default) Send the audio frame even when it is empty.
   * - false: Do not send the audio frame when it is empty.
   */
  bool sendEvenIfEmpty;
  /**
   * The number of audio channels of the audio frame.
   */
  int numberOfChannels;
};
/**
 * The definition of the AudioPcmDataInfo struct.
 */
struct AudioPcmDataInfo {
  AudioPcmDataInfo() : sampleCount(0), samplesOut(0), elapsedTimeMs(0), ntpTimeMs(0) {}

  AudioPcmDataInfo(const AudioPcmDataInfo& rhs)
      : sampleCount(rhs.sampleCount),
        samplesOut(rhs.samplesOut),
        elapsedTimeMs(rhs.elapsedTimeMs),
        ntpTimeMs(rhs.ntpTimeMs) {}

  /**
   * The sample count of the PCM data that you expect.
   */
  size_t sampleCount;

  // Output
  /**
   * The number of output samples.
   */
  size_t samplesOut;
  int64_t elapsedTimeMs;
  int64_t ntpTimeMs;
};
/**
 * Packetization modes. Applies to H.264 only.
 */
enum H264PacketizeMode {
  NonInterleaved = 0,  // Mode 1 - STAP-A, FU-A is allowed
  SingleNalUnit,       // Mode 0 - only single NALU allowed
};
/**
 * The definition of the EncodedVideoFrameInfo struct.
 */
struct EncodedVideoFrameInfo {
  EncodedVideoFrameInfo()
      : codecType(VIDEO_CODEC_H264),
        width(0),
        height(0),
        framesPerSecond(0),
        frameType(VIDEO_FRAME_TYPE_BLANK_FRAME),
        rotation(VIDEO_ORIENTATION_0),
        trackId(0),
        renderTimeMs(0),
        internalSendTs(0),
        uid(0) {}

  EncodedVideoFrameInfo(const EncodedVideoFrameInfo& rhs)
      : codecType(rhs.codecType),
        width(rhs.width),
        height(rhs.height),
        framesPerSecond(rhs.framesPerSecond),
        frameType(rhs.frameType),
        rotation(rhs.rotation),
        trackId(rhs.trackId),
        renderTimeMs(rhs.renderTimeMs),
        internalSendTs(rhs.internalSendTs),
        uid(rhs.uid) {}
  /**
   * The video codec: #VIDEO_CODEC_TYPE.
   */
  VIDEO_CODEC_TYPE codecType;
  /**
   * The width (px) of the video.
   */
  int width;
  /**
   * The height (px) of the video.
   */
  int height;
  /**
   * The number of video frames per second.
   * This value will be used for calculating timestamps of the encoded image.
   * If framesPerSecond equals zero, then real timestamp will be used.
   * Otherwise, timestamp will be adjusted to the value of framesPerSecond set.
   */
  int framesPerSecond;
  /**
   * The frame type of the encoded video frame: #VIDEO_FRAME_TYPE.
   */
  VIDEO_FRAME_TYPE frameType;
  /**
   * The rotation information of the encoded video frame: #VIDEO_ORIENTATION.
   */
  VIDEO_ORIENTATION rotation;
  /**
   * The track ID of the video frame.
   */
  int trackId;  // This can be reserved for multiple video tracks, we need to create different ssrc
                // and additional payload for later implementation.
  /**
   * The timestamp for rendering the video.
   */
  int64_t renderTimeMs;
  uint64_t internalSendTs;
  /**
   * ID of the user.
   */
  uid_t uid;
};

/**
 * Video mirror mode types.
 */
enum VIDEO_MIRROR_MODE_TYPE {
  /**
   * (Default) 0: The mirror mode determined by the SDK.
   */
  VIDEO_MIRROR_MODE_AUTO = 0,
  /**
   * 1: Enable the mirror mode.
   */
  VIDEO_MIRROR_MODE_ENABLED = 1,
  /**
   * 2: Disable the mirror mode.
   */
  VIDEO_MIRROR_MODE_DISABLED = 2,
};

/**
 * The definition of the VideoEncoderConfiguration struct.
 */
struct VideoEncoderConfiguration {
  /**
   * The video encoder code type: #VIDEO_CODEC_TYPE.
   */
  VIDEO_CODEC_TYPE codecType;
  /**
   * The video dimension: VideoDimensions.
   */
  VideoDimensions dimensions;
  /**
   * The frame rate of the video. You can set it manually, or choose one from #FRAME_RATE.
   */
  int frameRate;
  /**
   * The bitrate (Kbps) of the video.
   *
   * Refer to the **Video Bitrate Table** below and set your bitrate. If you set a bitrate beyond the
   * proper range, the SDK automatically adjusts it to a value within the range. You can also choose
   * from the following options:
   *
   * - #STANDARD_BITRATE: (Recommended) Standard bitrate mode. In this mode, the bitrates differ between
   * the Live Broadcast and Communication profiles:
   *   - In the Communication profile, the video bitrate is the same as the base bitrate.
   *   - In the Live Broadcast profile, the video bitrate is twice the base bitrate.
   * - #COMPATIBLE_BITRATE: Compatible bitrate mode. The compatible bitrate mode. In this mode, the bitrate
   * stays the same regardless of the profile. If you choose this mode for the Live Broadcast profile,
   * the video frame rate may be lower than the set value.
   *
   * Agora uses different video codecs for different profiles to optimize the user experience. For example,
   * the communication profile prioritizes the smoothness while the live-broadcast profile prioritizes the
   * video quality (a higher bitrate). Therefore, We recommend setting this parameter as #STANDARD_BITRATE.
   *
   * | Resolution             | Frame Rate (fps) | Base Bitrate (Kbps) | Live Bitrate (Kbps)|
   * |------------------------|------------------|---------------------|--------------------|
   * | 160 * 120              | 15               | 65                  | 130                |
   * | 120 * 120              | 15               | 50                  | 100                |
   * | 320 * 180              | 15               | 140                 | 280                |
   * | 180 * 180              | 15               | 100                 | 200                |
   * | 240 * 180              | 15               | 120                 | 240                |
   * | 320 * 240              | 15               | 200                 | 400                |
   * | 240 * 240              | 15               | 140                 | 280                |
   * | 424 * 240              | 15               | 220                 | 440                |
   * | 640 * 360              | 15               | 400                 | 800                |
   * | 360 * 360              | 15               | 260                 | 520                |
   * | 640 * 360              | 30               | 600                 | 1200               |
   * | 360 * 360              | 30               | 400                 | 800                |
   * | 480 * 360              | 15               | 320                 | 640                |
   * | 480 * 360              | 30               | 490                 | 980                |
   * | 640 * 480              | 15               | 500                 | 1000               |
   * | 480 * 480              | 15               | 400                 | 800                |
   * | 640 * 480              | 30               | 750                 | 1500               |
   * | 480 * 480              | 30               | 600                 | 1200               |
   * | 848 * 480              | 15               | 610                 | 1220               |
   * | 848 * 480              | 30               | 930                 | 1860               |
   * | 640 * 480              | 10               | 400                 | 800                |
   * | 1280 * 720             | 15               | 1130                | 2260               |
   * | 1280 * 720             | 30               | 1710                | 3420               |
   * | 960 * 720              | 15               | 910                 | 1820               |
   * | 960 * 720              | 30               | 1380                | 2760               |
   * | 1920 * 1080            | 15               | 2080                | 4160               |
   * | 1920 * 1080            | 30               | 3150                | 6300               |
   * | 1920 * 1080            | 60               | 4780                | 6500               |
   * | 2560 * 1440            | 30               | 4850                | 6500               |
   * | 2560 * 1440            | 60               | 6500                | 6500               |
   * | 3840 * 2160            | 30               | 6500                | 6500               |
   * | 3840 * 2160            | 60               | 6500                | 6500               |
   */
  int bitrate;

  /**
   * (For future use) The minimum encoding bitrate (Kbps).
   *
   * The Agora SDK automatically adjusts the encoding bitrate to adapt to the
   * network conditions.
   *
   * Using a value greater than the default value forces the video encoder to
   * output high-quality images but may cause more packet loss and hence
   * sacrifice the smoothness of the video transmission. That said, unless you
   * have special requirements for image quality, Agora does not recommend
   * changing this value.
   *
   * @note
   * This parameter applies to the live-broadcast profile only.
   */
  int minBitrate;
  /**
   * (For future use) The video orientation mode: #ORIENTATION_MODE.
   */
  ORIENTATION_MODE orientationMode;
  /**
   *
   * The video degradation preference under limited bandwidth: #DEGRADATION_PREFERENCE.
   */
  DEGRADATION_PREFERENCE degradationPreference;

  /**
   * If mirror_type is set to VIDEO_MIRROR_MODE_ENABLED, then the video frame would be mirrored before encoding.
   */
  VIDEO_MIRROR_MODE_TYPE mirrorMode;

  VideoEncoderConfiguration(const VideoDimensions& d, int f, int b, ORIENTATION_MODE m, VIDEO_MIRROR_MODE_TYPE mirror = VIDEO_MIRROR_MODE_DISABLED)
      : codecType(VIDEO_CODEC_H264),
        dimensions(d),
        frameRate(f),
        bitrate(b),
        minBitrate(DEFAULT_MIN_BITRATE),
        orientationMode(m),
        degradationPreference(MAINTAIN_QUALITY),
        mirrorMode(mirror) {}
  VideoEncoderConfiguration(int width, int height, int f, int b, ORIENTATION_MODE m, VIDEO_MIRROR_MODE_TYPE mirror = VIDEO_MIRROR_MODE_DISABLED)
      : codecType(VIDEO_CODEC_H264),
        dimensions(width, height),
        frameRate(f),
        bitrate(b),
        minBitrate(DEFAULT_MIN_BITRATE),
        orientationMode(m),
        degradationPreference(MAINTAIN_QUALITY),
        mirrorMode(mirror) {}
  VideoEncoderConfiguration(const VideoEncoderConfiguration& config)
      : codecType(config.codecType),
        dimensions(config.dimensions),
        frameRate(config.frameRate),
        bitrate(config.bitrate),
        minBitrate(config.minBitrate),
        orientationMode(config.orientationMode),
        degradationPreference(config.degradationPreference),
        mirrorMode(config.mirrorMode) {}
  VideoEncoderConfiguration()
      : codecType(VIDEO_CODEC_H264),
        dimensions(FRAME_WIDTH_640, FRAME_HEIGHT_360),
        frameRate(FRAME_RATE_FPS_15),
        bitrate(STANDARD_BITRATE),
        minBitrate(DEFAULT_MIN_BITRATE),
        orientationMode(ORIENTATION_MODE_ADAPTIVE),
        degradationPreference(MAINTAIN_QUALITY),
        mirrorMode(VIDEO_MIRROR_MODE_DISABLED) {}
};

enum CAMERA_DIRECTION {
  /** The rear camera. */
  CAMERA_REAR = 0,
  /** The front camera. */
  CAMERA_FRONT = 1,
};

/** Camera capturer configuration.*/
struct CameraCapturerConfiguration {
  /** Camera direction settings (for Android/iOS only). See: #CAMERA_DIRECTION. */
  CAMERA_DIRECTION cameraDirection;
};

/**
 * The definition of the of SimulcastStreamConfig struct.
 */
struct SimulcastStreamConfig {
  /**
   * The video frame dimension: VideoDimensions.
   */
  VideoDimensions dimensions;
  /**
   * The video bitrate (Kbps).
   */
  int bitrate;
  /**
   * The video framerate.
   */
  int framerate;
  SimulcastStreamConfig() : dimensions(160, 120), bitrate(65), framerate(5) {}
};

/**
 * The relative location of the region to the screen or window.
 */
struct Rectangle {
  /**
   * The horizontal offset from the top-left corner.
   */
  int x;
  /**
   * The vertical offset from the top-left corner.
   */
  int y;
  /**
   * The width of the region.
   */
  int width;
  /**
   * The height of the region.
   */
  int height;

  Rectangle() : x(0), y(0), width(0), height(0) {}
  Rectangle(int xx, int yy, int ww, int hh) : x(xx), y(yy), width(ww), height(hh) {}
};

/** The options of the watermark image to be added. */
struct WatermarkRatio {
  /**
   * The ratio of the width of the video, see #WATERMARK_FIT_MODE::FIT_MODE_USE_IMAGE_RATIO
   */
  float xRatio;
  /**
   * The ratio of the height of the video, see #WATERMARK_FIT_MODE::FIT_MODE_USE_IMAGE_RATIO
   */
  float yRatio;
  /**
   * The ratio of the width of the video, see #WATERMARK_FIT_MODE::FIT_MODE_USE_IMAGE_RATIO
   */
  float widthRatio;

  WatermarkRatio() : xRatio(0.0), yRatio(0.0), widthRatio(0.0) {}
  WatermarkRatio(float x, float y, float width) : xRatio(x), yRatio(y), widthRatio(width) {}
};

/** The options of the watermark image to be added. */
struct WatermarkOptions {
  /** Sets whether or not the watermark image is visible in the local video preview:
   * - true: (Not support) The watermark image is visible in preview.
   * - false: (Default) The watermark image is not visible in preview.
   */
  bool visibleInPreview;
  /**
   * The watermark position in the landscape mode. See Rectangle.
   * For detailed information on the landscape mode, see the advanced guide *Video Rotation*.
   */
  Rectangle positionInLandscapeMode;
  /**
   * The watermark position in the portrait mode. See #WATERMARK_FIT_MODE::FIT_MODE_USE_IMAGE_RATIO.
   */
  Rectangle positionInPortraitMode;
  /**
   * The watermark position in the ratio mode. See Rectangle.
   * For detailed information on the portrait mode, see the advanced guide *Video Rotation*.
   */
  WatermarkRatio watermarkRatio;
  /**
   * The fit mode of watermark.
   */
  WATERMARK_FIT_MODE mode;

  WatermarkOptions()
      : visibleInPreview(false)
      , positionInLandscapeMode(0, 0, 0, 0)
      , positionInPortraitMode(0, 0, 0, 0)
      , mode(FIT_MODE_COVER_POSITION)
  {}
};

/**
 * The definition of the RtcStats struct.
 */
struct RtcStats {
  /**
   * The connection ID.
   */
  unsigned int connectionId;
  /**
   * The call duration (s), represented by an aggregate value.
   */
  unsigned int duration;
  /**
   * The total number of bytes transmitted, represented by an aggregate value.
   */
  unsigned int txBytes;
  /**
   * The total number of bytes received, represented by an aggregate value.
   */
  unsigned int rxBytes;
  /**
   * The total number of audio bytes sent (bytes), represented by an aggregate value.
   */
  unsigned int txAudioBytes;
  /**
   * The total number of video bytes sent (bytes), represented by an aggregate value.
   */
  unsigned int txVideoBytes;
  /**
   * The total number of audio bytes received (bytes), represented by an aggregate value.
   */
  unsigned int rxAudioBytes;
  /**
   * The total number of video bytes received (bytes), represented by an aggregate value.
   */
  unsigned int rxVideoBytes;
  /**
   * The transmission bitrate (Kbps), represented by an instantaneous value.
   */
  unsigned short txKBitRate;
  /**
   * The receiving bitrate (Kbps), represented by an instantaneous value.
   */
  unsigned short rxKBitRate;
  /**
   * Audio receiving bitrate (Kbps), represented by an instantaneous value.
   */
  unsigned short rxAudioKBitRate;
  /**
   * The audio transmission bitrate (Kbps), represented by an instantaneous value.
   */
  unsigned short txAudioKBitRate;
  /**
   * The video receive bitrate (Kbps), represented by an instantaneous value.
   */
  unsigned short rxVideoKBitRate;
  /**
   * The video transmission bitrate (Kbps), represented by an instantaneous value.
   */
  unsigned short txVideoKBitRate;
  /**
   * The VOS client-server latency (ms).
   */
  unsigned short lastmileDelay;
  /**
   * The number of users in the channel.
   */
  unsigned int userCount;
  /**
   * The app CPU usage (%).
   */
  double cpuAppUsage;
  /**
   * The system CPU usage (%).
   */
  double cpuTotalUsage;
  /**
   * The time elapsed from the when the app starts connecting to an Agora channel
   * to when the connection is established. 0 indicates that this member does not apply.
   */
  int connectTimeMs;
  /**
   * The duration (ms) between the app starting connecting to an Agora channel
   * and the first audio packet is received. 0 indicates that this member does not apply.
   */
  int firstAudioPacketDuration;
  /**
   * The duration (ms) between the app starting connecting to an Agora channel
   * and the first video packet is received. 0 indicates that this member does not apply.
   */
  int firstVideoPacketDuration;
  /**
   * The duration (ms) between the app starting connecting to an Agora channel
   * and the first video key frame is received. 0 indicates that this member does not apply.
   */
  int firstVideoKeyFramePacketDuration;
  /**
   * The number of video packets before the first video key frame is received.
   * 0 indicates that this member does not apply.
   */
  int packetsBeforeFirstKeyFramePacket;
    /**
   * The duration (ms) between the last time unmute audio and the first audio packet is received.
   * 0 indicates that this member does not apply.
   */
  int firstAudioPacketDurationAfterUnmute;
  /**
   * The duration (ms) between the last time unmute video and the first video packet is received.
   * 0 indicates that this member does not apply.
   */
  int firstVideoPacketDurationAfterUnmute;
  /**
   * The duration (ms) between the last time unmute video and the first video key frame is received.
   * 0 indicates that this member does not apply.
   */
  int firstVideoKeyFramePacketDurationAfterUnmute;
  /**
   * The duration (ms) between the last time unmute video and the first video key frame is decoded.
   * 0 indicates that this member does not apply.
   */
  int firstVideoKeyFrameDecodedDurationAfterUnmute;
  /**
   * The duration (ms) between the last time unmute video and the first video key frame is rendered.
   * 0 indicates that this member does not apply.
   */
  int firstVideoKeyFrameRenderedDurationAfterUnmute;
  RtcStats() :
      connectionId(0),
      duration(0),
      txBytes(0),
      rxBytes(0),
      txAudioBytes(0),
      txVideoBytes(0),
      rxAudioBytes(0),
      rxVideoBytes(0),
      txKBitRate(0),
      rxKBitRate(0),
      rxAudioKBitRate(0),
      txAudioKBitRate(0),
      rxVideoKBitRate(0),
      txVideoKBitRate(0),
      lastmileDelay(0),
      userCount(0),
      cpuAppUsage(0.0),
      cpuTotalUsage(0.0),
      connectTimeMs(0),
      firstAudioPacketDuration(0),
      firstVideoPacketDuration(0),
      firstVideoKeyFramePacketDuration(0),
      packetsBeforeFirstKeyFramePacket(0),
      firstAudioPacketDurationAfterUnmute(0),
      firstVideoPacketDurationAfterUnmute(0),
      firstVideoKeyFramePacketDurationAfterUnmute(0),
      firstVideoKeyFrameDecodedDurationAfterUnmute(0),
      firstVideoKeyFrameRenderedDurationAfterUnmute(0) {}
};

/**
* Video source types definition.
**/
enum VIDEO_SOURCE_TYPE {
  /** Video captured by the camera.
   */
  VIDEO_SOURCE_CAMERA,
  /** Video for screen sharing.
   */
  VIDEO_SOURCE_SCREEN,
  /** Video for custom video.
   */
  VIDEO_SOURCE_CUSTOM,
};

/**
 * User role types.
 */
enum CLIENT_ROLE_TYPE {
  /**
   * 1: Broadcaster. A broadcaster can both send and receive streams.
   */
  CLIENT_ROLE_BROADCASTER = 1,
  /**
   * 2: Audience. An audience can only receive streams.
   */
  CLIENT_ROLE_AUDIENCE = 2,
};

/**
 * The definition of the RemoteAudioStats struct, which
 * reports the audio statistics of a remote user.
 */
struct RemoteAudioStats
{
  /**
   * User ID of the remote user sending the audio stream.
   */
  uid_t uid;
  /**
   * The quality of the remote audio: #QUALITY_TYPE.
   */
  int quality;
  /**
   * The network delay (ms) from the sender to the receiver.
   */
  int networkTransportDelay;
  /**
   * The network delay (ms) from the receiver to the jitter buffer.
   */
  int jitterBufferDelay;
  /**
   * The audio frame loss rate in the reported interval.
   */
  int audioLossRate;
  /**
   * The number of channels.
   */
  int numChannels;
  /**
   * The sample rate (Hz) of the remote audio stream in the reported interval.
   */
  int receivedSampleRate;
  /**
   * The average bitrate (Kbps) of the remote audio stream in the reported
   * interval.
   */
  int receivedBitrate;
  /**
   * The total freeze time (ms) of the remote audio stream after the remote
   * user joins the channel.
   *
   * In a session, audio freeze occurs when the audio frame loss rate reaches 4%.
   */
  int totalFrozenTime;
  /**
   * The total audio freeze time as a percentage (%) of the total time when the
   * audio is available.
   */
  int frozenRate;
  RemoteAudioStats() :
    uid(0),
    quality(0),
    networkTransportDelay(0),
    jitterBufferDelay(0),
    audioLossRate(0),
    numChannels(0),
    receivedSampleRate(0),
    receivedBitrate(0),
    totalFrozenTime(0),
    frozenRate(0) {}
};

/**
 * Audio profile types.
 */
enum AUDIO_PROFILE_TYPE {
  /**
   * 0: The default audio profile.
   * - In the Communication profile, the default value is the same with `AUDIO_PROFILE_SPEECH_STANDARD`(1).
   * - In the Live-broadcast profile, it represents a sample rate of 48 kHz, music encoding, mono, and a bitrate
   * of up to 52 Kbps.
   */
  AUDIO_PROFILE_DEFAULT = 0,
  /**
   * 1: A sample rate of 32 kHz, audio encoding, mono, and a bitrate up to 18 Kbps.
   */
  AUDIO_PROFILE_SPEECH_STANDARD = 1,
  /**
   * 2: A sample rate of 48 kHz, music encoding, mono, and a bitrate of up to 48 Kbps.
   */
  AUDIO_PROFILE_MUSIC_STANDARD = 2,
  /**
   * 3: A sample rate of 48 kHz, music encoding, stereo, and a bitrate of up to 56
   * Kbps.
   */
  AUDIO_PROFILE_MUSIC_STANDARD_STEREO = 3,
  /**
   * 4: A sample rate of 48 kHz, music encoding, mono, and a bitrate of up to 128 Kbps.
   */
  AUDIO_PROFILE_MUSIC_HIGH_QUALITY = 4,
  /**
   * 5: A sample rate of 48 kHz, music encoding, stereo, and a bitrate of up to 192 Kbps.
   */
  AUDIO_PROFILE_MUSIC_HIGH_QUALITY_STEREO = 5,
  /**
   * 6: Reserved.
   */
  AUDIO_PROFILE_IOT = 6,
  AUDIO_PROFILE_NUM = 7
};

/**
 * Audio scenario types.
 */
enum AUDIO_SCENARIO_TYPE {
  /**
   * 0: The default audio scenario.
   */
  AUDIO_SCENARIO_DEFAULT = 0,
  /**
   * 1: The entertainment scenario, which supports voice during gameplay.
   */
  AUDIO_SCENARIO_CHATROOM_ENTERTAINMENT = 1,
  /**
   * 2: The education scenario, which prioritizes smoothness and stability.
   */
  AUDIO_SCENARIO_EDUCATION = 2,
  /**
   * 3: The live gaming scenario, which needs to enable gaming audio effects in
   * the speaker. Choose this scenario to achieve high-fidelity music playback.
   */
  AUDIO_SCENARIO_GAME_STREAMING = 3,
  /**
   * 4: The showroom scenario, which optimizes the audio quality with professional
   * external equipment.
   */
  AUDIO_SCENARIO_SHOWROOM = 4,
  /**
   * 5: The gaming scenario.
   */
  AUDIO_SCENARIO_CHATROOM_GAMING = 5,
  /**
   * 6: High definition.
   */
  AUDIO_SCENARIO_HIGH_DEFINITION = 6,
  /**
   * 7: Reserved.
   */
  AUDIO_SCENARIO_NUM = 7,
};

/**
 * The definition of the VideoFormat struct.
 */
struct VideoFormat {
  enum : size_t {
    /** The max value (px) of the width. */
    kMaxWidthInPixels = 3840,
    /** The max value (px) of the height. */
    kMaxHeightInPixels = 2160,
    /** The max value (fps) of the frame rate. */
    kMaxFps = 60,
  };

  /**
   * The width (px) of the video.
   */
  int width;   // Number of pixels.
  /**
   * The height (px) of the video.
   */
  int height;  // Number of pixels.
  /**
   * The video frame rate (fps).
   */
  int fps;
  VideoFormat() : width(FRAME_WIDTH_640), height(FRAME_HEIGHT_360), fps(FRAME_RATE_FPS_15) {}
  VideoFormat(int w, int h, int f) : width(w), height(h), fps(f) {}
};

/**
 * Video content hints.
 */
enum VIDEO_CONTENT_HINT {
  /**
   * (Default) No content hint. In this case, the Agora video engine makes its
   * best-informed guess on how to treat the video content.
   */
  CONTENT_HINT_NONE,
  /**
   * Motion-intensive content. Choose this option if you prefer smoothness or when
   * you are sharing a video clip, movie, or video game.
   *
   * Quantization artifacts and downscaling are acceptable in order to preserve
   * motion as well as possible while still retaining target bitrates. During
   * low bitrates when compromises have to be made, more effort is spent on
   * preserving frame rate than edge quality and details.
   */
  CONTENT_HINT_MOTION,
  /**
   * Motionless content. Choose this option if you prefer sharpness or when you are
   * sharing a picture, PowerPoint slide, ot text.
   *
   * This setting optimizes details, which may give rise to individual frames rather
   * than smooth playback. Artifacts from quantization or downscaling that make small text or line art
   * unintelligible should be avoided.
   */
  CONTENT_HINT_DETAILS
};

/**
 * Remote video stream types.
 */
enum REMOTE_VIDEO_STREAM_TYPE {
  /**
   * 0: The high-quality video stream, which features in high-resolution and high-bitrate.
   */
  REMOTE_VIDEO_STREAM_HIGH = 0,
  /**
   * 1: The low-quality video stream, which features in low-resolution and low-bitrate.
   */
  REMOTE_VIDEO_STREAM_LOW = 1,
};

/**
 * States of the local audio.
 */
enum LOCAL_AUDIO_STREAM_STATE {
  /**
   * 0: The local audio is in the initial state.
   */
  LOCAL_AUDIO_STREAM_STATE_STOPPED = 0,
  /**
   * 1: The audio recording device starts successfully.
   */
  LOCAL_AUDIO_STREAM_STATE_RECORDING = 1,
  /**
   * 2: The first audio frame is encoded successfully.
   */
  LOCAL_AUDIO_STREAM_STATE_ENCODING = 2,
  /**
   * 3: The local audio fails to start.
   */
  LOCAL_AUDIO_STREAM_STATE_FAILED = 3
};

/**
 * Reasons for the local audio failure.
 */
enum LOCAL_AUDIO_STREAM_ERROR {
  /**
   * 0: The local audio is normal.
   */
  LOCAL_AUDIO_STREAM_ERROR_OK = 0,
  /**
   * 1: No specified reason for the local audio failure.
   */
  LOCAL_AUDIO_STREAM_ERROR_FAILURE = 1,
  /**
   * 2: No permission to use the local audio device.
   */
  LOCAL_AUDIO_STREAM_ERROR_DEVICE_NO_PERMISSION = 2,
  /**
   * 3: The microphone is in use.
   */
  LOCAL_AUDIO_STREAM_ERROR_DEVICE_BUSY = 3,
  /**
   * 4: The local audio recording fails. Check whether the recording device
   * is working properly.
   */
  LOCAL_AUDIO_STREAM_ERROR_RECORD_FAILURE = 4,
  /**
   * 5: The local audio encoding fails.
   */
  LOCAL_AUDIO_STREAM_ERROR_ENCODE_FAILURE = 5
};

/**
 * States of the local video.
 */
enum LOCAL_VIDEO_STREAM_STATE {
  /**
   * 0: The local video is in the initial state.
   */
  LOCAL_VIDEO_STREAM_STATE_STOPPED = 0,
  /**
   * 1: The capturer starts successfully.
   */
  LOCAL_VIDEO_STREAM_STATE_CAPTURING = 1,
  /**
   * 2: The first video frame is encoded successfully.
   */
  LOCAL_VIDEO_STREAM_STATE_ENCODING = 2,
  /**
   * 3: The local video fails to start.
   */
  LOCAL_VIDEO_STREAM_STATE_FAILED = 3
};

/**
 * Reasons for the local video failure.
 */
enum LOCAL_VIDEO_STREAM_ERROR {
  /**
   * 0: The local video is normal.
   */
  LOCAL_VIDEO_STREAM_ERROR_OK = 0,
  /**
   * 1: No specified reason for the local video failure.
   */
  LOCAL_VIDEO_STREAM_ERROR_FAILURE = 1,
  /**
   * 2: No permission to use the local video device.
   */
  LOCAL_VIDEO_STREAM_ERROR_DEVICE_NO_PERMISSION = 2,
  /**
   * 3: The local video capturer is in use.
   */
  LOCAL_VIDEO_STREAM_ERROR_DEVICE_BUSY = 3,
  /**
   * 4: The local video capture fails. Check whether the capturer is working properly.
   */
  LOCAL_VIDEO_STREAM_ERROR_CAPTURE_FAILURE = 4,
  /**
   * 5: The local video encoding fails.
   */
  LOCAL_VIDEO_STREAM_ERROR_ENCODE_FAILURE = 5
};

/**
 * Remote audio states.
 */
enum REMOTE_AUDIO_STATE
{
  /**
   * 0: The remote audio is in the default state, probably due to
   * `REMOTE_AUDIO_REASON_LOCAL_MUTED(3)`,
   * `REMOTE_AUDIO_REASON_REMOTE_MUTED(5)`, or
   * `REMOTE_AUDIO_REASON_REMOTE_OFFLINE(7)`.
   */
  REMOTE_AUDIO_STATE_STOPPED = 0,  // Default state, audio is started or remote user disabled/muted audio stream
  /**
   * 1: The first remote audio packet is received.
   */
  REMOTE_AUDIO_STATE_STARTING = 1,  // The first audio frame packet has been received
  /**
   * 2: The remote audio stream is decoded and plays normally, probably
   * due to `REMOTE_AUDIO_REASON_NETWORK_RECOVERY(2)`,
   * `REMOTE_AUDIO_REASON_LOCAL_UNMUTED(4)`, or
   * `REMOTE_AUDIO_REASON_REMOTE_UNMUTED(6)`.
   */
  REMOTE_AUDIO_STATE_DECODING = 2,  // The first remote audio frame has been decoded or fronzen state ends
  /**
   * 3: The remote audio is frozen, probably due to
   * `REMOTE_AUDIO_REASON_NETWORK_CONGESTION(1)`.
   */
  REMOTE_AUDIO_STATE_FROZEN = 3,    // Remote audio is frozen, probably due to network issue
  /**
   * 4: The remote audio fails to start, probably due to
   * `REMOTE_AUDIO_REASON_INTERNAL(0)`.
   */
  REMOTE_AUDIO_STATE_FAILED = 4,    // Remote audio play failed
};

/**
 * Reasons for a remote audio state change.
 */
enum REMOTE_AUDIO_STATE_REASON
{
  /**
   * 0: Internal reasons.
   */
  REMOTE_AUDIO_REASON_INTERNAL = 0,
  /**
   * 1: Network congestion.
   */
  REMOTE_AUDIO_REASON_NETWORK_CONGESTION = 1,
  /**
   * 2: Network recovery.
   */
  REMOTE_AUDIO_REASON_NETWORK_RECOVERY = 2,
  /**
   * 3: The local user stops receiving the remote audio stream or
   * disables the audio module.
   */
  REMOTE_AUDIO_REASON_LOCAL_MUTED = 3,
  /**
   * 4: The local user resumes receiving the remote audio stream or
   * enables the audio module.
   */
  REMOTE_AUDIO_REASON_LOCAL_UNMUTED = 4,
  /**
   * 5: The remote user stops sending the audio stream or disables the
   * audio module.
   */
  REMOTE_AUDIO_REASON_REMOTE_MUTED = 5,
  /**
   * 6: The remote user resumes sending the audio stream or enables the
   * audio module.
   */
  REMOTE_AUDIO_REASON_REMOTE_UNMUTED = 6,
  /**
   * 7: The remote user leaves the channel.
   */
  REMOTE_AUDIO_REASON_REMOTE_OFFLINE = 7,
};

/**
 * Remote video states.
 */
enum REMOTE_VIDEO_STATE {
  /**
   * 0: The remote video is in the initial state.
   */
  REMOTE_VIDEO_STATE_STOPPED = 0,
  /**
   * 1: The remote video packet is received, but not decoded.
   */
  REMOTE_VIDEO_STATE_STARTING = 1,
  /**
   * 2: The remote video stream is decoded and plays normally, probably due to #REMOTE_VIDEO_STATE_REASON_NETWORK_RECOVERY (2), #REMOTE_VIDEO_STATE_REASON_LOCAL_UNMUTED (4), #REMOTE_VIDEO_STATE_REASON_REMOTE_UNMUTED (6), or #REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK_RECOVERY (9).
   */
   REMOTE_VIDEO_STATE_DECODING = 2,
  /**
   * 3: The remote video is frozen, probably due to some network issue.
   */
  REMOTE_VIDEO_STATE_FROZEN = 3,
  /**
   * 4: The remote video fails to start, probably due to #REMOTE_VIDEO_STATE_REASON_INTERNAL (0).
   */
  REMOTE_VIDEO_STATE_FAILED = 4,
};

/**
 * Reasons for a remote video state change.
 */
enum REMOTE_VIDEO_STATE_REASON {
  /**
  * 0: Internal reasons.
  */
  REMOTE_VIDEO_STATE_REASON_INTERNAL = 0,

  /**
  * 1: Network congestion.
  */
  REMOTE_VIDEO_STATE_REASON_NETWORK_CONGESTION = 1,

  /**
  * 2: Network recovery.
  */
  REMOTE_VIDEO_STATE_REASON_NETWORK_RECOVERY = 2,

  /**
  * 3: The local user stops receiving the remote video stream or disables the video module.
  */
  REMOTE_VIDEO_STATE_REASON_LOCAL_MUTED = 3,

  /**
  * 4: The local user resumes receiving the remote video stream or enables the video module.
  */
  REMOTE_VIDEO_STATE_REASON_LOCAL_UNMUTED = 4,

  /**
  * 5: The remote user stops sending the video stream or disables the video module.
  */
  REMOTE_VIDEO_STATE_REASON_REMOTE_MUTED = 5,

  /**
  * 6: The remote user resumes sending the video stream or enables the video module.
  */
  REMOTE_VIDEO_STATE_REASON_REMOTE_UNMUTED = 6,

  /**
  * 7: The remote user leaves the channel.
  */
  REMOTE_VIDEO_STATE_REASON_REMOTE_OFFLINE = 7,

  /**
  * 8: The remote media stream falls back to the audio-only stream due to poor network conditions.
  */
  REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK = 8,

  /**
  * 9: The remote media stream switches back to the video stream after the network conditions improve.
  */
  REMOTE_VIDEO_STATE_REASON_AUDIO_FALLBACK_RECOVERY = 9
};

/**
 * The definition of the VideoTrackInfo struct, which contains information of
 * the video track.
 */
struct VideoTrackInfo {
  VideoTrackInfo()
  : ownerUid(0), trackId(0), connectionId(0)
  , streamType(REMOTE_VIDEO_STREAM_HIGH), codecType(VIDEO_CODEC_H264)
  , encodedFrameOnly(false), sourceType(VIDEO_SOURCE_CAMERA) {}
  /**
   * ID of the user who publishes the video track.
   */
  uid_t ownerUid;
  /**
   * ID of the video track.
   */
  track_id_t trackId;
  /**
   * The connection ID of the video track.
   */
  conn_id_t connectionId;
  /**
   * The video stream type: #REMOTE_VIDEO_STREAM_TYPE.
   */
  REMOTE_VIDEO_STREAM_TYPE streamType;
  /**
   * The video codec type: #VIDEO_CODEC_TYPE.
   */
  VIDEO_CODEC_TYPE codecType;
  /**
   * Whether the video track contains encoded video frame only.
   * - true: The video track contains encoded video frame only.
   * - false: The video track does not contain encoded video frame only.
   */
  bool encodedFrameOnly;
  /**
   * The video source type: #VIDEO_SOURCE_TYPE
   */
  VIDEO_SOURCE_TYPE sourceType;
};

/**
 * The definition of the AudioVolumeInfo struct.
 */
struct AudioVolumeInfo {
  /**
   * User ID of the speaker.
   */
  uid_t uid;
  user_id_t userId;
  /**
   * The volume of the speaker that ranges from 0 to 255.
   */
  unsigned int volume;  // [0,255]
};

/**
 * The definition of the IPacketObserver struct.
 */
class IPacketObserver {
 public:
  virtual ~IPacketObserver() {}
  /**
   * The definition of the Packet struct.
   */
  struct Packet {
    /**
     * The data buffer of the audio packet.
     */
    const unsigned char* buffer;
    /**
     * The size of the audio packet.
     */
    unsigned int size;
  };
  /**
   * Occurs when the SDK is ready to send the audio packet.
   * @param packet The audio packet to be sent: Packet.
   * @return Whether to send the audio packet:
   * - true: Send the packet.
   * - false: Do not send the packet, in which case the audio packet will be discarded.
   */
  virtual bool onSendAudioPacket(Packet& packet) = 0;
  /**
   * Occurs when the SDK is ready to send the video packet.
   * @param packet The video packet to be sent: Packet.
   * @return Whether to send the video packet:
   * - true: Send the packet.
   * - false: Do not send the packet, in which case the audio packet will be discarded.
   */
  virtual bool onSendVideoPacket(Packet& packet) = 0;
  /**
   * Occurs when the audio packet is received.
   * @param packet The received audio packet: Packet.
   * @return Whether to process the audio packet:
   * - true: Process the packet.
   * - false: Do not process the packet, in which case the audio packet will be discarded.
   */
  virtual bool onReceiveAudioPacket(Packet& packet) = 0;
  /**
   * Occurs when the video packet is received.
   * @param packet The received video packet: Packet.
   * @return Whether to process the audio packet:
   * - true: Process the packet.
   * - false: Do not process the packet, in which case the video packet will be discarded.
   */
  virtual bool onReceiveVideoPacket(Packet& packet) = 0;
};
/**
 * The IVideoEncodedImageReceiver class.
 */
class IVideoEncodedImageReceiver {
 public:
  /**
   * Occurs each time the SDK receives an encoded video image.
   * @param imageBuffer The pointer to the video image buffer.
   * @param length The data length of the video image.
   * @param videoEncodedFrameInfo The information of the encoded video frame: EncodedVideoFrameInfo.
   * @return Determines whether to send the video image to the SDK if post-processing fails.
   * - true: Send it to the SDK.
   * - false: Do not send it to the SDK.
   */
  virtual bool OnEncodedVideoImageReceived(const uint8_t* imageBuffer, size_t length,
                                           const EncodedVideoFrameInfo& videoEncodedFrameInfo) = 0;

  virtual ~IVideoEncodedImageReceiver() {}
};

/**
 * Audio sample rate types.
 */
enum AUDIO_SAMPLE_RATE_TYPE {
  /**
   * 32000: 32 KHz.
   */
  AUDIO_SAMPLE_RATE_32000 = 32000,
  /**
   * 44100: 44.1 KHz.
   */
  AUDIO_SAMPLE_RATE_44100 = 44100,
  /**
   * 48000: 48 KHz.
   */
  AUDIO_SAMPLE_RATE_48000 = 48000,
};
/**
 * Video codec profile types.
 */
enum VIDEO_CODEC_PROFILE_TYPE {
  /**
   * 66: Baseline video codec profile. Generally used in video calls on mobile phones.
   */
  VIDEO_CODEC_PROFILE_BASELINE = 66,
  /**
   * 77: Main video codec profile. Generally used in mainstream electronics, such as MP4 players, portable video players, PSP, and iPads.
   */
  VIDEO_CODEC_PROFILE_MAIN = 77,
  /**
   * 100: (Default) High video codec profile. Generally used in high-resolution broadcasts or television.
   */
  VIDEO_CODEC_PROFILE_HIGH = 100,
};

/**
 * Audio codec profile types.
 */
enum AUDIO_CODEC_PROFILE_TYPE {
  /**
   * 0: (Default) LC-AAC, which is the low-complexity audio codec type.
   */
  AUDIO_CODEC_PROFILE_LC_AAC = 0,
  /**
   * 1: HE-AAC, which is the high-efficiency audio codec type.
   */
  AUDIO_CODEC_PROFILE_HE_AAC = 1,
};

/**
 * The definition of the LocalAudioStats struct, which reports audio statistics of
 * the local user.
 */
struct LocalAudioStats
{
  /**
   * The number of audio channels.
   */
  int numChannels;
  /**
   * The sample rate (Hz).
   */
  int sentSampleRate;
  /**
   * The average sending bitrate (Kbps).
   */
  int sentBitrate;
  /**
   * The internal payload type
   */
  int internalCodec;
};


/**
 * States of the RTMP streaming.
 */
enum RTMP_STREAM_PUBLISH_STATE {
  /**
   * 0: The RTMP streaming has not started or has ended.
   *
   * This state is also reported after you remove
   * an RTMP address from the CDN by calling `removePublishStreamUrl`.
   */
  RTMP_STREAM_PUBLISH_STATE_IDLE = 0,
  /**
   * 1: The SDK is connecting to the streaming server and the RTMP server.
   *
   * This state is reported after you call `addPublishStreamUrl`.
   */
  RTMP_STREAM_PUBLISH_STATE_CONNECTING = 1,
  /**
   * 2: The RTMP streaming publishes. The SDK successfully publishes the RTMP streaming and returns
   * this state.
   */
  RTMP_STREAM_PUBLISH_STATE_RUNNING = 2,
  /**
   * 3: The RTMP streaming is recovering. When exceptions occur to the CDN, or the streaming is
   * interrupted, the SDK tries to resume RTMP streaming and reports this state.
   *
   * - If the SDK successfully resumes the streaming, `RTMP_STREAM_PUBLISH_STATE_RUNNING(2)` is reported.
   * - If the streaming does not resume within 60 seconds or server errors occur,
   * `RTMP_STREAM_PUBLISH_STATE_FAILURE(4)` is reported. You can also reconnect to the server by calling
   * `removePublishStreamUrl` and `addPublishStreamUrl`.
   */
  RTMP_STREAM_PUBLISH_STATE_RECOVERING = 3,
  /**
   * 4: The RTMP streaming fails. See the `errCode` parameter for the detailed error information. You
   * can also call `addPublishStreamUrl` to publish the RTMP streaming again.
   */
  RTMP_STREAM_PUBLISH_STATE_FAILURE = 4,
};

/**
 * Error codes of the RTMP streaming.
 */
enum RTMP_STREAM_PUBLISH_ERROR {
  /**
   * -1: The RTMP streaming fails.
   */
  RTMP_STREAM_PUBLISH_ERROR_FAILED = -1,
  /**
   * 0: The RTMP streaming publishes successfully.
   */
  RTMP_STREAM_PUBLISH_ERROR_OK = 0,
  /**
   * 1: Invalid argument. If, for example, you did not call `setLiveTranscoding` to configure the
   * LiveTranscoding parameters before calling `addPublishStreamUrl`, the SDK reports this error.
   * Check whether you set the parameters in `LiveTranscoding` properly.
   */
  RTMP_STREAM_PUBLISH_ERROR_INVALID_ARGUMENT = 1,
  /**
   * 2: The RTMP streaming is encrypted and cannot be published.
   */
  RTMP_STREAM_PUBLISH_ERROR_ENCRYPTED_STREAM_NOT_ALLOWED = 2,
  /**
   * 3: A timeout occurs with the RTMP streaming. Call `addPublishStreamUrl`
   * to publish the streaming again.
   */
  RTMP_STREAM_PUBLISH_ERROR_CONNECTION_TIMEOUT = 3,
  /**
   * 4: An error occurs in the streaming server. Call `addPublishStreamUrl` to publish
   * the stream again.
   */
  RTMP_STREAM_PUBLISH_ERROR_INTERNAL_SERVER_ERROR = 4,
  /**
   * 5: An error occurs in the RTMP server.
   */
  RTMP_STREAM_PUBLISH_ERROR_RTMP_SERVER_ERROR = 5,
  /**
   * 6: The RTMP streaming publishes too frequently.
   */
  RTMP_STREAM_PUBLISH_ERROR_TOO_OFTEN = 6,
  /**
   * 7: The host publishes more than 10 URLs. Delete the unnecessary URLs before adding new ones.
   */
  RTMP_STREAM_PUBLISH_ERROR_REACH_LIMIT = 7,
  /**
   * 8: The host manipulates other hosts' URLs. Check your app logic.
   */
  RTMP_STREAM_PUBLISH_ERROR_NOT_AUTHORIZED = 8,
  /**
   * 9: The Agora server fails to find the RTMP streaming.
   */
  RTMP_STREAM_PUBLISH_ERROR_STREAM_NOT_FOUND = 9,
  /**
   * 10: The format of the RTMP streaming URL is not supported. Check whether the URL format is correct.
   */
  RTMP_STREAM_PUBLISH_ERROR_FORMAT_NOT_SUPPORTED = 10,
  /**
   * 11: CDN related errors. Remove the original URL address and add a new one by calling
   * `removePublishStreamUrl` and `addPublishStreamUrl`.
   */
  RTMP_STREAM_PUBLISH_ERROR_CDN_ERROR = 11,
  /**
   * 12: Resources are occupied and cannot be reused.
   */
  RTMP_STREAM_PUBLISH_ERROR_ALREADY_IN_USE = 12,
};

/** The definition of the RtcImage struct.
 */
typedef struct RtcImage {
  RtcImage() : url(NULL), x(0), y(0), width(0), height(0) {}
  /**
   * The URL address of the watermark on the video.
   */
  const char* url;
  /**
   * The horizontal distance (pixel) between the watermark image's top-left corner and the video's
   * top-left corner.
   */
  int x;
  /**
   * The vertical distance (pixel) between the watermark image's top-left corner and the video's
   * top-left corner.
   */
  int y;
  /**
   * The width of the watermark on the video.
   */
  int width;
  /**
   * The height of the watermark on the video.
   */
  int height;
  /**
   * Order attribute for an ordering of overlapping two-dimensional objects.
   */
  int zOrder;
} RtcImage;

/**
 * Connection state types.
 */
enum CONNECTION_STATE_TYPE
{
  /**
   * 1: The SDK is disconnected from the server.
   */
  CONNECTION_STATE_DISCONNECTED = 1,
  /**
   * 2: The SDK is connecting to the server.
   */
  CONNECTION_STATE_CONNECTING = 2,
  /**
   * 3: The SDK is connected to the server and has joined a channel. You can now publish or subscribe to
   * a track in the channel.
   */
  CONNECTION_STATE_CONNECTED = 3,
  /**
   * 4: The SDK keeps rejoining the channel after being disconnected from the channel, probably because of
   * network issues.
   */
  CONNECTION_STATE_RECONNECTING = 4,
  /**
   * 5: The SDK fails to connect to the server or join the channel.
   */
  CONNECTION_STATE_FAILED = 5,
};

/**
 * The definition of the TranscodingUser struct.
 */
struct TranscodingUser {
  /**
   * User ID of the CDN live streaming.
   */
  uid_t uid;
  user_id_t userId;
  /**
   * The horizontal position of the top left corner of the video frame.
   */
  int x;
  /**
   * The vertical position of the top left corner of the video frame.
   */
  int y;
  /**
   * The width of the video frame.
   */
  int width;
  /**
   * The height of the video frame.
   */
  int height;
  /**
   * The layer of the video frame that ranges from 1 to 100:
  * - 1: (Default) The lowest layer.
  * - 100: The highest layer.
  */
  int zOrder;
  /**
   * The transparency of the video frame.
   */
  double alpha;
  /**
   * The audio channel of the sound that ranges from 0 to 5. Special players are needed if it is not set
   * as 0.
   * - 0: (default) Supports dual channels at most, depending on the upstream of the broadcaster.
   * - 1: The audio stream of the broadcaster is in the FL audio channel. If the upstream of the
   * broadcaster uses dual sound channel, only the left sound channel is used for streaming.
   * - 2: The audio stream of the broadcaster is in the FC audio channel. If the upstream of the
   * broadcaster uses dual sound channel, only the left sound channel is used for streaming.
   * - 3: The audio stream of the broadcaster is in the FR audio channel. If the upstream of the
   * broadcaster uses dual sound channel, only the left sound channel is used for streaming.
   * - 4: The audio stream of the broadcaster is in the BL audio channel. If the upstream of the
   * broadcaster uses dual sound channel, only the left sound channel is used for streaming.
   * - 5: The audio stream of the broadcaster is in the BR audio channel. If the upstream of the
   * broadcaster uses dual sound channel, only the left sound channel is used for streaming.
  */
  int audioChannel;
  TranscodingUser()
      : uid(0),
        userId(NULL),
        x(0),
        y(0),
        width(0),
        height(0),
        zOrder(0),
        alpha(1.0),
        audioChannel(0) {}
};

/**
 * The definition of the LiveTranscoding struct.
 */
struct LiveTranscoding {
  /**
   * The width of the video in pixels. The default value is 360.
   *
   * - When pushing video streams to the CDN, ensure that width is at least 64; otherwise, the Agora server adjusts the value to 64.
   * - When pushing audio streams to the CDN, set width and height as 0..
   */
  int width;
  /**
   * The height of the video in pixels. The default value is 640.
   *
   * - When pushing video streams to the CDN, ensure that height is at least 64; otherwise, the Agora server adjusts the value to 64.
   * - When pushing audio streams to the CDN, set width and height as 0.
   */
  int height;
  /**
   * The bitrate (Kbps) of the video. The default value is 400. Set this parameter according to the bitrate
   * you set in VideoEncoderConfiguration. If you set a bitrate beyond the proper range, the SDK automatically
   * adapts it to a value within the range.
   */
  int videoBitrate;
  /**
   * The frame rate (fps) of the video that ranges from 0 to 30. The default value is 15. The server
   * adjusts any value over 30 to 30.
   */
  int videoFramerate;
  /**
   * Determines whether to enable low latency.
   * - true: Low latency with unassured quality.
   * - false: (Default) High latency with assured quality.
   */
  bool lowLatency;
  /**
   * Gop (Group of video) of the video frames in the CDN live stream. The default value is 30 fps.
   */
  int videoGop;
  /**
   * The video codec profile: #VIDEO_CODEC_PROFILE_TYPE.
   */
  VIDEO_CODEC_PROFILE_TYPE videoCodecProfile;
  /**
   * The background color in RGB hex. Value only, do not include a preceeding #.
   * For example, 0xFFB6C1 (light pink). The default value is 0x000000 (black).
   */
  unsigned int backgroundColor;
  /**
   * The number of users in the live broadcast.
   */
  unsigned int userCount;
  /**
   * The user layout configuration in the CDN live streaming.: TranscodingUser.
   */
  TranscodingUser* transcodingUsers;
  /**
   * Extra user-defined information sent to the CDN client. The extra
   * infomation will be transmitted by SEI packets.
   */
  const char* transcodingExtraInfo;
  /**
   * The pointer to the metadata sent to the CDN client.
   */
  const char* metadata;
  /**
   * The watermark image added to the CDN live publishing stream. Ensure that the format of the image is
   * PNG. Once a watermark image is added, the audience of the CDN live publishing stream can see it.
   * See #RtcImage.
  */
  RtcImage* watermark;
  /**
    * The variables means the count of watermark.
    * if watermark is array, watermarkCount is count of watermark.
    * if watermark is just a pointer, watermarkCount pointer to object address. At the same time, watermarkCount must be 0 or 1.
    * default value: 0, compatible with old user-api
  */
  unsigned int watermarkCount;
  /**
   * The background image added to the CDN live publishing stream. Once a background image is added,
   * the audience of the CDN live publishing stream can see it. See #RtcImage.
  */
  RtcImage* backgroundImage;
  /**
    * The variables means the count of backgroundImage.
    * if backgroundImage is array, backgroundImageCount is count of backgroundImage.
    * if backgroundImage is just a pointer, backgroundImageCount pointer to object address. At the same time, backgroundImageCount must be 0 or 1.
    * default value: 0, compatible with old user-api
  */
  unsigned int backgroundImageCount;
  /**
   * The audio sample rates: #AUDIO_SAMPLE_RATE_TYPE.
   */
  AUDIO_SAMPLE_RATE_TYPE audioSampleRate;
  /**
   * The bitrate (Kbps) of the audio output stream set for CDN live. The default value is 48 and the
   * highest value is 128.
  */
  int audioBitrate;
  /**
   * The number of audio channels for the CDN live stream. Agora recommends choosing 1 (mono), or
   * 2 (stereo) audio channels. Special players are required if you choose 3, 4, or 5.
   * - 1: (Default) Mono.
   * - 2: Stereo.
   * - 3: Three audio channels.
   * - 4: Four audio channels.
   * - 5: Five audio channels.
  */
  int audioChannels;
  /**
   * The audio codec profile type: #AUDIO_CODEC_PROFILE_TYPE.
   */
  AUDIO_CODEC_PROFILE_TYPE audioCodecProfile;

  LiveTranscoding()
      : width(360),
        height(640),
        videoBitrate(400),
        videoFramerate(15),
        lowLatency(false),
        videoGop(30),
        videoCodecProfile(VIDEO_CODEC_PROFILE_HIGH),
        backgroundColor(0x000000),
        userCount(0),
        transcodingUsers(NULL),
        transcodingExtraInfo(NULL),
        metadata(NULL),
        watermark(NULL),
        watermarkCount(0),
        backgroundImage(NULL),
        backgroundImageCount(0),
        audioSampleRate(AUDIO_SAMPLE_RATE_48000),
        audioBitrate(48),
        audioChannels(1),
        audioCodecProfile(AUDIO_CODEC_PROFILE_LC_AAC) {}
};

/**
 * The definition of the LastmileProbeConfig struct.
 */
struct LastmileProbeConfig {
  /**
   * Determines whether to test the uplink network. Some users, for example,
   * the audience in a live broadcast channel, do not need such a test:
   * - true: Test.
   * - false: Do not test.
   */
  bool probeUplink;
  /**
   * Determines whether to test the downlink network:
   * - true: Test.
   * - false: Do not test.
   */
  bool probeDownlink;
  /**
   * The expected maximum sending bitrate (bps) of the local user. The value
   * ranges between 100000 and 5000000. We recommend setting this parameter
   * according to the bitrate value set by `setVideoEncoderConfiguration`.
   */
  unsigned int expectedUplinkBitrate;
  /**
   * The expected maximum receiving bitrate (bps) of the local user. The value
   * ranges between 100000 and 5000000.
   */
  unsigned int expectedDownlinkBitrate;
};

/**
 * States of the last mile network probe result.
 */
enum LASTMILE_PROBE_RESULT_STATE {
  /**
   * 1: The probe result is complete.
   */
  LASTMILE_PROBE_RESULT_COMPLETE = 1,
  /**
   * 2: The probe result is incomplete and bandwidth estimation is not
   * available, probably due to temporary limited test resources.
   */
  LASTMILE_PROBE_RESULT_INCOMPLETE_NO_BWE = 2,
  /**
   * 3: The probe result is not available, probably due to poor network
   * conditions.
   */
  LASTMILE_PROBE_RESULT_UNAVAILABLE = 3
};

/**
 * The definition of the LastmileProbeOneWayResult struct, which reports the uplink or downlink
 * last-mile network probe test result.
 */
struct LastmileProbeOneWayResult {
  /**
   * The packet loss rate (%).
   */
  unsigned int packetLossRate;
  /**
   * The network jitter (ms).
   */
  unsigned int jitter;
  /**
   * The estimated available bandwidth (bps).
   */
  unsigned int availableBandwidth;
};

/**
 * The definition of the LastmileProbeResult struct, which reports the uplink and downlink last-mile
 * network probe test result.
 */
struct LastmileProbeResult {
  /**
   * The state of last-mile network probe test: #LASTMILE_PROBE_RESULT_STATE.
   */
  LASTMILE_PROBE_RESULT_STATE state;
  /**
   * The uplink last-mile network probe test result: LastmileProbeOneWayResult.
   */
  LastmileProbeOneWayResult uplinkReport;
  /**
   * The downlink last-mile network probe test result: LastmileProbeOneWayResult.
   */
  LastmileProbeOneWayResult downlinkReport;
  /**
   * The round-trip delay time (ms).
   */
  unsigned int rtt;
};

/**
 * Reasons for a connection state change.
 */
enum CONNECTION_CHANGED_REASON_TYPE
{
  /**
   * 0: The SDK is connecting to the server.
   */
  CONNECTION_CHANGED_CONNECTING = 0,
  /**
   * 1: The SDK has joined the channel successfully.
   */
  CONNECTION_CHANGED_JOIN_SUCCESS = 1,
  /**
   * 2: The connection between the SDK and the server is interrupted.
   */
  CONNECTION_CHANGED_INTERRUPTED = 2,
  /**
   * 3: The connection between the SDK and the server is banned by the server.
   */
  CONNECTION_CHANGED_BANNED_BY_SERVER = 3,
  /**
   * 4: The SDK fails to join the channel for more than 20 minutes and stops reconnecting to the channel.
   */
  CONNECTION_CHANGED_JOIN_FAILED = 4,
  /**
   * 5: The SDK has left the channel.
   */
  CONNECTION_CHANGED_LEAVE_CHANNEL = 5,
  /**
   * 6: The connection fails because the App ID is not valid.
   */
  CONNECTION_CHANGED_INVALID_APP_ID = 6,
  /**
   * 7: The connection fails because the channel name is not valid.
   */
  CONNECTION_CHANGED_INVALID_CHANNEL_NAME = 7,
  /**
   * 8: The connection fails because the token is not valid.
   */
  CONNECTION_CHANGED_INVALID_TOKEN = 8,
  /**
   * 9: The connection fails because the token has expired.
   */
  CONNECTION_CHANGED_TOKEN_EXPIRED = 9,
  /**
   * 10: The connection is rejected by the server.
   */
  CONNECTION_CHANGED_REJECTED_BY_SERVER = 10,
  /**
   * 11: The connection changes to reconnecting because the SDK has set a proxy server.
   */
  CONNECTION_CHANGED_SETTING_PROXY_SERVER = 11,
  /**
   * 12: When the connection state changes because the app has renewed the token.
   */
  CONNECTION_CHANGED_RENEW_TOKEN = 12,
  /**
   * 13: The IP Address of the app has changed. A change in the network type or IP/Port changes the IP
   * address of the app.
   */
  CONNECTION_CHANGED_CLIENT_IP_ADDRESS_CHANGED = 13,
  /**
   * 14: A timeout occurs for the keep-alive of the connection between the SDK and the server.
   */
  CONNECTION_CHANGED_KEEP_ALIVE_TIMEOUT = 14,
  /**
   * 15: The SDK has rejoined the channel successfully.
   */
  CONNECTION_CHANGED_REJOIN_SUCCESS = 15,
  /**
   * 16: The connection between the SDK and the server is lost.
   */
  CONNECTION_CHANGED_LOST = 16,
  /**
   * 17: The change of connection state is caused by echo test.
   */
  CONNECTION_CHANGED_ECHO_TEST = 17,
};

/**
 * The network type.
 */
enum NETWORK_TYPE {
  /**
   * -1: The network type is unknown.
   */
  NETWORK_TYPE_UNKNOWN = -1,
  /**
   * 0: The network type is disconnected.
   */
  NETWORK_TYPE_DISCONNECTED = 0,
  /**
   * 1: The network type is LAN.
   */
  NETWORK_TYPE_LAN = 1,
  /**
   * 2: The network type is Wi-Fi.
   */
  NETWORK_TYPE_WIFI = 2,
  /**
   * 3: The network type is mobile 2G.
   */
  NETWORK_TYPE_MOBILE_2G = 3,
  /**
   * 4: The network type is mobile 3G.
   */
  NETWORK_TYPE_MOBILE_3G = 4,
  /**
   * 5: The network type is mobile 4G.
   */
  NETWORK_TYPE_MOBILE_4G = 5,
};

/**
 * The definition of the VideoCanvas struct, which contains the information of the video display window.
 */
struct VideoCanvas {
  /**
   * The video display window.
   */
  view_t view;
  /**
   * The video display mode: #RENDER_MODE_TYPE.
   */
  media::base::RENDER_MODE_TYPE renderMode;
  /**
   * The video mirror mode: 
   */
  VIDEO_MIRROR_MODE_TYPE mirrorMode;
  /**
   * The user ID.
   */
  uid_t uid;
  user_id_t userId;
  void* priv;  // private data (underlying video engine denotes it)
  
  VIDEO_SOURCE_TYPE sourceType;

  VideoCanvas() : view(NULL), renderMode(media::base::RENDER_MODE_HIDDEN), mirrorMode(VIDEO_MIRROR_MODE_AUTO), uid(0), userId(NULL), priv(NULL),
      sourceType(VIDEO_SOURCE_CAMERA) {}
  VideoCanvas(view_t v, media::base::RENDER_MODE_TYPE m, VIDEO_MIRROR_MODE_TYPE mt, uid_t u)
      : view(v), renderMode(m), mirrorMode(mt), uid(u), userId(NULL), priv(NULL), sourceType(VIDEO_SOURCE_CAMERA) {}
  VideoCanvas(view_t v, media::base::RENDER_MODE_TYPE m, VIDEO_MIRROR_MODE_TYPE mt, user_id_t u)
      : view(v), renderMode(m), mirrorMode(mt), uid(0), userId(u), priv(NULL), sourceType(VIDEO_SOURCE_CAMERA) {}
};

/**
 * Preset local voice reverberation options.
 */
enum AUDIO_REVERB_PRESET {
  /**
   * 0: The original voice (no local voice reverberation).
   */
  AUDIO_REVERB_OFF = 0, // Turn off audio reverb
  /**
   * 0x00000001: Pop music.
   */
  AUDIO_REVERB_POPULAR = 0x00000001,
  /**
   * 0x00000002: R&B music.
   */
  AUDIO_REVERB_RNB = 0x00000002,
  /**
   * 0x00000003: Rock music.
   */
  AUDIO_REVERB_ROCK = 0x00000003,
  /**
   * 0x00000004: Hip-hop music.
   */
  AUDIO_REVERB_HIPHOP = 0x00000004,
  /**
   * 0x00000005: Concert hall.
   */
  AUDIO_REVERB_VOCAL_CONCERT = 0x00000005,
  /**
   * 0x00000006: KTV venue.
   */
  AUDIO_REVERB_KTV = 0x00000006,
  /**
   * 0x00000007: Recording studio.
   */
  AUDIO_REVERB_STUDIO = 0x00000007,
  /** 0x00100001: KTV venue (enhanced).
  */
  AUDIO_REVERB_FX_KTV = 0x00100001,
  /**
   * 0x00100002: Concert hall (enhanced).
   */
  AUDIO_REVERB_FX_VOCAL_CONCERT = 0x00100002,
  /**
   * 0x00100003: Uncle's voice.
   */
  AUDIO_REVERB_FX_UNCLE = 0x00100003,
  /**
   * 0x00100004: Little sister's voice.
   */
  AUDIO_REVERB_FX_SISTER = 0x00100004,
  /**
   * 0x00100005: Recording studio (enhanced).
   */
  AUDIO_REVERB_FX_STUDIO = 0x00100005,
  /**
   * 0x00100006: Pop music (enhanced).
   */
  AUDIO_REVERB_FX_POPULAR = 0x00100006,
  /**
   * 0x00100007: R&B music (enhanced).
   */
  AUDIO_REVERB_FX_RNB = 0x00100007,
  /**
   * 0x00100008: Vintage phonograph.
   */
  AUDIO_REVERB_FX_PHONOGRAPH = 0x00100008
};

/**
 * The definition of the screen sharing encoding parameters.
 */
struct ScreenCaptureParameters {
  /**
   * The dimensions of the shared region in terms of width &times; height. The default value is 0, which means
   * the original dimensions of the shared screen.
   */
  VideoDimensions dimensions;
  /**
   * The frame rate (fps) of the shared region. The default value is 5. We do not recommend setting
   * this to a value greater than 15.
   */
  int frameRate;
  /**
   * The bitrate (Kbps) of the shared region. The default value is 0, which means the SDK works out a bitrate
   * according to the dimensions of the current screen.
   */
  int bitrate;

  ScreenCaptureParameters() : dimensions(1920, 1080), frameRate(5), bitrate(4098) {}
  ScreenCaptureParameters(const VideoDimensions& d, int f, int b)
      : dimensions(d), frameRate(f), bitrate(b) {}
  ScreenCaptureParameters(int width, int height, int f, int b)
      : dimensions(width, height), frameRate(f), bitrate(b) {}
};

/**
 * Preset local voice changer options.
 */
enum VOICE_CHANGER_PRESET {
  /**
   * 0: Turn off the local voice changer, that is, to use the original voice.
   */
  VOICE_CHANGER_OFF = 0, //Turn off the voice changer
  /**
   * 0x00000001: The voice of an old man.
   */
  VOICE_CHANGER_OLDMAN = 0x00000001,
  /**
   * 0x00000002: The voice of a little boy.
   */
  VOICE_CHANGER_BABYBOY = 0x00000002,
  /**
   * 0x00000003: The voice of a little girl.
   */
  VOICE_CHANGER_BABYGIRL = 0x00000003,
  /**
   * 0x00000004: The voice of Zhu Bajie, a character in *Journey to the West*
   * who has a voice like that of a growling bear.
   */
  VOICE_CHANGER_ZHUBAJIE = 0x00000004,
  /**
   * 0x00000005: The ethereal voice.
   */
  VOICE_CHANGER_ETHEREAL = 0x00000005,
  /**
   * 0x00000006: The voice of Hulk.
   */
  VOICE_CHANGER_HULK = 0x00000006,
  /**
   * 0x00100001: A more vigorous voice.
   */
  VOICE_BEAUTY_VIGOROUS = 0x00100001,
  /**
   * 0x00100002: A deeper voice.
   */
  VOICE_BEAUTY_DEEP = 0x00100002,
  /**
   * 0x00100003: A mellower voice.
   */
  VOICE_BEAUTY_MELLOW = 0x00100003,
  /**
   * 0x00100004: Falsetto.
   */
  VOICE_BEAUTY_FALSETTO = 0x00100004,
  /**
   * 0x00100005: A fuller voice.
   */
  VOICE_BEAUTY_FULL = 0x00100005,
  /**
   * 0x00100006: A clearer voice.
   */
  VOICE_BEAUTY_CLEAR = 0x00100006,
  /**
   * 0x00100007: A more resounding voice.
   */
  VOICE_BEAUTY_RESOUNDING = 0x00100007,
  /**
   * 0x00100008: A more ringing voice.
   */
  VOICE_BEAUTY_RINGING = 0x00100008,
  /**
   * 0x00100009: A more spatially resonant voice.
   */
  VOICE_BEAUTY_SPACIAL = 0x00100009,
  /**
   * 0x00200001: (For male only) A more magnetic voice. Do not use it when
   * the speaker is a female; otherwise, voice distortion occurs.
   */
  GENERAL_BEAUTY_VOICE_MALE = 0x00200001,
  /**
   * 0x00200002: (For female only) A fresher voice. Do not use it when
   * the speaker is a male; otherwise, voice distortion occurs.
   */
  GENERAL_BEAUTY_VOICE_FEMALE_FRESH = 0x00200002,
  /**
   * 0x00200003: (For female only) A more vital voice. Do not use it when the
   * speaker is a male; otherwise, voice distortion occurs.
   */
  GENERAL_BEAUTY_VOICE_FEMALE_VITALITY = 0x00200003
};

enum AREA_CODE {
    AREA_CODE_CN = 0x00000001,
    AREA_CODE_NA = 0x00000002,
    AREA_CODE_EUR = 0x00000004,
    AREA_CODE_AS = 0x00000008,
    AREA_CODE_JAPAN = 0x00000010,
    AREA_CODE_INDIA = 0x00000020,
    AREA_CODE_GLOBAL = 0xFFFFFFFF
};

enum AREA_CODE_EX {
    /**
     * Oceania
    */
    AREA_CODE_OC = 0x00000040,
    /**
     * South-American
    */
    AREA_CODE_SA = 0x00000080,
    /**
     * Africa
    */
    AREA_CODE_AF = 0x00000100,
    /**
     * The global area (except China)
     */
    AREA_CODE_OVS = 0xFFFFFFFE
};

enum CHANNEL_MEDIA_RELAY_ERROR {
  /** 0: The state is normal.
    */
  RELAY_OK = 0,
  /** 1: An error occurs in the server response.
    */
  RELAY_ERROR_SERVER_ERROR_RESPONSE = 1,
  /** 2: No server response. You can call the
    * \ref agora::rtc::IRtcEngine::leaveChannel "leaveChannel" method to
    * leave the channel.
    */
  RELAY_ERROR_SERVER_NO_RESPONSE = 2,
  /** 3: The SDK fails to access the service, probably due to limited
    * resources of the server.
    */
  RELAY_ERROR_NO_RESOURCE_AVAILABLE = 3,
  /** 4: Fails to send the relay request.
    */
  RELAY_ERROR_FAILED_JOIN_SRC = 4,
  /** 5: Fails to accept the relay request.
    */
  RELAY_ERROR_FAILED_JOIN_DEST = 5,
  /** 6: The server fails to receive the media stream.
    */
  RELAY_ERROR_FAILED_PACKET_RECEIVED_FROM_SRC = 6,
  /** 7: The server fails to send the media stream.
    */
  RELAY_ERROR_FAILED_PACKET_SENT_TO_DEST = 7,
  /** 8: The SDK disconnects from the server due to poor network
    * connections. You can call the \ref agora::rtc::IRtcEngine::leaveChannel
    * "leaveChannel" method to leave the channel.
    */
  RELAY_ERROR_SERVER_CONNECTION_LOST = 8,
  /** 9: An internal error occurs in the server.
    */
  RELAY_ERROR_INTERNAL_ERROR = 9,
  /** 10: The token of the source channel has expired.
    */
  RELAY_ERROR_SRC_TOKEN_EXPIRED = 10,
  /** 11: The token of the destination channel has expired.
    */
  RELAY_ERROR_DEST_TOKEN_EXPIRED = 11,
};

//callback event
enum CHANNEL_MEDIA_RELAY_EVENT {
  /** 0: The user disconnects from the server due to poor network
    * connections.
    */
  RELAY_EVENT_NETWORK_DISCONNECTED = 0,
  /** 1: The network reconnects.
    */
  RELAY_EVENT_NETWORK_CONNECTED = 1,
  /** 2: The user joins the source channel.
    */
  RELAY_EVENT_PACKET_JOINED_SRC_CHANNEL = 2,
  /** 3: The user joins the destination channel.
    */
  RELAY_EVENT_PACKET_JOINED_DEST_CHANNEL = 3,
  /** 4: The SDK starts relaying the media stream to the destination channel.
    */
  RELAY_EVENT_PACKET_SENT_TO_DEST_CHANNEL = 4,
  /** 5: The server receives the video stream from the source channel.
    */
  RELAY_EVENT_PACKET_RECEIVED_VIDEO_FROM_SRC = 5,
  /** 6: The server receives the audio stream from the source channel.
    */
  RELAY_EVENT_PACKET_RECEIVED_AUDIO_FROM_SRC = 6,
  /** 7: The destination channel is updated.
    */
  RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL = 7,
  /** 8: The destination channel update fails due to internal reasons.
    */
  RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_REFUSED = 8,
  /** 9: The destination channel does not change, which means that the
    * destination channel fails to be updated.
    */
  RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_NOT_CHANGE = 9,
  /** 10: The destination channel name is NULL.
    */
  RELAY_EVENT_PACKET_UPDATE_DEST_CHANNEL_IS_NULL = 10,
  /** 11: The video profile is sent to the server.
    */
  RELAY_EVENT_VIDEO_PROFILE_UPDATE = 11,
};

enum CHANNEL_MEDIA_RELAY_STATE {
  /** 0: The SDK is initializing.
    */
  RELAY_STATE_IDLE = 0,
  /** 1: The SDK tries to relay the media stream to the destination channel.
    */
  RELAY_STATE_CONNECTING = 1,
  /** 2: The SDK successfully relays the media stream to the destination
    * channel.
    */
  RELAY_STATE_RUNNING = 2,
  /** 3: A failure occurs. See the details in code.
    */
  RELAY_STATE_FAILURE = 3,
};

/** The definition of ChannelMediaInfo.
 */
struct ChannelMediaInfo {
    /** The channel name. The default value is NULL, which means that the SDK
     * applies the current channel name.
     */
	const char* channelName;
    /** The token that enables the user to join the channel. The default value
     * is NULL, which means that the SDK applies the current token.
     */
	const char* token;
    /** The user ID.
     */
	uid_t uid;
};

/** The definition of ChannelMediaRelayConfiguration.
 */
struct ChannelMediaRelayConfiguration {
    /** Pointer to the source channel: ChannelMediaInfo.
     *
     * @note
     * - `uid`: ID of the user whose media stream you want to relay. We
     * recommend setting it as 0, which means that the SDK relays the media
     * stream of the current broadcaster.
     * - If you do not use a token, we recommend using the default values of
     * the parameters in ChannelMediaInfo.
     * - If you use a token, set uid as 0, and ensure that the token is
     * generated with the uid set as 0.
     */
	ChannelMediaInfo *srcInfo;
    /** Pointer to the destination channel: ChannelMediaInfo. If you want to
     * relay the media stream to multiple channels, define as many
     * ChannelMediaInfo structs (at most four).
     * 
     * @note `uid`: ID of the user who is in the source channel.
     */
	ChannelMediaInfo *destInfos;
    /** The number of destination channels. The default value is 0, and the
     * value range is [0,4). Ensure that the value of this parameter
     * corresponds to the number of ChannelMediaInfo structs you define in
     * `destInfos`.
     */
	int destCount;

	ChannelMediaRelayConfiguration()
			: srcInfo(nullptr)
			, destInfos(nullptr)
			, destCount(0)
	{}
};

/**
 * The collections of network info.
 */
struct NetworkInfo {
  /**
   * The target video encoder bitrate bps.
   */
  int video_encoder_target_bitrate_bps;

  NetworkInfo() : video_encoder_target_bitrate_bps(0) {}

  bool operator==(const NetworkInfo& rhs) {
    return (video_encoder_target_bitrate_bps == rhs.video_encoder_target_bitrate_bps);
  }
};

/** Encryption mode.
*/
enum ENCRYPTION_MODE {
  /** 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES_128_XTS = 1,
  /** 2: 128-bit AES encryption, ECB mode.
   */
  AES_128_ECB = 2,
  /** 3: 256-bit AES encryption, XTS mode.
   */
  AES_256_XTS = 3,
  /** 4: 128-bit SM4 encryption, ECB mode.
   */
  SM4_128_ECB = 4,
  /** Enumerator boundary.
   */
  MODE_END,
};

/** Configurations of built-in encryption schemas. */
struct EncryptionConfig {
  /**
   * Encryption mode. The default encryption mode is `AES_128_XTS`. See #ENCRYPTION_MODE.
   */
  ENCRYPTION_MODE encryptionMode;
  /**
   * Encryption key in string type.
   *
   * @note If you do not set an encryption key or set it as NULL, you cannot use the built-in encryption, and the SDK returns #ERR_INVALID_ARGUMENT (-2).
   */
  const char* encryptionKey;

  EncryptionConfig() {
    encryptionMode = AES_128_XTS;
    encryptionKey = nullptr;
  }

  /// @cond
  const char* getEncryptionString() const {
    switch(encryptionMode) {
      case AES_128_XTS:
        return "aes-128-xts";
      case AES_128_ECB:
        return "aes-128-ecb";
      case AES_256_XTS:
        return "aes-256-xts";
      case SM4_128_ECB:
        return "sm4-128-ecb";
      default:
        return "aes-128-xts";
    }
    return "aes-128-xts";
  }
  /// @endcond
};

}  // namespace rtc

namespace base {

class IEngineBase {
 public:
  virtual int queryInterface(rtc::INTERFACE_ID_TYPE iid, void** inter) = 0;
  virtual ~IEngineBase() {}
};

class AParameter : public agora::util::AutoPtr<IAgoraParameter> {
 public:
  AParameter(IEngineBase& engine) { initialize(&engine); }
  AParameter(IEngineBase* engine) { initialize(engine); }
  AParameter(IAgoraParameter* p) : agora::util::AutoPtr<IAgoraParameter>(p) {}

 private:
  bool initialize(IEngineBase* engine) {
    IAgoraParameter* p = NULL;
    if (engine && !engine->queryInterface(rtc::AGORA_IID_PARAMETER_ENGINE, (void**)&p)) reset(p);
    return p != NULL;
  }
};

}  // namespace base

namespace media {
/**
 * The IAudioFrameObserver class.
 */
class IAudioFrameObserver {
 public:
  /**
   * Audio frame types.
   */
  enum AUDIO_FRAME_TYPE {
    /**
     * 0: 16-bit PCM.
     */
    FRAME_TYPE_PCM16 = 0,
  };
  /**
   * The definition of the AudioFrame struct.
   */
  struct AudioFrame {
    /**
     * The audio frame type: #AUDIO_FRAME_TYPE.
     */
    AUDIO_FRAME_TYPE type;
    /**
     * The number of samples per channel in this frame.
     */
    int samplesPerChannel;
    /**
     * The number of bytes per sample: Two for 16-bit PCM.
     */
    int bytesPerSample;
    /**
     * The number of audio channels (data is interleaved, if stereo).
     */
    int channels;
    /**
     * The sample rate of the audio frame.
     */
    int samplesPerSec;
    /**
     * The pointer to the audio data buffer.
     */
    void* buffer;
    /**
     * The timestamp to render the audio data. Use this member for audio-video synchronization when
     * rendering the audio.
     *
     * @note
     * This parameter is the timestamp for audio rendering. Set it as 0.
     */
    int64_t renderTimeMs;
    int avsync_type;
  };

 public:
  virtual ~IAudioFrameObserver() = default;

  /**
   * Occurs when the recorded audio frame is received.
   * @param audioFrame The reference to the audio frame: AudioFrame.
   * @return
   * - true: The recorded audio frame is valid and is encoded and sent.
   * - false: The recorded audio frame is invalid and is not encoded or sent.
   */
  virtual bool onRecordAudioFrame(AudioFrame& audioFrame) = 0;
  /**
   * Occurs when the playback audio frame is received.
   * @param audioFrame The reference to the audio frame: AudioFrame.
   * @return
   * - true: The playback audio frame is valid and is encoded and sent.
   * - false: The playback audio frame is invalid and is not encoded or sent.
   */
  virtual bool onPlaybackAudioFrame(AudioFrame& audioFrame) = 0;
  /**
   * Occurs when the mixed audio data is received.
   * @param audioFrame The reference to the audio frame: AudioFrame.
   * @return
   * - true: The mixed audio data is valid and is encoded and sent.
   * - false: The mixed audio data is invalid and is not encoded or sent.
   */
  virtual bool onMixedAudioFrame(AudioFrame& audioFrame) = 0;
  /**
   * Occurs when the before-mixing playback audio frame is received.
   * @param uid ID of the remote user.
   * @param audioFrame The reference to the audio frame: AudioFrame.
   * @return
   * - true: The before-mixing playback audio frame is valid and is encoded and sent.
   * - false: The before-mixing playback audio frame is invalid and is not encoded or sent.
   */
  virtual bool onPlaybackAudioFrameBeforeMixing(unsigned int uid, AudioFrame& audioFrame) = 0;
};
/**
 * The IVideoFrameObserver class.
 */
class IVideoFrameObserver {
 public:
  using VideoFrame = media::base::VideoFrame;
  enum VIDEO_OBSERVER_POSITION {
    POSITION_POST_CAPTURER = 1 << 0,
    POSITION_PRE_RENDERER = 1 << 1,
    POSITION_PRE_ENCODER = 1 << 2,
    POSITION_POST_FILTERS = 1 << 3,
  };

  enum VIDEO_FRAME_PROCESS_MODE {
    PROCESS_MODE_READ_ONLY,   // Observer works as a pure renderer and will not modify the original
                              // frame.
    PROCESS_MODE_READ_WRITE,  // Observer works as a filter that will process the video frame and
                              // affect the following frame processing in SDK.
  };

 public:
  virtual ~IVideoFrameObserver() {}

  /**
   * Occurs each time the SDK receives a video frame captured by the local camera.
   *
   * After you successfully register the video frame observer, the SDK triggers this callback each
   * time a video frame is received. In this callback, you can get the video data captured by the
   * local camera. You can then pre-process the data according to your scenarios.
   *
   * After pre-processing, you can send the processed video data back to the SDK by setting the
   * `videoFrame` parameter in this callback.
   *
   * @param videoFrame A pointer to the video frame: VideoFrame
   * @return Determines whether to ignore the current video frame if the pre-processing fails:
   * - true: Do not ignore.
   * - false: Ignore, in which case this method does not sent the current video frame to the SDK.
   */
  virtual bool onCaptureVideoFrame(VideoFrame& videoFrame) = 0;

  /**
   * Occurs each time the SDK receives a video frame captured by the screen.
   *
   * After you successfully register the video frame observer, the SDK triggers this callback each
   * time a video frame is received. In this callback, you can get the video data captured by the
   * screen. You can then pre-process the data according to your scenarios.
   *
   * After pre-processing, you can send the processed video data back to the SDK by setting the
   * `videoFrame` parameter in this callback.
   *
   * @param videoFrame A pointer to the video frame: VideoFrame
   * @return Determines whether to ignore the current video frame if the pre-processing fails:
   * - true: Do not ignore.
   * - false: Ignore, in which case this method does not sent the current video frame to the SDK.
   */
  virtual bool onScreenCaptureVideoFrame(VideoFrame& videoFrame) = 0;
  /**
   * Occurs each time the SDK receives a video frame sent by the remote user.
   *
   * After you successfully register the video frame observer, the SDK triggers this callback each
   * time a video frame is received. In this callback, you can get the video data sent by the remote
   * user. You can then post-process the data according to your scenarios.
   *
   * After post-processing, you can send the processed data back to the SDK by setting the
   * `videoFrame` parameter in this callback.
   *
   * @param uid ID of the remote user who sends the current video frame.
   * @param connectionId ID of the connection.
   * @param videoFrame A pointer to the video frame: VideoFrame
   * @return Determines whether to ignore the current video frame if the post-processing fails:
   * - true: Do not ignore.
   * - false: Ignore, in which case this method does not sent the current video frame to the SDK.
   */
  virtual bool onRenderVideoFrame(rtc::uid_t uid, rtc::conn_id_t connectionId,
                                  VideoFrame& videoFrame) = 0;

  /**
   * Indicate the video frame mode of the observer.
   * @return VIDEO_FRAME_PROCESS_MODE
   */
  virtual VIDEO_FRAME_PROCESS_MODE getVideoFrameProcessMode() { return PROCESS_MODE_READ_ONLY; }

  /*
   * Occurs each time needs to get preference video frame type.
   *
   * @return preference video pixel format.
   */
  virtual base::VIDEO_PIXEL_FORMAT getVideoPixelFormatPreference() {
    return base::VIDEO_PIXEL_I420;
  }

  /**
   * Occurs each time needs to get rotation angle.
   *
   * @return rotation angle.
   */
  virtual int getRotationApplied() { return 0; }

  /**
   * Occurs each time needs to get whether mirror is applied or not.
   *
   * @return Determines whether to mirror.
   * - true: need to mirror.
   * - false: no mirror.
   */
  virtual bool getMirrorApplied() { return false; }

  /**
   * Indicate if the observer is for internal use.
   * Note: Never override this function
   * @return
   * - true: the observer is for external use
   * - false: the observer is for internal use
   */
  virtual bool isExternal() { return true; }
};

}  // namespace media

}  // namespace agora

/**
 * Gets the version of the SDK.
 * @param [in, out] build The build number of Agora SDK.
 * @return The string of the version of the SDK.
 */
AGORA_API const char* AGORA_CALL getAgoraSdkVersion(int* build);

/**
 * Gets error description of an error code.
 * @param [in] err The error code.
 * @return The description of the error code.
 */
AGORA_API const char* AGORA_CALL getAgoraSdkErrorDescription(int err);

AGORA_API int AGORA_CALL setAgoraSdkExternalSymbolLoader(void* (*func)(const char* symname));
