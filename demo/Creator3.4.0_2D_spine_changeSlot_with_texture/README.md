# 简介
基于 CocosCreator 3.4.0 版本创建的 spine 局部贴图换装方案测试工程。
# 测试方法
 - 1  编译成 Android / iOS 后，拷贝backNative/engine/common/Classes下的3个文件，替换native/engine/common/Classes的3个文件 (Game.cpp、jsb_spine_cloth.cpp、jsb_spine_cloth.h)

 - 2  如果 无效，请检查 CMakeLists.txt。 如 native/engine/ios/CMakeLists.txt ， 需要正常引入jsb_spine_cloth.cpp、jsb_spine_cloth.h
```
set(PROJ_COMMON_SOURCES
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/Game.h
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/Game.cpp
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/jsb_spine_cloth.h
    ${CMAKE_CURRENT_LIST_DIR}/../common/Classes/jsb_spine_cloth.cpp
    ${CMAKE_CURRENT_LIST_DIR}/jni/main.cpp
)
```

 - 3 如果替换文件(步骤1)，但是在xcode中，文件没有生效，那么需要把文件重新拖入工程。
    > 以ios为例，找到项目(如spine_changeclothes)下的Source Files/Classes。找到(Game.cpp、jsb_spine_cloth.cpp、jsb_spine_cloth.h), 选中后，右击选择Delete->Remove References

 - 4 接步骤3，选择backNative/engine/common/Classes下的3个文件, 拖拽到 项目(如spine_changeclothes)下的Source Files/Classes下
    > Added Folders 选择 Create folder references
    >
    > Add to targets 选择 spine_changeclothes
