// ********************************* plugin ****************************************

import { BundleCompressionType, IBuildPluginConfig, IBuildTaskOption, IDisplayOptions, ISettings, IVerificationRuleMap } from '../public';
import { BuilderAssetCache } from './asset-manager';
import { InternalBuildResult } from './build-result';
import { IInternalBuildOptions } from './options';
import { ITextureCompressPlatform, ITextureCompressType } from '../public/texture-compress';

export interface IBuildWorkerPluginInfo {
    assetHandlers?: string;
    // 注册到各个平台的钩子函数
    hooks?: Record<string, string>;
    pkgName: string;
    internal: boolean; // 是否为内置插件
    priority: number; // 优先级
}

export type IPluginHookName =
    | 'onBeforeBuild'
    | 'onAfterInit'
    | 'onBeforeInit'
    | 'onAfterInit'
    | 'onBeforeBuildAssets'
    | 'onAfterBuildAssets'
    | 'onBeforeCompressSettings'
    | 'onAfterCompressSettings'
    | 'onAfterBuild';
// | 'onBeforeCompile'
// | 'compile'
// | 'onAfterCompile'
// | 'run';

export type IPluginHook = Record<IPluginHookName, IInternalBaseHooks>;
export interface IInternalHook {
    throwError?: boolean; // 插件注入的钩子函数，在执行失败时是否直接退出构建流程
    title?: string; // 插件任务整体 title，支持 i18n 写法
    // ------------------ 钩子函数 --------------------------
    onBeforeBuild?: IInternalBaseHooks;
    onBeforeInit?: IInternalBaseHooks;
    onAfterInit?: IInternalBaseHooks;
    onBeforeBuildAssets?: IInternalBaseHooks;
    onAfterBuildAssets?: IInternalBaseHooks;
    onBeforeCompressSettings?: IInternalBaseHooks;
    onAfterCompressSettings?: IInternalBaseHooks;
    onAfterBuild?: IInternalBaseHooks;
    // ------------------ 其他操作函数 ---------------------
    // 内置插件才有可能触发这个函数
    run?: (dest: string, options: IBuildTaskOption) => Promise<boolean>;
    // 内置插件才有可能触发这个函数
    compile?: (dest: string, options: IBuildTaskOption) => boolean;
}

export type IInternalBaseHooks = (options: IInternalBuildOptions, result: InternalBuildResult, cache: BuilderAssetCache, ...args: any[]) => void;
export interface IBuildTask {
    handle: (options: IInternalBuildOptions, result: InternalBuildResult, cache: BuilderAssetCache, settings?: ISettings) => {};
    title: string;
    name: string;
}

export interface IBuildHooksInfo {
    pkgNameOrder: string[];
    infos: Record<string, { path: string; internal: boolean }>;
}
export interface IBuildAssetHandlerInfo {
    pkgNameOrder: string[];
    handles: {[pkgName: string]: Function};
}
export interface IInternalBuildPluginConfig extends IBuildPluginConfig {
    platformName?: string; // 平台名，可以指定为 i18n 写法, 只有官方构建插件的该字段有效
    hooks?: string; // 钩子函数的存储路径
    panel?: string; // 存储导出 vue 组件、button 配置的脚本路径
    textureCompressConfig?: {
        // 仅对内部插件开放
        platformType: ITextureCompressPlatform; // 注册的纹理压缩平台类型
        support: {
            rgba: ITextureCompressType[];
            rgb: ITextureCompressType[];
        }; // 该平台支持的纹理压缩格式，按照推荐优先级排列
    };
    assetBundleConfig?: {
        // asset bundle 的配置
        supportedCompressionTypes: BundleCompressionType[];
    };
    priority?: number;
    wrapWithFold?: boolean; // 是否将选项显示在折叠框内（默认 true ）
    options?: IDisplayOptions; // 需要注入的平台参数配置
    verifyRuleMap?: IVerificationRuleMap; // 注入的需要更改原有参数校验规则的函数
    commonOptions?: Record<string, boolean>;
    // TODO 之前为 ios-app-clip HACK 出来的接口，之后需要重新设计
    realInFileExplorer?: (options: IInternalBuildOptions | any) => void; // 根据构建配置计算输出地址（界面中的在文件夹中显示）
    debugConfig?: IDebugConfig;
    internal?: boolean;
}

export interface BuildCheckResult {
    error: string;
    newValue: any;
}

export type IBuildVerificationFunc = (value: any, options: IBuildTaskOption) => boolean | Promise<boolean>;

export interface IButtonConfigItem {
    label: string; // 按钮名称
    click?: (event: Event, options: IBuildTaskOption) => void; // 点击事件响应函数
    hookHandle?: string; // 点击后执行的方法，与 click 二选一
    tooltip?: string; // 鼠标上移到按钮上的文本提示
    // 只有指定 hookHandle 配置的按钮，才可以影响进度条，构建将会自动为每个按钮创建一个构建内置任务，并提供对应的进度 log 更新等等。
    // attributes?: any; // 想要添加在按钮上的一些属性值（class, style, title)
}

export interface IDebugConfig {
    options?: IDisplayOptions; // 显示在构建平台编译运行调试工具上的配置选项
    custom?: string; // 显示在构建平台编译运行调试工具上的配置 vue 组件
}

// ui-panel 注册数据
export interface PanelInfo {
    $?: { [name: string]: string | HTMLElement | null };
    template?: string; // TODO 暂时设置为可选
    style?: string;
    methods?: { [name: string]: Function };
    ready?: Function;
    close?: Function;
    update?: (options: IBuildTaskOption, path: string, value: any) => void | Promise<void>;
}

export interface IPanelThis {
    $: Record<string, HTMLElement>;
    dispatch: (name: string, ...args: any[]) => void;
}

export interface IPanelInfo extends PanelInfo {
    component?: any; // 注入面板的 vue 组件，可与与 options 共存，options 会优先显示
    buttonConfig?: IButtonConfig; // 要注入的构建选项脚本
}

export interface IButtonConfig {
    configs?: Record<string, IButtonConfigItem>;
    custom?: any;
}

export interface ICompInfo {
    custom?: any;
    options?: IDisplayOptions;
    panelInfo?: PanelInfo;
    displayName?: string;
    wrapWithFold: boolean;

    // ..... 初始化时未存在的字段 .....
    panel?: any; // 实例化后的 panel 对象
    pkgName?: string; // 插件名称
}
