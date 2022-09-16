### 简介
基于 CocosCreator 3.6.0 版本创建的 **Spine局部换装** 工程。

### 使用方式
- web
将项目下 replaceEngine/web-bak 文件夹中的 skeleton.ts 覆盖（或者匹配代码进行修改）引擎 engine 中的 skeleton.ts 文件。     

skeleton.ts 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/cocos/spine/skeleton.ts    

需要在 Cocos Creator 编辑器顶部菜单栏，选择**开发者**->**编译引擎**即可。编译引擎需要等待 1~5 min 即可。

- Native（android、iOS、macOS、Windows）
首先强调 **本方案的原生部分需要自定义引擎，且编辑器 3.6.0 版本开始，自定义 JSB 绑定和之前版本有所不同**

以 3.6.0 版本为例，自定义引擎，选择直接修改引擎源码（不额外拷贝引擎源码到其他文件夹，直接修改 Dashboard 中的引擎源码，如果修改失败或者有其他问题，再重新下载一份。如果你有其他引擎自定义的情况的话，记得做好备份）

1、将项目下 replaceEngine/native-bak 中的 Attachment.cpp、Attachment.h、MeshAttachment.cpp、RegionAttachment.cpp、AttachmentVertices.cpp、AttachmentVertices.h、SkeletonRenderer.cpp、SkeletonRenderer.h、jsb-spine-skeleton.js、spine.ini 替换到引擎下。

> Attachment.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/Attachment.cpp
>
> Attachment.h 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/Attachment.h
>
> MeshAttachment.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/MeshAttachment.cpp
>
> RegionAttachment.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/RegionAttachment.cpp
>
> AttachmentVertices.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/AttachmentVertices.cpp
>
> AttachmentVertices.h 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/AttachmentVertices.h
>
> SkeletonRenderer.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/SkeletonRenderer.cpp
>
> SkeletonRenderer.h 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/SkeletonRenderer.h
>
> jsb-spine-skeleton.js 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/platforms/native/engine/jsb-spine-skeleton.js
>
> spine.ini 文件路径参考: /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/tools/tojs/spine.ini

2、在命令行下，执行以下命令，重新生成 JSB 自定绑定相关代码。
> cd /Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/tools/tojs
>
> python genbindings.py

如果提示 Cannot find yaml 相关的报错，那么需要安装 YAML 相关依赖。
> sudo pip3 install pyyaml==5.4.1
> 
> sudo pip3 install Cheetah3

如果安装了上面的命令失败，那么确认一下你的 python 版本是不是正确的。需要安装 python 3.0+ 版本，推荐安装 python 3.9.8，安装目录 https://www.python.org/downloads/release/python-398/

如果指定了以上的命令安装依赖库之后，执行 python genbindings.py ,还会提示 NDK_ROOT 相关报错。那么需要设置环境变量。以 macOS 系统为例，在系统下的 .bash_profile 中设置 ANDROID_NDK_HOME 和 NDK_ROOT。
> ANDROID_NDK_HOME=/Users/mu/work/Android/SDK/ndk/21.4.7075529
>
> NDK_ROOT=/Users/mu/work/Android/SDK/ndk/21.4.7075529

设置完成之后，重启电脑或者执行 source .bash_profile 刷新。
> source .bash_profile

最后在引擎代码中，找到 jsb_spine_auto.cpp 中找到 updateRegion 是否存在。jsb_spine_auto.cpp 是通过 JSB 自动绑定生成的文件。文件路径：/Applications/CocosCreator/Creator/3.6.0/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/bindings/auto/jsb_spine_auto.cpp。

3、在 engine 目录下，删除 package-lock.json 文件，并重新生成。
> npm install -g gulp
>
> npm install --force
>
> npm run bundle-adapter

看到 Generate bundle: engine-adapter.js 说明我们修改的 jsb-spine-skeleton.js 生效了。

4、在 Creator 编辑器上的菜单栏，通过开发者->编译引擎，执行编译引擎。等待片刻。因为有修改 engine 相关代码，还是重新编译引擎使之生效。

5、构建原生平台。

- 定制 native 可能出现的问题处理
打包 Android 后，使用 Android Studio 打开项目后，出现 getNdkVersion null 错误。

解决方案：https://blog.csdn.net/u014206745/article/details/126534718