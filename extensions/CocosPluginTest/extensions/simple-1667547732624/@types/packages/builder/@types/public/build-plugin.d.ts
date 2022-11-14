import { ITextureCompressType, IPVRQuality, IASTCQuality, IETCQuality, ITextureFormatInfo } from './texture-compress';
import { IBuildTaskOption, IConsoleType } from './options';
import { IBuildResult } from './build-result';

export interface IBuildPluginConfig {
    doc?: string; // 文档地址，支持 HTTP 地址，支持相对于编辑器官方 URL 的地址
    hooks?: string; // relate url about IHook
    options?: IDisplayOptions; // config of options
    verifyRuleMap?: IVerificationRuleMap;
}

export type IVerificationFunc = (val: any, ...arg: any[]) => boolean | Promise<boolean>;
export type IInternalVerificationFunc = (val: any, ...arg: any[]) => boolean;

export type IVerificationRuleMap = Record<string, IVerificationRule>;

export interface IVerificationRule {
    func: IVerificationFunc;
    message: string;
}
export interface IInternalVerificationRule {
    func: IInternalVerificationFunc;
    message: string;
}

export interface ITextureFormatConfig {
    displayName: string;
    options: IDisplayOptions;
    formats: ITextureFormatInfo[]; // 未指定 formats 则当前格式 key 作为存储的格式 value
    suffix: string;
}

export type IDisplayOptions = Record<string, IConfigItem>;

export type ArrayItem = {
    label: string;
    value: string;
};

export interface IConfigItem {
    key?: string; // 唯一标识符
    // 配置显示的名字，如果需要翻译，则传入 i18n:${key}
    label?: string;
    // 设置的简单说明
    description?: string;

    experiment?: boolean; // 是否为实验性属性
    // 默认值
    default?: any;
    // 配置的类型
    type?: 'array' | 'object';
    itemConfigs?: IConfigItem[] | Record<string, IConfigItem>;
    verifyRules?: string[];
    verifyLevel?: IConsoleType, // 不赋值是默认为 error，等级为 error 时校验不通过将会无法点击构建，其他则仅做界面提示
    hidden?: boolean; // 是否隐藏
    render?: {
        ui: string;
        attributes?: Record<string, string | boolean | number>;
        items?: ArrayItem[];
    };
}

export interface IBuildPlugin {
    configs?: BuildPlugin.Configs;
    assetHandlers?: BuildPlugin.AssetHandlers;
    load?: BuildPlugin.load;
    unload?: BuildPlugin.Unload;
}
export type IBaseHooks = (options: IBuildTaskOption, result: IBuildResult) => Promise<void> | void;
export type IBuildStageHooks = (root: string, options: IBuildTaskOption) => Promise<void> | void;

export namespace BuildPlugin {
    export type Configs = Record<string, IBuildPluginConfig>;
    export type AssetHandlers = string;
    export type load = () => Promise<void> | void;
    export type Unload = () => Promise<void> | void;
}

export namespace BuildHook {
    export type throwError = boolean; // 插件注入的钩子函数，在执行失败时是否直接退出构建流程
    export type title = string; // 插件任务整体 title，支持 i18n 写法

    export type onError = IBaseHooks; // 构建发生中断错误时的回调，仅作为事件通知，并不能劫持错误

    export type onBeforeBuild = IBaseHooks;
    export type onBeforeCompressSettings = IBaseHooks;
    export type onAfterCompressSettings = IBaseHooks;
    export type onAfterBuild = IBaseHooks;

    export type onAfterMake = IBuildStageHooks;
    export type onBeforeMake = IBuildStageHooks;

    export type load = () => Promise<void> | void;
    export type unload = () => Promise<void> | void;
}

export namespace AssetHandlers {
    export type compressTextures = (
        tasks: { src: string; dest: string; quality: number | IPVRQuality | IASTCQuality | IETCQuality; format: ITextureCompressType }[],
    ) => Promise<void>;
}
