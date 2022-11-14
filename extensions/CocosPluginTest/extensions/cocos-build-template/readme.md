# 自定义构建插件模板使用指南

首先欢迎体验自定义构建插件功能，这是一份自定义构建插件的简单模板，里面写了一些简单的添加构建配置以及自定义钩子函数的代码示例，更多的用法可以参考官方文档。

## 基本使用流程

- 插件模板内使用了一些 `node` 模块方法，目前在 `packages.json` 内添加了插件支持的模块 `types`，安装后才能正常编译通过以及得到更好的类型提示。

```bash
    npm install
```

- 通过直接修改该文件夹内的代码，编译后，再 **扩展管理器** 中找到对应的构建插件，然后点击 **重新载入** 图标按钮重启插件即可。

    ![重新载入](https://github.com/yanOO1497/creator-docs/raw/a4df3816c416a1d790a15acde3fc3986281588f9/zh/editor/publish/custom-project-build-template/enable-plugin.png)

    示例代码使用 ts 编写，在使用之前请先在当前目录下执行 `tsc` 编译代码。如果直接在当前文件夹内修改使用，可以执行 `tsc -w` 监听编译。

    如果还不知道如何编译代码或者如何使用 ts 编写，可以参考 [TypeScript 的官方文档](https://typescript.bootcss.com/tutorials/typescript-in-5-minutes.html)。

    在使用过程中有任何建议反馈，欢迎在**论坛**上和我们交流。

- 启用插件后打开构建插件面板，选择任意平台，即可看到构建插件注入的新参数。

    ![plugin-template](https://github.com/yanOO1497/creator-docs/raw/a4df3816c416a1d790a15acde3fc3986281588f9/zh/editor/publish/custom-project-build-template/plugin-template.png)
plugin-template
