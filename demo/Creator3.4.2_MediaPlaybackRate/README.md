## 简介
基于 CocosCreator 3.4.2 版本创建的 **音视频倍数播放** 方案工程。

### 支持平台

    Android
    iOS
    Web

### 使用方式
- 本方案为定制引擎暂未实现功能，故需要自定义引擎。
- 将项目下的 support 里的 support-audio-and-video-speed-play-change.zip 文件解压，文件夹分为 engine 和 engine-native 两部分。 需要将 engine 和 engine-native 中的修改文件同步到引擎中，完成定制。具体的修改文件列表可以查看`Change File List`。
- 因为原生(iOS、Android)和 web 对于音频倍数和视频倍数播放的支持各不相同，所以实际的播放需要以平台以及设备为主。

### Change File List
engine/@types/jsb.d.ts    
engine/@types/pal/audio.d.ts    
engine/cocos/audio/audio-clip.ts       
engine/cocos/audio/audio-source.ts    
engine/extensions/videoplayer/CCVideoPlayer.js    
engine/pal/audio/native/player.ts    
engine/pal/audio/web/player-dom.ts    
engine/pal/audio/web/player-web.ts    
engine/pal/audio/web/player.ts    
engine/platforms/native/engine/jsb-videoplayer.js    

engine-native/cocos/audio/android/AudioEngine-inl.cpp    
engine-native/cocos/audio/android/AudioEngine-inl.h    
engine-native/cocos/audio/android/AudioMixerController.cpp    
engine-native/cocos/audio/android/AudioPlayerProvider.cpp    
engine-native/cocos/audio/android/AudioPlayerProvider.h     
engine-native/cocos/audio/android/IAudioPlayer.h    
engine-native/cocos/audio/android/PcmAudioPlayer.cpp    
engine-native/cocos/audio/android/PcmAudioPlayer.h    
engine-native/cocos/audio/android/PcmAudioService.cpp    
engine-native/cocos/audio/android/PcmAudioService.h    
engine-native/cocos/audio/android/Track.cpp    
engine-native/cocos/audio/android/Track.h    
engine-native/cocos/audio/android/UrlAudioPlayer.cpp    
engine-native/cocos/audio/android/UrlAudioPlayer.h    
engine-native/cocos/audio/apple/AudioEngine-inl.mm    
engine-native/cocos/audio/apple/AudioEngine-inl.h    
engine-native/cocos/audio/apple/AudioPlayer.mm    
engine-native/cocos/audio/apple/AudioPlayer.h    
engine-native/cocos/audio/AudioEngine.cpp    
engine-native/cocos/audio/include/AudioEngine.h    
engine-native/cocos/audio/oalsoft/AudioEngine-soft.cpp    
engine-native/cocos/bindings/auto/jsb_audio_auto.cpp    
engine-native/cocos/bindings/auto/jsb_audio_auto.h    
engine-native/cocos/bindings/auto/jsb_video_auto.cpp    
engine-native/cocos/bindings/auto/jsb_video_auto.h    
engine-native/cocos/platform/android/java/src/com/cocos/lib/CocosVideoHelper.java    
engine-native/cocos/platform/android/java/src/com/cocos/lib/CocosVideoView.java    
engine-native/cocos/ui/videoplayer/VideoPlayer-ios.mm    
engine-native/cocos/ui/videoplayer/VideoPlayer-java.cpp    
engine-native/cocos/ui/videoplayer/VideoPlayer.h    