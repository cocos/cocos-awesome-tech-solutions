/**
 * settings.js 里定义的数据
 */

import { ISplashSetting, ICustomJointTextureLayout, UUID, IOrientation } from './options';

// ****************************** settings ************************************************

// debug: true
// designResolution: {width: "960", height: "640", policy: 4}
// jsList: ["assets/resources/b.js", "assets/resources/a.js"]
// launchScene: "db://assets/New Scene-001.scene"
// platform: "web-desktop"
// rawAssets: {
//     assets: {
//         "0e95a9f8-d4e7-4849-875a-7a11dd692b34": ["mesh/env/gltf/textures/birch_yellow_mat_baseColor.png", "cc.ImageAsset"]
//     }
//     internal: {
//         "1baf0fc9-befa-459c-8bdd-af1a450a0319": ["effects/builtin-standard.effect", "cc.EffectAsset"]
//     }
// }
// scenes: [{url: "db://assets/New Scene-001.scene", uuid: "69dc4a42-cc6c-49fb-9a57-7de0c212f83d"},…]
// startScene: "current_scene"
export interface ISettings {
    CocosEngine: string;
    debug: boolean;
    designResolution: ISettingsDesignResolution;
    jsList: string[];
    launchScene: string;
    preloadAssets: string[],
    moduleIds: string[];
    platform: string;
    renderPipeline: string;
    physics?: IPhysicsConfig;
    exactFitScreen: boolean;

    bundleVers: Record<string, string>;
    subpackages: string[];
    remoteBundles: string[];
    server: string;
    hasResourcesBundle: boolean;
    hasStartSceneBundle: boolean;

    scriptPackages?: string[];
    splashScreen?: ISplashSetting;

    customJointTextureLayouts?: ICustomJointTextureLayout[];

    importMaps?: Array<{
        url: string;
        map: any;
    }>;

    macros?: Record<string, any>;
    collisionMatrix?: any;
    groupList?: any;
    // preview
    engineModules: string[];
    customLayers: {name: string, bit: number}[];
    orientation?: IOrientation;
}

export interface IOutputSettings {
    CocosEngine: string;
    engine: {
        debug: boolean;
        macros: Record<string, any>;
        customLayers: {name: string, bit: number}[];
        platform: string;
        engineModules?: string[];
        builtinAssets: string[];
    };
    physics?: IPhysicsConfig;
    rendering: {
        renderPipeline: string;
        renderMode?: number;
    };
    assets: {
        server: string;
        remoteBundles: string[];
        bundleVers: Record<string, string>;
        preloadBundles: { bundle: string, version?: string }[];
        importBase?: string;
        nativeBase?: string;
        subpackages: string[];
        preloadAssets: string[];
        jsbDownloaderMaxTasks?: number;
        jsbDownloaderTimeout?: number;
        projectBundles: string[];
    };
    plugins: {
        jsList: string[];
    };
    scripting: {
        scriptPackages?: string[];
    };
    launch: {
        launchScene: string;
    };
    screen: {
        frameRate?: number;
        exactFitScreen: boolean;
        orientation?: IOrientation;
        designResolution: ISettingsDesignResolution;
    };
    splashScreen?: ISplashSetting;
    animation: {
        customJointTextureLayouts?: ICustomJointTextureLayout[];
    };
    profiling?: {
        showFPS: boolean;
    };
}

// 物理配置
export interface IVec3Like {
    x: number;
    y: number;
    z: number;
}

export interface ICollisionMatrix {
    [x: string]: number;
}

export interface IPhysicsMaterial {
    friction: number; // 0.5
    rollingFriction: number; // 0.1
    spinningFriction: number; // 0.1
    restitution: number; // 0.1
}

export interface IPhysicsConfig {
    gravity: IVec3Like; // （0，-10， 0）
    allowSleep: boolean; // true
    sleepThreshold: number; // 0.1，最小 0
    autoSimulation: boolean; // true
    fixedTimeStep: number; // 1 / 60 ，最小 0
    maxSubSteps: number; // 1，最小 0
    defaultMaterial: IPhysicsMaterial;
    useNodeChains: boolean; // true
    collisionMatrix: ICollisionMatrix;
    physicsEngine: string;
}

