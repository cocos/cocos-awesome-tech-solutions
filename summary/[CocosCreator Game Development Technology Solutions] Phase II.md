# CococsCreator-public-technology-solutions

 Technical solutions are sourced from forums, github open source repository, gitee open source repository, enthusiastic developers, cocos engine development team, cocos technical support team. 

---
*Online game anti-addiction real-name authentication system SDK access provided by Github users (zihuyishi), technical support team is responsible for access debugging, real-name authentication client production and documentation*

* (v3.4.0) Real Name Authentication

  > Project git repository address:
  >
  > https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.4.0-release/demo/Creator3.4.0_RealNameAuthentication
  >
  > Source from:
  >
  > https://github.com/zihuyishi/realname-nppa-java-demo    
  > http://www.uustory.com/?p=2419    
  > https://wlc.nppa.gov.cn/fcm_company/index.html#/login?redirect=%2F    
  
  ![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011011.png)



*The technical support team provides*

* (v3.4.0) ListView Extension

  > Project git repository address:
  >
  > https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.4.0-release/demo/Creator3.4.0_2D_ListViewExtension

  ![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/gif/20220119/2022011901.gif)

  > Note: Because of the current low and fluctuating frame rate on Mac browsers, this can be temporarily handled by limiting the frame rate to `game.frameRate=61;`.



*The technical support team provides*

* (v3.4.0) 3D Mesh Cutter

  > Project git repository address:
  >
  > https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.4.0-release/demo/Creator3.4.0_3D_MeshCutter
  >
  > Source from:
  >
  > https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&licenses=b9ddc40b93e34cdca1fc152f39b9f375&licenses=72360ff1740d419791934298b8b6d270&licenses=bbfe3f7dbcdd4122b966b85b9786a989&licenses=2628dbe5140a4e9592126c8df566c0b7&licenses=34b725081a6a4184957efaec2cb84ed3&licenses=7c23a1ba438d4306920229c12afcb5f9&licenses=783b685da9bf457d81e829fa283f3567&licenses=5b54cf13b1a4422ca439696eb152070d&q=tag%3Afruit&sort_by=-likeCount&type=models

  ![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/gif/20220120/2022012001.gif)

  > - Currently only models with builtin-unlit materials are supported for cutting.
  > - the engine module requires a Bullet-based physics engine.
  > - setting CullMode to None for materials will improve the cutting of mesh through-moulds to some extent, but performance will be reduced.
  > - there is currently no adaptation of the cut function to rotated model nodes, so you need to ensure that the model is not rotated.
  > - the performance of the current scheme is not optimal
  > - the default detection accuracy between two points is 1/256, at which point too small fragments cannot be cut. The accuracy can be improved by increasing the raycastCount, but the performance will be reduced.
  > - not all model nodes will not be cut through, this is related to the original mesh of the model, for reasons that are unclear.
  > - cut meshCollider fragments are currently unable to physically collide.



*The Github user (kirikayakazuto) provides, upgraded to version 3.4.0 by the technical support team*

* (v3.4.0) Custom shape mask

  > Project git repository address:
  >
  > https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.4.0-release/demo/Creator3.4.0_2D_Mask_Polygon
  >
  > Source from:
  >
  > https://github.com/kirikayakazuto/CocosCreator_UIFrameWork/tree/SplitTexture

  ![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/gif/20220120/2022012002.gif)