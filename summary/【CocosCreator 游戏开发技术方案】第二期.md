# CococsCreator 技术方案分享

 技术方案来源自论坛、github 开源仓库、gitee 开源仓库、热心开发者、Cocos 引擎开发团队、cocos 技术支持团队。

---
*网络游戏防沉迷实名认证系统 SDK 接入由 Github 用户(zihuyishi)提供，技术支持团队负责接入调试、实名认证客户端制作以及文档撰写*

* (v3.4.0) 实名认证接入

  > 工程 git 仓库地址: 
  >
  > https://github.com/cocos-creator/CococsCreator-public-technology-solutions/tree/3.4.0-release/demo/Creator3.4.0_RealNameAuthentication
  >
  > 素材来自: 
  >
  > https://github.com/zihuyishi/realname-nppa-java-demo    
  > http://www.uustory.com/?p=2419    
  > https://wlc.nppa.gov.cn/fcm_company/index.html#/login?redirect=%2F    

  ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/3.4.0-release/image/20220110/2022011011.png)



*技术支持团队提供*

* (v3.4.0) 列表视图扩展

  > 工程 git 仓库地址: 
  >
  > https://github.com/cocos-creator/CococsCreator-public-technology-solutions/tree/3.4.0-release/demo/Creator3.4.0_2D_ListViewExtension

  ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/3.4.0-release/gif/20220119/2022011901.gif)
  
  > 备注: 因为目前在 Mac 平台的浏览器上存在帧率偏低以及帧率波动较大的问题，可以临时通过限制帧率`game.frameRate=61;`的方式来处理。



*技术支持团队提供*

* (v3.4.0) 3D 模型切割

  > 工程 git 仓库地址: 
  >
  > https://github.com/cocos-creator/CococsCreator-public-technology-solutions/tree/3.4.0-release/demo/Creator3.4.0_3D_MeshCutter
  >
  > 素材来自:
  >
  > https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&licenses=b9ddc40b93e34cdca1fc152f39b9f375&licenses=72360ff1740d419791934298b8b6d270&licenses=bbfe3f7dbcdd4122b966b85b9786a989&licenses=2628dbe5140a4e9592126c8df566c0b7&licenses=34b725081a6a4184957efaec2cb84ed3&licenses=7c23a1ba438d4306920229c12afcb5f9&licenses=783b685da9bf457d81e829fa283f3567&licenses=5b54cf13b1a4422ca439696eb152070d&q=tag%3Afruit&sort_by=-likeCount&type=models

  ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/3.4.0-release/gif/20220120/2022012001.gif)
  
  > - 目前只支持切割使用了 builtin-unlit 材质的模型；
  > - 引擎模块需要使用基于 Bullet 的物理引擎；
  > - 材质设置 CullMode 为 None 能一定程度改善切割后 mesh 穿模的情况，但是性能会有所下降；
  > - 目前没有对旋转后的模型节点进行切割功能适配，所以需要确保模型的没有旋转；
  > - 目前方案的性能并不是最佳的；
  > - 目前方案默认在两点之间的检测精度是 1/256，在这个精度下过于细小的碎块则无法切割。可以通过增大 raycastCount 来提高精度，但是性能会有所下降；
  > - 不是所有模型节点切割后都不会穿模，这个和模型的原始 mesh 有关，具体啥原因还不清楚；
  > - 切割后的 meshCollider 碎块目前无法发生物理碰撞；



*Github用户(kirikayakazuto)提供，由技术支持团队升级至3.4.0版本*

* (v3.4.0) 自定义形状遮罩

  > 工程 git 仓库地址: 
  >
  > https://github.com/cocos-creator/CococsCreator-public-technology-solutions/tree/3.4.0-release/demo/Creator3.4.0_2D_Mask_Polygon
  >
  > 素材来自:
  >
  > https://github.com/kirikayakazuto/CocosCreator_UIFrameWork/tree/SplitTexture

  ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/3.4.0-release/gif/20220120/2022012002.gif)