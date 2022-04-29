# 简介
基于 CocosCreator 3.4.0 版本创建的 **实名认证** 测试工程。本测试工程接入了实名认证、实名认证查询、数据上报等功能，目前只测试了实名认证功能，实名认证查询和数据上报功能，需要自行测试。

## 网络游戏防沉迷实名认证系统
网络游戏防沉迷实名认证系统主要的任务是实现全国网络游戏运营平台接入与管理、完成全国网络游戏用户实名认证、采集分析游戏用户时长数据。
该系统实现了全国网络游戏用户的实名注册与认证，有效区分了网络游戏未成年用户，为防止未成年人沉迷网络游戏，加强网络游戏监管，引导网络游戏产业良性发展奠定了基础。

网络游戏运营商在本系统中需要进行**企业注册**、**游戏接入**、**添加渠道**、**分配数据上报权限**、**接口测试**、**配置IP白名单**、**数据上报**等相关工作。

网络游戏渠道商特指取得网络游戏运营商直接或间接、全部或部分授权后，运营网络游戏的公司。网络游戏渠道商在本系统中需要网络游戏防沉迷实名认证系统用户手册进行**企业注册**、**游戏接入**、**确认渠道关系**、**获取相关权限**、**接口测试**、**配置IP白名单**、**数据上报**等相关工作。

## 接入流程

![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011001.jpg)

## 步骤
    
1. 登录[网络游戏防沉迷实名认证系统](https://wlc.nppa.gov.cn/fcm_company/index.html), 阅读用户操作指引等相关内容，完成企业注册工作。详情查看：[网络游戏防沉迷实名认证系统企业接入操作手册](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/demo/Creator3.4.0_RealNameAuthentication/file/%E7%BD%91%E7%BB%9C%E6%B8%B8%E6%88%8F%E9%98%B2%E6%B2%89%E8%BF%B7%E5%AE%9E%E5%90%8D%E8%AE%A4%E8%AF%81%E7%B3%BB%E7%BB%9F%E4%BC%81%E4%B8%9A%E6%8E%A5%E5%85%A5%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf)    
*备注：IP 白名单填写的 IP 不是本地 IP (10.0.0.0 - 10.255.255.255、172.16.0.0 - 172.31.255.255、192.168.0.0 - 192.168.255.255)，应该是公网 IP，本机的公网 IP 可以通过[IP查询](https://www.ip138.com/)查询*

2. 注册相关的具体流程 略。通过`用户名 + 密码 + 短信验证码`登录网络游戏防沉迷实名认证系统。

3. 进行测试工具接口测试。在`网络游戏防沉迷实名认证系统 -> 数据共享 -> 测试工具`中进行简单的数据测试，其中应用标识 (APPID)、游戏备案识别码 (bizId)、用户密钥 (Secret Key)为企业注册成功后获得。*后续的`接口测试`会使用到喔!*
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011002.png)    
我们模拟操作一下测试工具接口测试，选择`实名认证`, 填写`{"ai": "1000000000010"}`点击生成报文，发送请求。 会得到`报文消息密文`以及`反馈 (Response)`。
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011003.png)    

4. 进行接口测试之前，我们先了解一下本次方案需要的工程。`RealNameAuthentication`为基于`Cocos Creator 3.4.0`版本创建的工程，作为客户端。`websocketServer`为基于`Android Studio`创建的工程，用于模拟服务端(本地搭建的 WebSocket 服务器)。

5. 测试服务器。使用`Android Studio`打开`websocketServer`工程。先确保一下需要导入的 jar 依赖库是否导入成功。
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011005.png) 

