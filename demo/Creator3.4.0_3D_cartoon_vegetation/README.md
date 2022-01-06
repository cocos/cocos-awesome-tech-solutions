# 简介
基于 CocosCreator 3.4.0 版本创建的 3D植被卡通渲染与植被交互 项目工程。

# 介绍
本项目是基于原项目进行的升级。
    
**原项目 git地址**: https://gitee.com/mirrors_cocos-creator/cartoon-vegetation

**原项目 介绍文档**: https://www.cocos.com/%E5%A1%9E%E5%B0%94%E8%BE%BE%E7%9A%843d%E6%B8%B2%E6%9F%93%E9%A3%8E%E6%A0%BC%EF%BC%8C%E8%83%BD%E5%9C%A8%E5%B0%8F%E6%B8%B8%E6%88%8F%E8%B7%91%E8%B5%B7%E6%9D%A5%EF%BC%9F#9345

* 本文结合代码注释及在creator中的效果介绍项目中用到的植被渲染技术，主要用到的文件：grass.effect, wind.chunk(风相关效果), color.chunk, bend.chunk（）

    - 初始状态: grass -> fs -> frag    
    > 设置贴图和基础色

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112601.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112602.png)


    - 添加修改色: color -> applyVertexColor
    > 在初始状态下，添加修改色，平滑过渡

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112603.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112604.png)


    - 模拟AO : color -> applyVertexColor
    > 模拟AO，实现根部暗，顶部亮

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112605.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112606.png)


    - 摆动草地: wind -> getWindOffset
    > 摆动草地，获取风产生的偏移量

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112607.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/gif/20211126/2021112601.gif)


    - 阵风：wind->sampleGustMap
    > 阵风效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112609.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/gif/20211126/2021112602.gif)


    - 阴影：grass->shadowAttenuation
    > 阴影效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112611.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112612.png)


    - 半透明效果：color -> Translucency
    > 半透明效果，阳光到树叶方向一致时，树叶更加明亮

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112613.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112614.png)

    - 与植被互动: bend->getBendOffset
    > 与植被互动，获取植被变形的配置

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112615.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112616.png)

    - 雾效与天空盒：增强画面细节    

    开启场景(Scene)中的雾效(Fog)与天空盒(Skybox)

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112617.png)

    > 查看效果

    ![Image Text](https://github.com/cocos-creator/CococsCreator-public-technology-solutions/blob/main/image/20211126/2021112618.png)