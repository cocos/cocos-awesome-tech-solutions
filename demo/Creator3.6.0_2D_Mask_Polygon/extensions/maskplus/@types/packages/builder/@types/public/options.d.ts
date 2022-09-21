/**
 * 构建所需的完整参数
 */
export interface IBuildTaskOption {
    // 构建后的游戏文件夹生成的路径
    buildPath: string;
    debug: boolean;
    inlineSpriteFrames: boolean;
    md5Cache: boolean;
    // bundle 设置
    mainBundleCompressionType: BundleCompressionType;
    mainBundleIsRemote: boolean;
    moveRemoteBundleScript: boolean;
    mergeJson: boolean;
    name: string;
    packAutoAtlas: boolean;
    platform: Platform;
    scenes: IBuildSceneItem[];
    compressTexture: boolean;
    sourceMaps: boolean;
    startScene: string;
    outputName: string;
    experimentalEraseModules: boolean;

    /**
     * 是否是预览进程发送的构建请求。
     * @default false
     */
    preview?: boolean;

    // 项目设置
    includeModules?: string[];
    renderPipeline?: string;
    designResolution?: IBuildDesignResolution;
    physicsConfig?: any;
    flags?: Record<string, boolean>;


    // 是否使用自定义插屏选项
    replaceSplashScreen?: boolean;
    splashScreen: ISplashSetting;

    packages?: Record<string, any>;
    id?: string; // 手动配置构建任务 id
    // recompileConfig?: IRecompileConfig;

    customLayers: {name: string, value: number}[];
}

export type UUID = string;

export interface ISplashSetting {
    base64src: string;
    displayRatio: number;
    totalTime: number;
    effect: string;
    clearColor: { x: number; y: number; z: number; w: number };
    displayWatermark: boolean;
}

export interface ICustomJointTextureLayout {
    textureLength: number;
    contents: IChunkContent[];
}

export interface IChunkContent {
    skeleton: null | string;
    clips: string[];
}

/**
 * 构建使用的设计分辨率数据
 */
export interface IBuildDesignResolution {
    height: number;
    width: number;
    fitWidth?: boolean;
    fitHeight?: boolean;
}

/**
 * 构建使用的场景的数据
 */
export interface IBuildSceneItem {
    url: string;
    uuid: string;
}

// **************************** options *******************************************
export type Platform =
    | 'web-desktop'
    | 'web-mobile'
    | 'wechatgame'
    | 'oppo-mini-game'
    | 'vivo-mini-game'
    | 'huawei-quick-game'
    | 'alipay-mini-game'
    | 'mac'
    | 'ios'
    // | 'ios-app-clip'
    | 'android'
    | 'ohos'
    | 'windows'
    | 'xiaomi-quick-game'
    | 'baidu-mini-game'
    | 'bytedance-mini-game'
    | 'cocos-play'
    | 'huawei-agc'
    | 'link-sure'
    | 'qtt'
    | 'cocos-runtime'
    ;

export type BundleCompressionType = 'none' | 'merge_dep' | 'merge_all_json' | 'subpackage' | 'zip';
export type IModules = 'esm' | 'commonjs' | 'systemjs';

export interface ITransformOptions {
    importMapFormat: IModules;
}

export type ITaskState = 'waiting' | 'success' | 'failure' | 'cancel' | 'processing';

export interface ITaskItemJSON {
    id: string;
    progress: number;
    state: ITaskState;
    message: string;
    options: IBuildTaskOption;
    time: string;
    dirty: boolean;
    rawOptions: IBuildTaskOption;
}
