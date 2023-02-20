## 1.高性能模式

#### *有关高性能模式的介绍以及使用方法请详细阅读微信小游戏开发文档：[高性能模式](https://developers.weixin.qq.com/minigame/dev/guide/performance/perf-high-performance.html)。*

* 高性能模式下，游戏将拥有更好的渲染性能和表现，但是它对游戏的内存要求更加严格。因为内存问题在 iOS 端反馈较多，所以本文仅对 iOS 端内存优化做介绍。

* 在 iOS 设备中， iphone 6s/7/8 等 2G RAM 机型的内存限制为 1G，iphone 7P/8P/iPhoneX/XR/XSAMX/11 等 3G RAM 机型的内存限制为 1.4G，一旦应用程序的内存占用超过这个阀值，就会被系统杀掉进程。因此开发者务必保证内存峰值不超过该数值。

* 如果游戏没做好内存优化，不建议开启高性能模式，否则在 iOS 低端机容易出现内存异常退出的情况，如有内存问题，可参考本文的内存优化技巧，充分优化内存。

* 开通高性能模式的方式为：登录微信公众平台 -> 首页能力地图模块 -> 点击进入"生产提效包" -> 点击开通高性能模式。 开通成功后，通过配置 game.json 的 iOSHighPerformance 为 true 则可进入高性能模式，通过去掉此开关可以正常回退到普通模式，以便两种模式对比。

---

