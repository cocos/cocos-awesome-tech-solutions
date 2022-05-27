## 简介
基于 CocosCreator 3.4.2 版本创建的 **声网视频流渲染 SDK 接入** 工程。

### 支持平台

    Android

### 使用方式
- 本方案为接入声网视频流渲染 SDK（Agora）接入工程，接入 SDK 部分均定制在 native 目录下。
- 本方案范例目前对接了 android 端。iOS 端 SDK 后续考虑接入。
- 使用 Android Studio 导入 android 工程后，如果提示 "ModelCache.safeGet(androidProjectResult.androidProject::getNdkVersion, "") must not be null", 
> 需要在 build/android/proj/libservice/build.gradle 的 android 中，添加 ndkVersion ""    
>
> 需要在 native/engine/android/app/build.gradle 的 android 中，添加 ndkVersion ""    