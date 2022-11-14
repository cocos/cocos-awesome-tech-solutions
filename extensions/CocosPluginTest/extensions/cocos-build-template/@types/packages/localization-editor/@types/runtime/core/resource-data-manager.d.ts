/// <reference types="../../../@types/cc" />
import { AssetManager, JsonAsset } from 'cc';
import { ResourceBundle, ResourceList } from './l10n-options';
export default class ResourceDataManager {
    readResourceList(): Promise<ResourceList>;
    readResourceBundle(tags: Intl.BCP47LanguageTag[]): Promise<ResourceBundle>;
    /**
     * 编辑器模式下使用
     * @param locales
     */
    editorLoad(locales: Intl.BCP47LanguageTag[]): Promise<ResourceBundle | undefined>;
    /**
     * 构建后运行时使用
     * @param fileName
     */
    runtimeLoad<T>(fileName: string): Promise<T | undefined>;
    /**
     * 浏览器预览使用
     * @param urlPath
     */
    previewLoad<T>(urlPath: string): Promise<T | undefined>;
    checkBundle(bundleName: string): Promise<boolean>;
    getBundle(bundleName: string): Promise<AssetManager.Bundle | undefined>;
    getResource(bundle: AssetManager.Bundle, resourceName: string): Promise<JsonAsset | undefined>;
}
