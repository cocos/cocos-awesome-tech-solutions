import { ITextureCompressType, IPVRQuality, IASTCQuality, IETCQuality } from './texture-compress';
import { IBuildTaskOption } from './options';
import { IBuildResult } from './build-result';

export interface IBuildPluginConfig {
    hooks?: string; // relate url about IHook
    options?: IDisplayOptions; // config of options
    verifyRuleMap?: IVerificationRuleMap;
}

export type IVerificationFunc = (val: any, ...arg: any[]) => boolean | Promise<boolean>;

export type IVerificationRuleMap = Record<
    string,
    {
        func?: IVerificationFunc;
        message?: string;
    }
>;

export type IDisplayOptions = Record<string, IConfigItem>;

export type ArrayItem = {
    label: string;
    value: string;
};
export interface IConfigItem {
    // 配置显示的名字，如果需要翻译，则传入 i18n:${key}
    label?: string;
    // 设置的简单说明
    description?: string;
    // 默认值
    default?: any;
    // 配置的类型
    type?: 'array' | 'object';
    itemConfigs?: IConfigItem[] | Record<string, IConfigItem>;
    verifyRules?: string[];
    attributes?: any;
    render?: {
        ui: string;
        attributes?: any;
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

export namespace BuildPlugin {
    export type Configs = Record<string, IBuildPluginConfig>;
    export type AssetHandlers = string;
    export type load = () => Promise<void> | void;
    export type Unload = () => Promise<void> | void;
}

export namespace BuildHook {
    export type throwError = boolean; // 插件注入的钩子函数，在执行失败时是否直接退出构建流程
    export type title = string; // 插件任务整体 title，支持 i18n 写法
    export type onBeforeBuild = IBaseHooks;
    export type onBeforeCompressSettings = IBaseHooks;
    export type onAfterCompressSettings = IBaseHooks;
    export type onAfterBuild = IBaseHooks;
    export type load = () => Promise<void> | void;
    export type unload = () => Promise<void> | void;
}

export namespace AssetHandlers {
    export type compressTextures = (
        tasks: { src: string; dest: string; quality: number | IPVRQuality | IASTCQuality | IETCQuality; format: ITextureCompressType }[],
    ) => Promise<void>;
}
