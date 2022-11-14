export interface MenuAssetInfo {
    // 资源名字
    name: string;
    // 资源用于显示的名字
    displayName: string;
    // loader 加载的层级地址
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
export interface IAssetInfo {
    name: string; // 资源名字
    displayName: string; // 资源用于显示的名字
    source: string; // url 地址
    path: string; // loader 加载的层级地址
    url: string; // loader 加载地址会去掉扩展名，这个参数不去掉
    file: string; // 绝对路径
    uuid: string; // 资源的唯一 ID
    importer: string; // 使用的导入器名字
    imported: boolean; // 是否结束导入过程
    invalid: boolean; // 是否导入成功
    type: string; // 类型
    isDirectory: boolean; // 是否是文件夹
    library: { [key: string]: string }; // 导入资源的 map
    subAssets: { [key: string]: IAssetInfo }; // 子资源 map
    visible: boolean; // 是否显示
    readonly: boolean; // 是否只读

    instantiation?: string; // 虚拟资源可以实例化成实体的话，会带上这个扩展名
    redirect?: IRedirectInfo; // 跳转指向资源
    meta?: any,
    fatherInfo?: any;
}
