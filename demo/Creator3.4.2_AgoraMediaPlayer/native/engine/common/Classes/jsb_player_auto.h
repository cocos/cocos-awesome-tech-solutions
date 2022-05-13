#pragma once
#include "base/Config.h"
#if (USE_VIDEO > 0)
#include <type_traits>
#include "cocos/bindings/jswrapper/SeApi.h"
#include "cocos/bindings/manual/jsb_conversions.h"
#include "MediaPlayer.h"

extern se::Object* __jsb_MediaPlayer_proto;
extern se::Class* __jsb_MediaPlayer_class;

bool js_register_MediaPlayer(se::Object* obj);
bool register_all_player(se::Object* obj);

JSB_REGISTER_OBJECT_TYPE(MediaPlayer);
SE_DECLARE_FUNC(js_player_MediaPlayer_getFrameData);
SE_DECLARE_FUNC(js_player_MediaPlayer_init);
SE_DECLARE_FUNC(js_player_MediaPlayer_open);
SE_DECLARE_FUNC(js_player_MediaPlayer_play);
SE_DECLARE_FUNC(js_player_MediaPlayer_stop);
SE_DECLARE_FUNC(js_player_MediaPlayer_getInstance);
SE_DECLARE_FUNC(js_player_MediaPlayer_MediaPlayer);

#endif //#if (USE_VIDEO > 0)