6. 在 Demo.java 中配置 APPID、bizId、Secret Key 等参数，这些在进行测试工具接口测试时有介绍。另外 CheckUrl、QueryUrl 为实名认证接口和实名认证结果查询接口。          
*备注: Demo.java 的位置 websocketServer/src/main/java/demo/Demo.java*    
*备注: CheckUrl 实名认证接口为`"https://wlc.nppa.gov.cn/test/authentication/check/" + 测试码`组成，测试码为`实名认证接口`开始测试时动态生成的，测试实现1小时。*      
*备注: QueryUrl 实名认证结果查询接口为`"https://wlc.nppa.gov.cn/test/authentication/query/" + 测试码`组成，测试码为`实名认证结果查询接口`开始测试时动态生成的，测试实现1小时。*    
*备注: DataUploadUrl 数据上报接口为`"https://wlc.nppa.gov.cn/test/collection/loginout/" + 测试码`组成，测试码为`数据上报接口`开始测试时动态生成的，测试实现1小时。*   
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011006.png)
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011004.png)
运行 `Demo`, 可以获取我们的测试结果
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011007.png)
*备注: Demo 只是模拟接口测试的数据，因为使用的测试码是过期的，所以提示`TEST TASK NOT EXIST`, 这个是正常的*

7. 通过服务器 Demo 测试，启动本地服务器。在 NppaUtils.java 中配置 APPID、bizId、Secret Key、CheckUrl、QueryUrl 等参数。
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011008.png)
运行 `EchoServer`, 本地服务器搭建完成
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011009.png)

8. 测试客户端。使用`Cocos Creator 3.4.0`打开`RealNameAuthentication`工程。在 NewComponent 脚本中需要修改一下本地的 IP
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011010.png)
测试客户端
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011011.png)
![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/image/20220110/2022011012.png)
*备注: 目前是模拟接口测试测试客户端，因为使用的测试码是过期的，所以提示`TEST TASK NOT EXIST`, 这个是正常的*

9. 使用`Cocos Creator 3.4.0`构建发布，发布 Android 和 iOS 平台。

10. 进行接口测试。在`网络游戏防沉迷实名认证系统 -> 数据共享 -> 接口测试 -> 开始测试`可以获取测试码，修改`android studio`工程下的配置，进行测试。详情查看：[网络游戏防沉迷实名认证系统测试系统说明](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/demo/Creator3.4.0_RealNameAuthentication/file/%E7%BD%91%E7%BB%9C%E6%B8%B8%E6%88%8F%E9%98%B2%E6%B2%89%E8%BF%B7%E5%AE%9E%E5%90%8D%E8%AE%A4%E8%AF%81%E7%B3%BB%E7%BB%9F%E6%B5%8B%E8%AF%95%E7%B3%BB%E7%BB%9F%E8%AF%B4%E6%98%8E.pdf)

11. 接口参数说明
#### 请求报文数据
// 访问密钥    
secretKey:2836e95fcd10e04b0069bb1ee659955b    
// 待加密数据    
{"ai":"test-accountId","name":"用户姓名","idNum":"371321199012310912"}    
// AES-128/GCM + BASE64加密后请求体数据    
{"data":"CqT/33f3jyoiYqT8MtxEFk3x2rlfhmgzhxpHqWosSj4d3hq2EbrtVyx2aLj565ZQNTcPrcDipnvpq/D/vQDaLKW70O83Q42zvR0/OfnYLcIjTPMnqa+SOhsjQrSdu66ySSORCAo"}
#### 签名Sign
// 访问密钥    
secretKey:2836e95fcd10e04b0069bb1ee659955b    
// 系统参数    
appId:test-appId    
bizId:test-bizId    
timestamps:1584949895758    
// 业务参数-URL    
id=test-id&name=test-name     
// 业务参数-请求体 上面请求报文数据中加密后获得的请求体数据    
{"data":"CqT/33f3jyoiYqT8MtxEFk3x2rlfhmgzhxpHqWosSj4d3hq2EbrtVyx2aLj565ZQNTcPrcDipnvpq/D/vQDaLKW70O83Q42zvR0//OfnYLcIjTPMnqa+SOhsjQrSdu66ySSORCAo"}    
// 待加密字符串    
secretKey + “appId” + test-appId + “bizId” +test-bizId + “timestamps” + 1584949895758 + {"data":"CqT/33f3jyoiYqT8MtxEFk3x2rlfhmgzhxpHqWosSj4d3hq2EbrtVyx2aLj565ZQNTcPrcDipnvpq/D/vQDaLKW70O83Q42zvR0//OfnYLcIjTPMnqa+SOhsjQrSdu66ySSORCAo"}    
// 使用 SHA256 算法对待加密字符串进行计算,得到数据签名    
SHA256(secretKey + “appId” + test-appId + “bizId” +test-bizId + “timestamps” + 	1584949895758+{"data":"CqT/33f3jyoiYqT8MtxEFk3x2rlfhmgzhxpHqWosSj4d3hq2EbrtVy	x2aLj565ZQNTcPrcDipnvpq/D/vQDaLKW70O83Q42zvR0//OfnYLcIjTPMnqa+SOhsjQrSd	u66ySSORCAo"})    
// 将得到的数据签名赋值给参数 sign    
sign=386c03b776a28c06b8032a958fbd89337424ef45c62d0422706cca633d8ad5fd

