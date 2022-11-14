// Basic information about the resource
// 资源的基础信息
export interface AssetInfo {
    // Asset name
    // 资源名字
    name: string;
    // Asset display name
    // 资源用于显示的名字
    displayName: string;
    // URL
    source: string;
    // loader 加载的层级地址
    path: string;
    // loader 加载地址会去掉扩展名，这个参数不去掉
    url: string;
    // 绝对路径
    file: string;
    // 资源的唯一 ID
    uuid: string;
    // 使用的导入器名字
    importer: string;
    // 类型
    type: string;
    // 是否是文件夹
    isDirectory: boolean;
    // 导入资源的 map
    library: { [key: string]: string };
    // 子资源 map
    subAssets: { [key: string]: AssetInfo };
    // 是否显示
    visible: boolean;
    // 是否只读
    readonly: boolean;

    // 虚拟资源可以实例化成实体的话，会带上这个扩展名
    instantiation?: string;
    // 跳转指向资源
    redirect?: IRedirectInfo;
    // 继承类型
    extends?: string[];
    // 是否导入完成
    imported: boolean;
    // 是否导入失败
    invalid: boolean;
}

export interface IRedirectInfo {
    // 跳转资源的类型
    type: string;
    // 跳转资源的 uuid
    uuid: string;
}

export interface QueryAssetsOption {
    type?: string;
    pattern?: string;
    ccType?: string;
    extname?: string;
    importer?: string;
    isBundle?: boolean;
}

export interface AssetOperationOption {
    // 是否强制覆盖已经存在的文件，默认 false
    overwrite?: boolean;
    // 是否自动重命名冲突文件，默认 false
    rename?: boolean;
}

export interface AssetDBOptions {
    name: string;
    target: string;
    library: string;
    temp: string;
    /**
     * 0: 忽略错误
     * 1: 仅仅打印错误
     * 2: 打印错误、警告
     * 3: 打印错误、警告、日志
     * 4: 打印错误、警告、日志、调试信息
     */
    level: number;
    ignoreFiles: string[];
    readonly: boolean;
}

export interface ContributionInfo {
    mount?: {
        path: string;
        readonly?: boolean;
        visible?: boolean;
        enable?: string;
    };
}

export interface ExecuteAssetDBScriptMethodOptions {
    name: string;
    method: string;
    args: any[];
}

export interface IAssetMeta {
    ver: string;
    importer: string;
    imported: boolean;
    uuid: string;
    files: string[];
    subMetas: {
        [index: string]: IAssetMeta;
    };
    userData: {
        [index: string]: any;
    };
    displayName: string;
    id: string;
    name: string;
}
