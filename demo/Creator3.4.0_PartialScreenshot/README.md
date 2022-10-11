* 目前 3.0.0 ~ 3.4.0 版本还不支持 jsb.saveImageData , 引擎将在 3.6.1 支持。

目前此方案仅支持在 android 和 ios 上将 imageData 保存为本地 png 文件：
* https://gitee.com/zzf2019/engine-native/commit/4af67e64a1caeb951016a9920efb7ee46d479ae5 （此 pr 只支持保存 png ，且只支持 ios、android）
* 3.4.0 也还存在一个 readPixels 的 bug ，记得手动合并下 pr : https://github.com/cocos-creator/engine/pull/9900/files ，3.4.0 之后的版本已修复。

更完善的支持请参考 3.6.1 上的 pr：https://github.com/cocos/cocos-engine/pull/12503/files。