## 2.运行时内存结构
![MemoryDistribution|690x368, 100%](https://forum.cocos.org/uploads/default/optimized/3X/e/0/e02956c79bb350273645f5824fd0e6a37bd573c6_2_1380x736.jpeg) 

* JavaScript Heap

    在高性能模式下，小游戏运行于浏览器内核环境，因此 JavaScript Heap 包含游戏逻辑代码内存。 通常我们可以打包 web-mobile 端，使用 Mac 平台的 Safari 浏览器的调试工具来远程调试手机 safari 的内存情况。 需要注意的是 JavaScript Heap 通常无法看出具体物理内存使用。

* WASM 资源

    为了提高 JS 模块的执行性能，比如物理引擎的计算，我们会将一些 C++ 代码直接编译成 WASM 代码片段来达到优化性能的需求。 比如 CocosCreator 部分引用的第三方物理库就是 WASM 版本。

* 基础库和 Canvas

    基础库可以理解为微信小游戏的黑盒环境暴露的 API 封装，可以防止将浏览器内核环境 API 暴露给开发者，实际测试基础库内存占用在 70M 左右。小游戏环境第一个创建的  Canvas 是主 Canvas，也是唯一可以将渲染表面同步到主界面的 Canvas，即呈现我们游戏的渲染表现。Canvas 的内存占用跟 Canvas 的宽高大小成正比。

* 音频文件

    音频文件内存是指加载到内存的音频实例

* GPU 资源

    比如顶点数据缓存，索引数据缓存，纹理缓存和渲染表面缓存等等

---

## 3.内存分析

### *常用真机内存查看工具：*

* Xcode 自带的 Instrument 分析工具
* Perfdog 工具

### *iOS端小游戏的进程名称：*

* 高性能模式：含有 WebContent
* 普通模式：含有 WeChat

### 3.1 Instruments
![20230220001|690x414](https://forum.cocos.org/uploads/default/optimized/3X/9/d/9d69e3ba0c5a18f381c02905c4bdcd2360078e2d_2_1380x828.jpeg) 
* 使用 Activity Monitor，选择对应的设备 all processes 捕捉，等进程列表刷新后，输入 webkit 进行过滤，即可看到所有进程的 CPU 与内存情况.
![20230220002|690x378](https://forum.cocos.org/uploads/default/optimized/3X/7/0/703e6ea07c74f9b8c8f9c6b1fe35075a46bb3a27_2_1380x756.jpeg) 
### 3.2 Perfdog

* 使用 [PerfDog | 移动全平台性能测试分析专家](https://perfdog.qq.com/) 选择对应的设置-进程名，即可看到相关性能数据，可以参考[【开发阶段内存调优： 把一切都控制在最开始 | 微信开放文档】](https://developers.weixin.qq.com/minigame/dev/guide/performance/perf-action-memory-dev-profile.html)。

### 3.3 微信开发者工具

* 主要使用开发者工具自带的调试器来跟踪内存数据，进入调试开发者工具界面，将 【Memory】勾选，然后刷新游戏，点击下图左上角的小圆圈按钮开始录制。结束录制后，就会显示下图界面。我们主要关注两个波形图，一个是 Main 波形图，用于查看逻辑帧调用栈，一个是 JS Heap 的峰值曲线，用于观察内存增长变化。如果我们观察到某个时刻 JS Heap 值增加，然后我们就可以查看逻辑帧调用栈大概确认数据来源。
![20230220003|690x442](https://forum.cocos.org/uploads/default/optimized/3X/5/b/5b1e68e49f689b1536d62b4e65fc5aa4b6fb6368_2_1380x884.png) 

* 通过上述步骤可以分析出游戏的 JS 内存分布，然后当我们要确定某块 js 内存的来源与释放情况，就需要用到下面的内存泄漏检测工具 - 实时内存诊断。
![20230220004|690x341](https://forum.cocos.org/uploads/default/optimized/3X/7/7/7749f0df00d761845e45c7f5d152f526957ee77f_2_1380x682.png) 

* 点击左上角的小圆圈按钮，会进入下面的录制按钮，柱状图的出现表示某个内存块的创建，消失标识内存块被释放。左上角的垃圾桶按钮是主动触发 JS引擎的 GC 的按钮，点击后可以加快内存回收速度。
![20230220005|690x327](https://forum.cocos.org/uploads/default/optimized/3X/a/c/aced6e62dec5bf4d67933ed68b89d3b9b964d96a_2_1380x654.png) 

* 再次点击左上角的红色小圆圈按钮结束录制，这时候我们可以选中蓝色区域，然后会显示该内存块包含的对象，这些是在内存中未被释放的资源，选中某个对象后，可以在 Retainers 界面看到对象的内存引用关系。到这里你可以根据代码层的逻辑关系来推理内存对象是否应该被释放，从而确认是否内存泄露。
![20230220006|690x372](https://forum.cocos.org/uploads/default/optimized/3X/6/9/69850e8b092b17d047d743cbf50c65c38603d96f_2_1380x744.png) 

## 4. 内存优化技巧

#### *常见项目的内存计算公式： 小游戏基础库 + 引擎脚本内存 + 业务脚本内存 + 音频内存 + 字体内存 + 图片内存 + Canvas 内存。*

### 以 iOS 高性能模式为例，常用的内存优化技巧如下：

* 小游戏通常基础库的内存 ~= 70M，常驻内存，不可优化。

* 引擎内存占用加载是确定的，由于引擎加载会初始化渲染器，所以通常主 Canvas 内存占用也在这个时候确定，这块内存占用可以通过配置渲染分辨率的倍数来优化。运行时根据引擎模块需要，会动态增加一些缓存内存，开发者可以根据功能需要通过编辑器项目设置里面的功能裁剪来减少引擎内存占用。

* 脚本内存包含引擎和业务代码、配置表数据, 根据游戏的开发体量，业务代码和配置表数据内存会有几百M的大小，只能用户自己做优化。

* 单个双通道的音频实例可能在 20M 左右，音频播放完后做释放会减少这块内存损耗，也可以精简成单通道音频减少内存。

* 在国内，一般使用的是中文字体，加载后内存占用至少大于 10M，所以尽量使用系统字，使用应用内部的共享资源。如果开发条件允许的情况下，可以使用  Bitmap 字体和 SDF 字体渲染。

* 图片内存是常用资源，根据加载需要，可以选择填充纹理后释放，或者缓存于内存中以便下次重新填充纹理。在iOS端上建议使用 astc 压缩纹理格式，同时禁用动态合批，这样可以释放 image 资源内存，压缩纹理本身也比 png 的内存占用小超过50%，但是 astc 的文件大小会比 png 大，所以会增加包体大小。通常为了减少首包大小，尽量将图片资源放到小游戏分包或者远程分包。

* TTF 字体文本渲染时会创建 Canvas 对象，Canvas 对象使用完会被回收到缓存池中，文本渲染的字号越多， 缓存池就越大，目前引擎没有提供回收机制，必要时可以修改引擎来释放 Canvas 缓存池。如果游戏运行内存占用比较高，可以使用 Bitmap 字体替代 TTF 字体。

* 还有其他的 JS 内存对象，比如 JSON 文件的释放，根据引擎提供的能力按需释放。

## 5. 参考文章

[微信小游戏的内存调优指南 - 知乎](https://zhuanlan.zhihu.com/p/297665769)

[高性能模式 | 微信开放文档](https://developers.weixin.qq.com/minigame/dev/guide/performance/perf-high-performance.html)

[性能测试实践 | PerfDog助力微信小游戏/小程序性能调优 - 腾讯WeTest - 博客园](https://www.cnblogs.com/wetest/p/13346501.html)

[微信小游戏的内存调优指南 - 知乎](https://zhuanlan.zhihu.com/p/297665769)

[微信小游戏学习日记1_微信小游戏框架_阿升1990的博客-CSDN博客](https://blog.csdn.net/ssw_1990/article/details/122869155)

[minigame-unity-webgl-transform/OptimizationMemory.md at main · wechat-miniprogram/minigame-unity-webgl-transform · GitHub](https://github.com/wechat-miniprogram/minigame-unity-webgl-transform/blob/main/Design/OptimizationMemory.md)