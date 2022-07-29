#include "jsb_player_auto.h"
#if (USE_VIDEO > 0)
#include "cocos/bindings/manual/jsb_conversions.h"
#include "cocos/bindings/manual/jsb_global.h"
#include "MediaPlayer.h"

#ifndef JSB_ALLOC
#define JSB_ALLOC(kls, ...) new (std::nothrow) kls(__VA_ARGS__)
#endif

#ifndef JSB_FREE
#define JSB_FREE(ptr) delete ptr
#endif
se::Object* __jsb_MediaPlayer_proto = nullptr;
se::Class* __jsb_MediaPlayer_class = nullptr;

static bool js_player_MediaPlayer_getFrameData(se::State& s) // NOLINT(readability-identifier-naming)
{
    auto* cobj = SE_THIS_OBJECT<MediaPlayer>(s);
    SE_PRECONDITION2(cobj, false, "js_player_MediaPlayer_getFrameData : Invalid Native Object");
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 3) {
        auto v = args[0];

        SE_PRECONDITION2(v.isObject() && v.toObject()->isTypedArray(), false, "Convert parameter to Data failed!");
        uint8_t *ptr    = nullptr;
        size_t   length = 0;
        bool     ok     = v.toObject()->getTypedArrayData(&ptr, &length);

        int width =  args[1].toNumber();
        int height =  args[2].toNumber();
        cobj->getFrameData(ptr, length, width, height);

        cc::Size result(width, height);
        ok &= nativevalue_to_se(result, s.rval(), nullptr /*ctx*/);
        SE_PRECONDITION2(ok, false, "js_engine_FileUtils_getFileSize : Error processing arguments");
        SE_HOLD_RETURN_VALUE(result, s.thisObject(), s.rval());
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
    return false;
}
SE_BIND_FUNC(js_player_MediaPlayer_getFrameData)

static bool js_player_MediaPlayer_init(se::State& s) // NOLINT(readability-identifier-naming)
{
    auto* cobj = SE_THIS_OBJECT<MediaPlayer>(s);
    SE_PRECONDITION2(cobj, false, "js_player_MediaPlayer_init : Invalid Native Object");
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 0) {
        bool result = cobj->init();
        ok &= nativevalue_to_se(result, s.rval(), nullptr /*ctx*/);
        SE_PRECONDITION2(ok, false, "js_player_MediaPlayer_init : Error processing arguments");
        SE_HOLD_RETURN_VALUE(result, s.thisObject(), s.rval());
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
    return false;
}
SE_BIND_FUNC(js_player_MediaPlayer_init)

static bool js_player_MediaPlayer_open(se::State& s) // NOLINT(readability-identifier-naming)
{
    auto* cobj = SE_THIS_OBJECT<MediaPlayer>(s);
    SE_PRECONDITION2(cobj, false, "js_player_MediaPlayer_open : Invalid Native Object");
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        HolderType<const char*, false> arg0 = {};
        ok &= sevalue_to_native(args[0], &arg0, s.thisObject());
        SE_PRECONDITION2(ok, false, "js_player_MediaPlayer_open : Error processing arguments");
        cobj->open(arg0.value());
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_player_MediaPlayer_open)

