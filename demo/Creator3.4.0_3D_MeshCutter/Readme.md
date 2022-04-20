- 此方案受 github 社区开源方案 [mesh-cutter](https://github.com/hugoscurti/mesh-cutter) 所启发，使用 ts 语言在 CocosCreator 3.4.0 版本上实现相似功能。

当前方案需要注意的点:
- 目前只支持切割使用了 builtin-unlit 材质的模型；
- 引擎模块需要使用基于 Bullet 的物理引擎；
- 材质设置 CullMode 为 None 能一定程度改善碎块 mesh 穿模的情况，但是性能会有所下降；
- 目前没有对旋转后的模型节点进行切割功能适配，所以需要确保模型的没有旋转；
- 目前方案的性能并不是最佳的；
- 目前方案默认在两点之间的检测精度是 1/256，在这个精度下过于细小的碎块则无法切割。可以通过增大 raycastCount 来提高精度，但是性能会有所下降；
- 不是所有模型节点切割后都不会穿模，这个和模型的原始 mesh 有关，具体啥原因还不清楚；
- 切割后的 meshCollider 碎块目前无法发生物理碰撞；

TODO：
- 支持旋转后的模型节点 *P0*
- 找到切割穿模的原因并解决 *P1*
- 解决切割后的 meshCollider 碎块无法发生物理碰撞的问题 *P1*
- 提高性能 *P2*
- 提高检测的精度 *P2*

当前效果演示:

![Image Text](https://github.com/cocos/cocos-awesome-tech-solutions/blob/3.4.0-release/gif/20220120/20220120001.gif)
