import { IBuildTimeConstantValue } from "@cocos/build-engine/dist/build-time-constants";
import { IBuildDesignResolution, IBuildTaskOption } from "../public";

export interface ScriptAssetuserData {
    isPlugin?: boolean;
    isNative?: boolean;
    loadPluginInNative?: boolean;
    loadPluginInWeb?: boolean;
}

export interface IBuildScriptParam {
    /**
     * 若存在，表示将 import map 转换为指定的模块格式。
     */
    importMapFormat?: 'commonjs' | 'esm';

    polyfills?: IPolyFills;

    /**
     * 擦除模块结构。当选择后会获得更快的脚本导入速度，但无法再使用模块特性，如 `import.meta`、`import()` 等。
     * @experimental
     */
    experimentalEraseModules?: boolean;
    outputName: string; // 输出文件夹名称（带后缀）
    targets?: ITransformTarget;

    system?: {
        preset?: 'web' | 'commonjs-like',
    },

    flags: Record<string, IBuildTimeConstantValue>,
}

export interface IPolyFills {
    /**
     * True if async functions polyfills(i.e. regeneratorRuntime) needs to be included.
     * You need to turn on this field if you want to use async functions in language.
     */
    asyncFunctions?: boolean;

    /**
     * If true, [core-js](https://github.com/zloirock/core-js) polyfills are included.
     * The default options of [core-js-builder](https://github.com/zloirock/core-js/tree/master/packages/core-js-builder)
     * will be used to build the core-js.
     */
    coreJs?: boolean;

    targets?: string;
}
/**
 * 模块保留选项。
 * - 'erase' 擦除模块信息。生成的代码中将不会保留模块信息。
 * - 'preserve' 保留原始模块信息。生成的文件将和原始模块文件结构一致。
 * - 'facade' 保留原始模块信息，将所有模块转化为一个 SystemJS 模块，但这些模块都打包在一个单独的 IIFE bundle 模块中。
 *   当这个 bundle 模块执行时，所有模块都会被注册。
 *   当你希望代码中仍旧使用模块化的特性（如动态导入、import.meta.url），但又不希望模块零散在多个文件时可以使用这个选项。
 */
export type ModulePreservation = 'erase' | 'preserve' | 'facade';

export type INewConsoleType = 'log' | 'warn' | 'error' | 'debug';

export interface IInternalBuildOptions extends IBuildTaskOption {
    dest: string;
    // 编译 application.js 参数配置
    appTemplateData: appTemplateData;
    // 编译引擎参数配置
    buildEngineParam: IBuildEngineParam;
    // 编译脚本配置选项
    buildScriptParam: IBuildScriptParam;
    // 序列化打包资源时的特殊处理
    assetSerializeOptions: {
        'cc.EffectAsset': {
            glsl1: boolean;
            glsl3: boolean;
            glsl4: boolean;
        };
        // 是否输出 ccon 格式
        exportCCON?: boolean;

        allowCCONExtension?: boolean;
    };
    updateOnly: boolean;
    nextTasks?: string[];
    generateCompileConfig?: boolean;
    recompileConfig?: IRecompileConfig;
    logDest?: string; // log 输出地址

    // 项目设置，重复定义为必选参数
    includeModules: string[];
    renderPipeline: string;
    designResolution: IBuildDesignResolution;
    physicsConfig: any;
    flags: Record<string, boolean>;
}


export interface appTemplateData {
    debugMode: boolean;
    renderMode: boolean; // !!options.renderMode,
    // ImportMapSupported: boolean;
    // NonconformingCommonJs: boolean;
    showFPS: boolean;
    importMapFile?: string;
    resolution: {
        policy: number;
        width: number;
        height: number;
    };
    // hasPhysicsAmmo: boolean;
    md5Cache: boolean;
    server: string; // 服务器地址

    cocosTemplate?: string; // 注入的子模板路径
}

export interface IBuildEngineParam {
    entry?: string; // 引擎入口文件
    debug: boolean;
    sourceMaps: boolean;
    platform: string;
    includeModules: string[];
    engineVersion: string;
    md5Map: string[];
    engineName: string;
    useCache: boolean;
    split?: boolean;
    targets?: ITransformTarget;
    skip?: boolean;
    ammoJsWasm?: boolean | 'fallback';
    assetURLFormat?:
        | 'relative-from-out'
        | 'relative-from-chunk'
        | 'runtime-resolved';
    baseUrl?: string;
}

export type ITransformTarget = string | string[] | Record<string, string>;

export interface IRecompileConfig {
    enable: boolean;
    generateAssets: boolean;
    generateScripts: boolean;
    generateEngine: boolean; // 是否生成引擎
    generateEngineByCache: boolean; // 是否使用缓存引擎
}
