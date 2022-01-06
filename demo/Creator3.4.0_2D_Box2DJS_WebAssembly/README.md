# 简介
基于 CocosCreator 3.4.0 版本创建的 Box2D wasm方案测试工程。
# 测试方法

 - 1 拷贝**back**文件夹下的 index.js 脚本，替换 Cocos Creator 3.4.0 版本引擎的源码路径下的 index.js 脚本。
 > Windows: D:\CocosDashboard_1.0.20\resources\.editors\Creator\3.4.0\resources\resources\3d\engine\node_modules\@cocos\box2d\index.js
 >
 > macOS: /Applications/CocosCreator/Creator/3.4.0/CocosCreator.app/Contents/Resources/resources/3d/engine/node_modules/@cocos/box2d/index.js

 - 2 拷贝**back**文件夹下的 box2d 文件夹，替换 Cocos Creator 3.4.0 版本引擎的源码路径下的 box2d 文件夹。
 > Windows: D:\CocosDashboard_1.0.20\resources\.editors\Creator\3.4.0\resources\resources\3d\engine\cocos\physics-2d\box2d
 >
 > macOS: /Applications/CocosCreator/Creator/3.4.0/CocosCreator.app/Contents/Resources/resources/3d/engine/cocos/physics-2d/box2d

 - 3 拷贝**back**文件夹下的 build-templates 文件夹到项目下。

 - 4 因为目前该方案需要自定义引擎，所以记得编译引擎。

 - 5 使用构建面板构建项目