export interface IPackageInfo {
    name: string;
    path: string;
    uuids: UUID[];
}

export interface ISettingsDesignResolution {
    width: number;
    height: number;
    policy: number;
}

interface IAssetPathBase {
    bundleName?: string;
    redirect?: string; // 重定向的 bundle 包名
}

export interface IRawAssetPathInfo extends IAssetPathBase {
    raw: string[];
}
export declare interface IAssetPathInfo extends IAssetPathBase {
    raw?: string[];
    json?: string;
    groupIndex?: number;
}

export interface IJsonPathInfo extends IAssetPathBase {
    json?: string;
    groupIndex?: number;
}

export interface IBuildPaths {
    dir: string; // 构建资源输出地址（ assets 所在的目录，并不一定与构建目录对应）
    settings: string; // settings.json 输出地址
    systemJs?: string; // system.js 生成地址
    engineDir?: string; // 引擎生成地址
    polyfillsJs?: string; // polyfill.js 生成地址
    assets: string; // assets 目录
    subpackages: string; // subpackages 目录
    remote: string; // remote 目录
    bundleScripts: string // bundle 的脚本，某些平台无法下载脚本，则将远程包中的脚本移到本地
    applicationJS: string; // application.js 的生成地址
    compileConfig?: string; // cocos.compile.config.json
    importMap: string; // import-map 文件地址
}

export declare class IBuildResult {
    dest: string; // options 指定的构建目录

    paths: IBuildPaths; // 构建后资源相关地址集合

    settings?: ISettings;

    /**
     * 指定的 uuid 资源是否包含在构建资源中
     */
    containsAsset: (uuid: string) => boolean;

    /**
     * 获取指定 uuid 原始资源的存放路径（不包括序列化 json）
     * 自动图集的小图 uuid 和自动图集的 uuid 都将会查询到合图大图的生成路径
     * 实际返回多个路径的情况：查询 uuid 为自动图集资源，且对应图集生成多张大图，纹理压缩会有多个图片格式路径
     */
    getRawAssetPaths: (uuid: string) => IRawAssetPathInfo[];

    /**
     * 获取指定 uuid 资源的序列化 json 路径
     */
    getJsonPathInfo: (uuid: string) => IJsonPathInfo[];

    /**
     * 获取指定 uuid 资源的路径相关信息
     * @return {raw?: string[]; json?: string; groupIndex?: number;}
     * @return.raw: 该资源源文件的实际存储位置
     * @return.json: 该资源序列化 json 的实际存储位置，不存在为空
     * @return.groupIndex: 若该资源的序列化 json 在某个 json 分组内，这里标识在分组内的 index，不存在为空
     */
    getAssetPathInfo: (uuid: string) => IAssetPathInfo[];
}

export interface IBundleConfig {
    importBase: string; // bundle 中 import 目录的名称，通常是 'import'
    nativeBase: string; // native 中 native 目录的名称，通常是 'native'
    name: string; // bundle 的名称，可以通过 bundle 名称加载 bundle
    deps: string[]; // 该 bundle 依赖的其他 bundle 名称
    uuids: UUID[]; // 该 bundle 中的所有资源的 uuid
    paths: Record<string, any[]>; // 该 bundle 中可以通过路径加载的资源，参考以前 settings 中 rawAssets 的定义
    scenes: Record<string, UUID|number>; // 该 bundle 中所有场景，场景名为 key, uuid 为 value
    packs: Record<UUID, UUID[]>; // 该 bundle 中所有合并的 json, 参考以前 settings 中 packedAssets 的定义
    versions: { import: Array<string|number>, native: Array<string|number> }; // 该 bundle 中所有资源的版本号，参考以前 settings 中 md5AssetsMap 的定义
    redirect: Array<string|number>; // 该 bundle 中重定向到其他 bundle 的资源
    debug: boolean; // 是否是 debug 模式，debug 模式会对 config.json 的数据进行压缩，所以运行时得解压
    types?: string[]; // paths 中的类型数组，参考以前 settings 中 assetTypes 的定义
    encrypted?: boolean; // 原生上使用，标记该 bundle 中的脚本是否加密
    isZip?: boolean; // 是否是 zip 模式
    zipVersion?: string;
    extensionMap: Record<string, UUID[]>
}
