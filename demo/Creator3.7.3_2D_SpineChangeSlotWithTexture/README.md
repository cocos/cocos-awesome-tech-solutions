### 简介
基于 CocosCreator 3.7.3 版本创建的 **Spine局部换装** 工程。

### 使用方式
- web
将项目下 replaceEngine/web-bak 文件夹中的 skeleton.ts 覆盖（或者匹配代码进行修改）引擎 engine 中的 skeleton.ts 文件。     

skeleton.ts 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/cocos/spine/skeleton.ts    

需要在 Cocos Creator 编辑器顶部菜单栏，选择**开发者**->**编译引擎**即可。编译引擎需要等待 1~5 min 即可。

- Native（android、iOS、macOS、Windows）
首先强调 **本方案的原生部分需要自定义引擎，且编辑器 3.7.3 版本开始，自定义 JSB 绑定和之前版本有所不同**

以 3.7.3 版本为例，自定义引擎，选择直接修改引擎源码（不额外拷贝引擎源码到其他文件夹，直接修改 Dashboard 中的引擎源码，如果修改失败或者有其他问题，再重新下载一份。如果你有其他引擎自定义的情况的话，记得做好备份）

1、将项目下 replaceEngine/native-bak 中的 Attachment.cpp、Attachment.h、MeshAttachment.cpp、RegionAttachment.cpp、AttachmentVertices.cpp、AttachmentVertices.h、SkeletonRenderer.cpp、SkeletonRenderer.h、jsb-spine-skeleton.js、spine.ini 替换到引擎下。

> Attachment.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/Attachment.cpp
>
> Attachment.h 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/Attachment.h
>
> MeshAttachment.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/MeshAttachment.cpp
>
> RegionAttachment.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine/RegionAttachment.cpp
>
> AttachmentVertices.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/AttachmentVertices.cpp
>
> AttachmentVertices.h 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/AttachmentVertices.h
>
> SkeletonRenderer.cpp 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/SkeletonRenderer.cpp
>
> SkeletonRenderer.h 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/editor-support/spine-creator-support/SkeletonRenderer.h
>
> jsb-spine-skeleton.js 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/platforms/native/engine/jsb-spine-skeleton.js
>
> spine.i 文件路径参考: /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/tools/swig-config/spine.i


2、在命令行下，执行以下命令，重新生成 JSB 自定绑定相关代码。
> cd /Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/tools/swig-config
>
> node genbindings.js

最后在引擎代码中，找到 jsb_spine_auto.cpp 中找到 updateRegion 是否存在。jsb_spine_auto.cpp 是通过 JSB 自动绑定生成的文件。文件路径：/Applications/CocosCreator/Creator/3.7.3/CocosCreator.app/Contents/Resources/resources/3d/engine/native/cocos/bindings/auto/jsb_spine_auto.cpp。

3、在 engine 目录下，删除 package-lock.json 文件，并重新生成(nodejs 版本 14 以下)。
> npm install -g gulp
>
> npm install --force
>
> npm run bundle-adapter

看到 Generate bundle: engine-adapter.js 说明我们修改的 jsb-spine-skeleton.js 生效了。

4、在 Creator 编辑器上的菜单栏，通过开发者->编译引擎，执行编译引擎。等待片刻。因为有修改 engine 相关代码，还是重新编译引擎使之生效。


