/**
 * 外部插件注册搜索方式指定返回的接口
 *
 * @export
 * @interface SearchMenuItem
 */
export interface SearchMenuItem {
    label: string;
    key: string;
    // handler 方法是外部扩展的搜索方法，返回 true 表示匹配搜索成功
    // searchValue 表示 assets 面板输入的搜索内容，asset 表示匹配搜索时的节点信息
    handler: (searchVale: string, asset: any) => boolean | Promise<boolean>;
}

/**
 * 外部插件注册扩展的入口
 * 可以是搜索方式或限定搜索类型
 *
 * @export
 * @interface SearchExtension
 */
export interface SearchExtension {
    searchMenu: Function; // 搜索方式
}
