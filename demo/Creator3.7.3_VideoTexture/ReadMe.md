* (v3.6.2) VideoTexture

  > 工程 git 仓库地址: 
  >
  > https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.6.x-release/demo/Creator3.6.2_VideoTexture
  >
  > **因为 github 单文件上传大小有 100m 限制，所以自定义引擎部分需要打开链接 http://download.cocos.org/CocosTest/zhefengzhang/NoDelete/3.6.2-videoTexture-native-folder/native.zip 下载并解压到项目中**
  >
  > **Because there is a 100m limit on the size of a single file upload on github, you need to open the link http://download.cocos.org/CocosTest/zhefengzhang/NoDelete/3.6.2-videoTexture-native-folder/native.zip to download and unzip the custom engine part into the project**
  >
  > **不支持微信浏览器、微信小游戏**
  > 除了常规的本地视频和远程视频外，原生平台还支持支持播放直播流。直播流测试链接：rtmp://mobliestream.c3tv.com:554/live/goodtv.sdp （注意把 MediaVieo 组件的 clip 设置为 null，否则不会使用 url 播放）
  > ios 使用了硬解码，android 使用了软解码
  > 
  > 效果演示 - web
  > ![web_videoPlayer|668x444](https://forum.cocos.org/uploads/default/original/3X/e/8/e8904d910ed29571a795312c7334b247ad72b559.gif)  
  >
  > 效果演示 - android
  > ![android_texture|354x171](https://forum.cocos.org/uploads/default/original/3X/5/6/568c6df2d0258eff4c6a58313f1f0bb5a2865884.gif) 
  >
  > 效果演示 - ios
  > ![7wcgm-vsl46|480x220](https://forum.cocos.org/uploads/default/original/3X/b/d/bd98170291567818544ade76d400386929917684.gif) 