static bool js_player_MediaPlayer_play(se::State& s) // NOLINT(readability-identifier-naming)
{
    auto* cobj = SE_THIS_OBJECT<MediaPlayer>(s);
    SE_PRECONDITION2(cobj, false, "js_player_MediaPlayer_play : Invalid Native Object");
    const auto& args = s.args();
    size_t argc = args.size();
    if (argc == 0) {
        cobj->play();
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
    return false;
}
SE_BIND_FUNC(js_player_MediaPlayer_play)

static bool js_player_MediaPlayer_stop(se::State& s) // NOLINT(readability-identifier-naming)
{
    auto* cobj = SE_THIS_OBJECT<MediaPlayer>(s);
    SE_PRECONDITION2(cobj, false, "js_player_MediaPlayer_stop : Invalid Native Object");
    const auto& args = s.args();
    size_t argc = args.size();
    if (argc == 0) {
        cobj->stop();
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
    return false;
}
SE_BIND_FUNC(js_player_MediaPlayer_stop)

static bool js_player_MediaPlayer_getInstance(se::State& s) // NOLINT(readability-identifier-naming)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 0) {
        MediaPlayer* result = MediaPlayer::getInstance();
        ok &= nativevalue_to_se(result, s.rval(), nullptr /*ctx*/);
        SE_PRECONDITION2(ok, false, "js_player_MediaPlayer_getInstance : Error processing arguments");
        SE_HOLD_RETURN_VALUE(result, s.thisObject(), s.rval());
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
    return false;
}
SE_BIND_FUNC(js_player_MediaPlayer_getInstance)

SE_DECLARE_FINALIZE_FUNC(js_MediaPlayer_finalize)

static bool js_player_MediaPlayer_constructor(se::State& s) // NOLINT(readability-identifier-naming) constructor.c
{
    MediaPlayer* cobj = JSB_ALLOC(MediaPlayer);
    s.thisObject()->setPrivateData(cobj);
    se::NonRefNativePtrCreatedByCtorMap::emplace(cobj);
    return true;
}
SE_BIND_CTOR(js_player_MediaPlayer_constructor, __jsb_MediaPlayer_class, js_MediaPlayer_finalize)



static bool js_MediaPlayer_finalize(se::State& s) // NOLINT(readability-identifier-naming)
{
    // destructor is skipped
    return true;
}
SE_BIND_FINALIZE_FUNC(js_MediaPlayer_finalize)

static bool js_MediaPlayer_destroy(se::State& s) // NOLINT(readability-identifier-naming)
{
    auto iter = se::NonRefNativePtrCreatedByCtorMap::find(SE_THIS_OBJECT<MediaPlayer>(s));
    if (iter != se::NonRefNativePtrCreatedByCtorMap::end())
    {
        se::NonRefNativePtrCreatedByCtorMap::erase(iter);
        auto* cobj = SE_THIS_OBJECT<MediaPlayer>(s);
        JSB_FREE(cobj);
    }
    auto objIter = se::NativePtrToObjectMap::find(SE_THIS_OBJECT<MediaPlayer>(s));
    if(objIter != se::NativePtrToObjectMap::end())
    {
        objIter->second->clearPrivateData(true);
    }
    return true;
}
SE_BIND_FUNC(js_MediaPlayer_destroy)

bool js_register_player_MediaPlayer(se::Object* obj) // NOLINT(readability-identifier-naming)
{
    auto* cls = se::Class::create("MediaPlayer", obj, nullptr, _SE(js_player_MediaPlayer_constructor));

    cls->defineFunction("getFrameData", _SE(js_player_MediaPlayer_getFrameData));
    cls->defineFunction("init", _SE(js_player_MediaPlayer_init));
    cls->defineFunction("open", _SE(js_player_MediaPlayer_open));
    cls->defineFunction("play", _SE(js_player_MediaPlayer_play));
    cls->defineFunction("stop", _SE(js_player_MediaPlayer_stop));
    cls->defineFunction("destroy", _SE(js_MediaPlayer_destroy));
    cls->defineStaticFunction("getInstance", _SE(js_player_MediaPlayer_getInstance));
    cls->defineFinalizeFunction(_SE(js_MediaPlayer_finalize));
    cls->install();
    JSBClassType::registerClass<MediaPlayer>(cls);

    __jsb_MediaPlayer_proto = cls->getProto();
    __jsb_MediaPlayer_class = cls;

    se::ScriptEngine::getInstance()->clearException();
    return true;
}
bool register_all_player(se::Object* obj)
{
    // Get the ns
    se::Value nsVal;
    if (!obj->getProperty("jsb", &nsVal))
    {
        se::HandleObject jsobj(se::Object::createPlainObject());
        nsVal.setObject(jsobj);
        obj->setProperty("jsb", nsVal);
    }
    se::Object* ns = nsVal.toObject();

    js_register_player_MediaPlayer(ns);
    return true;
}

#endif //#if (USE_VIDEO > 0)