12. 基本操作流程    
websocket服务端启动 -> 客户端启动 -> 登录请求 -> 实名认证 -> 实名认证查询

13. 目前接口测试提供的预制数据

|   编号   |     类型    |     预制数据    |   结果   |
| :------: | :---------:  | :-----------: | :-----: |
| 1.1 | 实名认证 | {"ai":"100000000000000001", "name":"某一一", "idNum":"110000190101010001"} | 认证成功 |
| 1.2 | 实名认证 | {"ai":"100000000000000002", "name":"某一二", "idNum":"110000190101020007"} | 认证成功 |
| 1.3 | 实名认证 | {"ai":"100000000000000003", "name":"某一三", "idNum":"110000190101030002"} | 认证成功 |
| 1.4 | 实名认证 | {"ai":"100000000000000004", "name":"某一四", "idNum":"110000190101040008"} | 认证成功 |
| 1.5 | 实名认证 | {"ai":"100000000000000005", "name":"某一五", "idNum":"11000019010101001X"} | 认证成功 |
| 1.6 | 实名认证 | {"ai":"100000000000000006", "name":"某一六", "idNum":"110000190101020015"} | 认证成功 |
| 1.7 | 实名认证 | {"ai":"100000000000000007", "name":"某一七", "idNum":"110000190101030010"} | 认证成功 |
| 1.8 | 实名认证 | {"ai":"100000000000000008", "name":"某一八", "idNum":"110000190101040016"} | 认证成功 |
| 2.1 | 实名认证 | {"ai":"200000000000000001", "name":"某二一", "idNum":"110000190201010009"} | 认证中 |
| 2.2 | 实名认证 | {"ai":"200000000000000002", "name":"某二二", "idNum":"110000190201020004"} | 认证中 |
| 2.3 | 实名认证 | {"ai":"200000000000000003", "name":"某二三", "idNum":"11000019020103000X"} | 认证中 |
| 2.4 | 实名认证 | {"ai":"200000000000000004", "name":"某二四", "idNum":"110000190201040005"} | 认证中 |
| 2.5 | 实名认证 | {"ai":"200000000000000005", "name":"某二五", "idNum":"110000190201010017"} | 认证中 |
| 2.6 | 实名认证 | {"ai":"200000000000000006", "name":"某二六", "idNum":"110000190201020012"} | 认证中 |
| 2.7 | 实名认证 | {"ai":"200000000000000007", "name":"某二七", "idNum":"110000190201030018"} | 认证中 |
| 2.8 | 实名认证 | {"ai":"200000000000000008", "name":"某二八", "idNum":"110000190201040013"} | 认证中 |
| 3.1 | 实名认证查询 | {"ai":"100000000000000001"} | 认证成功 |
| 3.2 | 实名认证查询 | {"ai":"100000000000000002"} | 认证成功 |
| 3.3 | 实名认证查询 | {"ai":"100000000000000003"} | 认证成功 |
| 3.4 | 实名认证查询 | {"ai":"100000000000000004"} | 认证成功 |
| 3.5 | 实名认证查询 | {"ai":"100000000000000005"} | 认证成功 |
| 3.6 | 实名认证查询 | {"ai":"100000000000000006"} | 认证成功 |
| 3.7 | 实名认证查询 | {"ai":"100000000000000007"} | 认证成功 |
| 3.8 | 实名认证查询 | {"ai":"100000000000000008"} | 认证成功 |
| 4.1 | 实名认证查询 | {"ai":"200000000000000001"} | 认证中 |
| 4.2 | 实名认证查询 | {"ai":"200000000000000002"} | 认证中 |
| 4.3 | 实名认证查询 | {"ai":"200000000000000003"} | 认证中 |
| 4.4 | 实名认证查询 | {"ai":"200000000000000004"} | 认证中 |
| 4.5 | 实名认证查询 | {"ai":"200000000000000005"} | 认证中 |
| 4.6 | 实名认证查询 | {"ai":"200000000000000006"} | 认证中 |
| 4.7 | 实名认证查询 | {"ai":"200000000000000007"} | 认证中 |
| 4.8 | 实名认证查询 | {"ai":"200000000000000008"} | 认证中 |
| 5.1 | 实名认证查询 | {"ai":"300000000000000001"} | 认证失败 |
| 5.2 | 实名认证查询 | {"ai":"300000000000000002"} | 认证失败 |
| 5.3 | 实名认证查询 | {"ai":"300000000000000003"} | 认证失败 |
| 5.4 | 实名认证查询 | {"ai":"300000000000000004"} | 认证失败 |
| 5.5 | 实名认证查询 | {"ai":"300000000000000005"} | 认证失败 |
| 5.6 | 实名认证查询 | {"ai":"300000000000000006"} | 认证失败 |
| 5.7 | 实名认证查询 | {"ai":"300000000000000007"} | 认证失败 |
| 5.8 | 实名认证查询 | {"ai":"300000000000000008"} | 认证失败 |
| 6.1 | 数据上报 | {"pi":"1fffbjzos82bs9cnyj1dna7d6d29zg4esnh99u"} | 上报成功 |
| 6.2 | 数据上报 | {"pi":"1fffbkmd9ebtwi7u7f4oswm9li6twjydqs7qjv"} | 上报成功 |
| 6.3 | 数据上报 | {"pi":"1fffblf892i0p1zh6wlec2quukxtw29v4yismp"} | 上报成功 |
| 6.4 | 数据上报 | {"pi":"1fffbmr55j92gttv5wxspm0mgvw8x3p0n7cy0j"} | 上报成功 |
| 6.5 | 数据上报 | {"pi":"1fffbjqfba5y6uwr55cdak6faokhm4s02qkyue"} | 上报成功 |
| 6.6 | 数据上报 | {"pi":"1fffbkrwndszes1sngfx3v6pdqh87fi4zhz9ur"} | 上报成功 |
| 6.7 | 数据上报 | {"pi":"1fffbl6st3fbp199i8zh5ggcp84fgo3rj7pn1y"} | 上报成功 |
| 6.8 | 数据上报 | {"pi":"1fffbmzwmr1k3y8bri2linqbhnvmu510u5jj6z"} | 上报成功 |

14. 如果需要接入正式的接口，修改接口    
"https://wlc.nppa.gov.cn/test/authentication/check/"   ->   "https://wlc.nppa.gov.cn/idcard/authentication/check/"    
"https://wlc.nppa.gov.cn/test/authentication/query/"   ->   "https://wlc.nppa.gov.cn/idcard/authentication/query/"    
"https://wlc.nppa.gov.cn/test/collection/loginout/"   ->   "https://wlc.nppa.gov.cn/behavior/collection/loginout/"    
详情查看：[网络游戏防沉迷实名认证系统接口对接技术规范](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/demo/Creator3.4.0_RealNameAuthentication/file/%E7%BD%91%E7%BB%9C%E6%B8%B8%E6%88%8F%E9%98%B2%E6%B2%89%E8%BF%B7%E5%AE%9E%E5%90%8D%E8%AE%A4%E8%AF%81%E7%B3%BB%E7%BB%9F%E6%8E%A5%E5%8F%A3%E5%AF%B9%E6%8E%A5%E6%8A%80%E6%9C%AF%E8%A7%84%E8%8C%83.pdf) 