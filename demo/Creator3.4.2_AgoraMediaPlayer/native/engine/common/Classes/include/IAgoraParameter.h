//
//  Agora Engine SDK
//
//  Created by minbo in 2019-10.
//  Copyright (c) 2019 Agora.io. All rights reserved.

/*
 *  Copyright (c) 2012 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

#pragma once  // NOLINT(build/header_guard)

// external key
/**
 * set the range of ports available for connection
 * @example "{\"rtc.udp_port_range\":[4500, 5000]}"
 */
#define KEY_RTC_UDP_PORT_RANGE                       "rtc.udp_port_range"
/**
 * set the list of ports available for connection
 * @example  "{\"rtc.udp_port_list\":[4501, 4502, 4503, 4504, 4505, 4506]}"
 */
#define KEY_RTC_UDP_PORT_LIST                        "rtc.udp_port_list"

 /**
  * set the video encoder mode (hardware or software)
  */
#define KEY_RTC_VIDEO_ENABLED_HW_ENCODER             "engine.video.enable_hw_encoder"

 /**
  * set the video decoder mode (hardware or software)
  */
#define KEY_RTC_VIDEO_ENABLED_HW_DECODER             "engine.video.enable_hw_decoder"

 /**
  * override the lua policy
  */
#define KEY_RTC_VIDEO_OVERRIDE_SMALLVIDEO_NOT_USE_HWENC_POLICY  "engine.video.override_smallvideo_not_use_hwenc_policy"

/**
  * enable/disable video packet retransmission, enabled by default
 */
#define KEY_RTC_VIDEO_RESEND                         "rtc.video_resend"

/**
  * enable/disable audio packet retransmission, enabled by default
*/
#define KEY_RTC_AUDIO_RESEND                         "rtc.audio_resend"

/**
  * enable/disable agora aec logic, enabled by default
*/
#define KEY_RTC_AUDIO_ENABLE_AGORA_AEC               "rtc.audio.aec.enable"

/**
  * enable/disable agora agc logic, enabled by default
*/
#define KEY_RTC_AUDIO_ENABLE_AGORA_AGC               "rtc.audio.agc.enable"

/**
  * enable/disable agora ans logic, enabled by default
*/
#define KEY_RTC_AUDIO_ENABLE_AGORA_ANS               "rtc.audio.ans.enable"

/**
  * enable/disable agora md logic, enabled by default
*/
#define KEY_RTC_AUDIO_ENABLE_AGORA_MD                "rtc.audio.md.enable"

/**
  * set the bitrate ratio for video
*/
#define KEY_RTC_VIDEO_BITRATE_ADJUST_RATIO           "rtc.video.bitrate_adjust_ratio"

/**
  * set the minbitrate / bitrate ratio for video
*/
#define KEY_RTC_VIDEO_MINBITRATE_RATIO               "rtc.video.minbitrate_ratio"

/**
  * set the degradation preference
*/
#define KEY_RTC_VIDEO_DEGRADATION_PREFERENCE         "rtc.video.degradation_preference"

/**
  * set the degradation fps down step
*/

#define KEY_RTC_VIDEO_DEGRADATION_FPS_DOWN_STEP      "rtc.video.degradation_fps_down_step"
/**
  * set the degradation fps up step
*/
#define KEY_RTC_VIDEO_DEGRADATION_FPS_UP_STEP        "rtc.video.degradation_fps_up_step"

namespace agora {

namespace util {
template <class T>
class CopyableAutoPtr;

class IString;
typedef CopyableAutoPtr<IString> AString;
}  // namespace util

namespace base {

class IAgoraParameter {
public:
  /**
   * release the resource
   */
  virtual void release() = 0;

  /**
   * set bool value of the json
   * @param [in] key
   *        the key name
   * @param [in] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int setBool(const char* key, bool value) = 0;

  /**
   * set int value of the json
   * @param [in] key
   *        the key name
   * @param [in] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int setInt(const char* key, int value) = 0;

  /**
   * set unsigned int value of the json
   * @param [in] key
   *        the key name
   * @param [in] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int setUInt(const char* key, unsigned int value) = 0;

  /**
   * set double value of the json
   * @param [in] key
   *        the key name
   * @param [in] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int setNumber(const char* key, double value) = 0;

  /**
   * set string value of the json
   * @param [in] key
   *        the key name
   * @param [in] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int setString(const char* key, const char* value) = 0;

  /**
   * set object value of the json
   * @param [in] key
   *        the key name
   * @param [in] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int setObject(const char* key, const char* value) = 0;

  /**
   * set array value of the json
   * @param [in] key
   *        the key name
   * @param [in] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int setArray(const char* key, const char* value) = 0;
  /**
   * get bool value of the json
   * @param [in] key
   *        the key name
   * @param [in, out] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int getBool(const char* key, bool& value) = 0;

  /**
   * get int value of the json
   * @param [in] key
   *        the key name
   * @param [in, out] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int getInt(const char* key, int& value) = 0;

  /**
   * get unsigned int value of the json
   * @param [in] key
   *        the key name
   * @param [in, out] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int getUInt(const char* key, unsigned int& value) = 0;

  /**
   * get double value of the json
   * @param [in] key
   *        the key name
   * @param [in, out] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int getNumber(const char* key, double& value) = 0;

  /**
   * get string value of the json
   * @param [in] key
   *        the key name
   * @param [in, out] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int getString(const char* key, agora::util::AString& value) = 0;

  /**
   * get a child object value of the json
   * @param [in] key
   *        the key name
   * @param [in, out] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int getObject(const char* key, agora::util::AString& value) = 0;

  /**
   * get array value of the json
   * @param [in] key
   *        the key name
   * @param [in, out] value
   *        the value
   * @return return 0 if success or an error code
   */
  virtual int getArray(const char* key, const char* args, agora::util::AString& value) = 0;

  /**
   * set parameters of the sdk or engine
   * @param [in] parameters
   *        the parameters
   * @return return 0 if success or an error code
   */
  virtual int setParameters(const char* parameters) = 0;

  virtual int convertPath(const char* filePath, agora::util::AString& value) = 0;

  virtual ~IAgoraParameter() {}
};

}  // namespace base
}  // namespace agora
