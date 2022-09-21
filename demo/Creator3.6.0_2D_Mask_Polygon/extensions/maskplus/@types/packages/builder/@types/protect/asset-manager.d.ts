import { AssetInfo } from "../../../asset-db/@types/public";
import { UUID } from "../public";
import { IInternalBuildOptions } from "./options";
export interface IBuildStatiscInfo {
    packageName: string;
    gameName: string;
    platform: string;
    scenesNum: number;
    assetsNum: number;
    scriptNum: number;

    includeModules: string[];
    orientation: string;
    remoteServerAddress: string;
    appid: string;

    size: number;
    time: number;
    err: string;
}

// ********************************* asset-manager *********************************

export class BuilderAssetCache {
    // 场景资源的 assets 信息缓存
    public readonly sceneUuids: Array<string>;

    // 脚本资源的 assets 信息缓存
    public readonly scriptUuids: Array<string>;

    // 除场景、脚本资源外的资源 assets uuid 缓存
    public readonly assetUuids: Array<string>;

    init: () => Promise<void>;
    addAsset: (asset: IAssetInfo) => void;
    addInstance: (instance: any) => void;
    clearAsset: (uuid: string) => void;
    getMeta: (uuid: string) => Promise<any>;
    getAssetInfo: (uuid: string) => IAssetInfo;
    getDependUuids: (uuid: string) => Promise<readonly string[]>;
    getDependUuidsDeep: (uuid: string) => Promise<readonly string[]>;
    /**
     * 获取序列化文件
     */
    getLibraryJSON: (uuid: string) => Promise<any>;
    getSerializedJSON: (uuid: string, options: IInternalBuildOptions) => Promise<any>;
    forEach: (type: string, handle: Function) => Promise<void>;
    getInstance: (uuid: string) => Promise<any>;
    __addStaticsInfo: (info: any) => void;
}

export interface IAssetInfo extends AssetInfo {
    meta?: any;
    temp?: string; // 资源的构建缓存目录
    fatherInfo?: any;
    // fatherUuid?: string | undefined;
    userData?: any;
    subAssets: Record<string, IAssetInfo>;
    dirty?: boolean;
    // 内置资源没有 mtime
    mtime?: number;
}
export type IUrl = string; // 需要的是符合 url 标准的字符串，例如 asset/script/text.ts
export type IAssetInfoMap = Record<UUID, IAssetInfo>;
export type IUuidDependMap = Record<UUID, UUID[]>;
export type IJsonGroupMap = Record<UUID, IJSONGroupItem>;
export type IAssetGroupMap = Record<UUID, IAssetGroupItem>;

// TODO meta 的类型定义
export type IMetaMap = Record<UUID, any>;
export type IJsonMap = Record<UUID, any>;
export type IInstanceMap = Record<UUID, any>;

export type ICompressOptions = Record<string, number>;
export interface IAssetGroupItem {
    // 分组名字
    // name: string;
    // 分组的根 url
    baseUrls: string[];
    // 脚本编译后的实际地址
    scriptDest: string;
    // 脚本 uuid 列表
    scriptUuids: UUID[];
    // raw 资源 uuid 列表
    assetUuids: UUID[];
}

export interface IJSONGroupItem {
    // 分组名字
    name?: string;
    // 分组名字
    type: string;
    // json 资源 uuid 列表
    uuids: UUID[];
}

export interface IAssetGroupOptions {
    // 脚本打包后的输出路径
    scriptUrl: string;
    baseUrl: string;
}

export type IGroupType = 'json' | 'script' | 'asset';
export interface PacInfo {
    meta: any;
    asset: IAssetInfo;
    spriteFrames: any[];
    relativePath: string;
    relativeDir: string;
}

export type IUpdateType = 'asset-change' | 'asset-add' | 'asset-delete';
export interface IUpdateInfo {
    type: IUpdateType;
    uuid: string;
}

