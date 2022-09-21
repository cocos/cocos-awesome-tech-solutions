*技术支持团队提供*

* (v3.4.0) 3D 桌球联网同步
  > 工程仓库地址：
   https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.4.0-release/demo/Creator3.4.2_3D_NetworkBilliards
  > 素材来自：
https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&licenses=b9ddc40b93e34cdca1fc152f39b9f375&licenses=72360ff1740d419791934298b8b6d270&licenses=bbfe3f7dbcdd4122b966b85b9786a989&licenses=2628dbe5140a4e9592126c8df566c0b7&licenses=34b725081a6a4184957efaec2cb84ed3&licenses=7c23a1ba438d4306920229c12afcb5f9&licenses=783b685da9bf457d81e829fa283f3567&licenses=5b54cf13b1a4422ca439696eb152070d&q=Billiards&sort_by=-likeCount&type=models
   > 客户端：CocosCreator 3.4.2
      服务端：Node.js
      联网方式：WebSocket
      服务器启动方式：
      项目文件夹下中执行命令行  cd AppServer，之后执行 node AppServer.js，看到输出 “Listen 8002” 即表示服务器启动正常。

   > 客户端启动方式：
      使用 Dashboard 导入本文件夹的工程，并测试。
      目前已验证通过在 web、android、ios 等三个平台的同步效果是正常的，其余平台暂无验证。
      此处提供一段 web 预览和编辑器模拟器预览时的同步测试录屏：
![NetworkBilliards 00_00_00-00_00_58|640x360](https://forum.cocos.org/uploads/default/original/3X/f/3/f3d5403597dfccc5fb326ffb0c2d24261f3196b5.gif) 
查看更多请点击链接观看：http://download.cocos.org/CocosTest/zhefengzhang/NoDelete/NetworkBilliards.mp4