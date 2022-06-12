## 简介
基于 CocosCreator 3.4.2 版本创建的 **声网视频流渲染 SDK 接入** 工程。

### 支持平台

    Android

### 效果演示
> ![agoraMediaPlayer_20220528 00_00_00-00_00_11|225x500](https://forum.cocos.org/uploads/default/original/3X/7/7/77a202b51d4cbc513680a5a8c74fc76898e3154e.gif) 
> 打开链接可查看测试视频：https://download.cocos.org/CocosTest/muxiandong/NoDelete/agoraMediaPlayer_20220528.mp4

### 使用方式
- 本方案为接入声网视频流渲染 SDK（Agora）接入工程，接入 SDK 部分均定制在 native 目录下。
- 本方案范例目前对接了 android 端。iOS 端 SDK 后续考虑接入。
- 使用 Android Studio 导入 android 工程后，如果提示 "ModelCache.safeGet(androidProjectResult.androidProject::getNdkVersion, "") must not be null", 
> 需要在 build/android/proj/libservice/build.gradle 的 android 中，添加 ndkVersion ""    
>
> 需要在 native/engine/android/app/build.gradle 的 android 中，添加 ndkVersion ""    
- 如果需要切换视频源，需要在 native/engine/common/Classes/MediaPlayer.cpp 的 MediaPlayer::open 接口，修改视频源，即可。

### 一些限制
- 点击 "open" 后点击 "play", 开始播放视频
- 点击 "stop" 后会停止视频
- 停止视频后，需要重新点击 "open" 和 "play" 按钮，才会继续开始播放视频