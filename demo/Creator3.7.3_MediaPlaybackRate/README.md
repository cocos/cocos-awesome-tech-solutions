## 简介
基于 CocosCreator 3.7.3 版本创建的 **音视频倍数播放** 工程。

### 支持平台

    Android
    iOS
    Web

### 使用方式
1、下载 [定制引擎包](http://download.cocos.org/CocosTest/zhefengzhang/NoDelete/support-audio&video-setPlayRate-engine.zip) 并解压到你的项目根目录下
2、打开编辑器的偏好设置，进入引擎管理器面板，设置 Cocos 引擎路径为 `定制引擎包` 的路径，需要测试原生平台的则需要设置原生模块为 `使用自定义`
3、重启编辑器即可
4、项目有附带修改的文件，具体修改可参考下面的引擎代码修改提交记录，自动绑定 jsb_audio_auto.cpp,jsb_video_auto.cpp 如果之前有自定义改动到，建议直接重新通过 swig 方式重新生成，参考文档：
[swig](https://docs.cocos.com/creator/manual/zh/advanced-topics/jsb-swig.html)

### 自定义引擎编译方式
参考官方文档：[引擎定制](https://docs.cocos.com/creator/manual/zh/advanced-topics/engine-customization.html#13-%E5%AE%89%E8%A3%85%E7%BC%96%E8%AF%91%E4%BE%9D%E8%B5%96)

### 引擎代码修改的提交记录
https://github.com/zhefengzhang/engine/commit/572eac9d2ae70ad7f648639f540c6688d245cb8b

https://github.com/zhefengzhang/engine/commit/a5a62463c49c96c1b1e8a2719331b377615c2863

https://github.com/zhefengzhang/engine/commit/4647e3198288083d8d66b28ef29a5568c21c0922