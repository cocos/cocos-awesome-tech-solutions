import type { L10nOptions, ResourceData, L10nKey, L10nValue } from './l10n-options';
import { StandardOption, Template, TextInfoDirection } from './icu-options';
import L10nListenEvent from './l10n-listen-event';
import ResourceDataManager from './resource-data-manager';
import AMPipeLineManager from './asset-manager-initer';
export declare class L10nManager {
    static LOCAL_STORAGE_LANGUAGE_KEY: string;
    static DEFAULT_NAMESPACE: string;
    static l10n: L10nManager;
    /**
     * @zh
     * i18n 实例
     * @en
     * i18next instance
     */
    private _intl?;
    private _options;
    private resourceList?;
    private resourceBundle;
    resourceDataManager: ResourceDataManager;
    amPipeLineManager: AMPipeLineManager;
    private constructor();
    isInitialized(): boolean;
    createIntl(options: L10nOptions): Promise<void>;
    cloneIntl(options: L10nOptions): void;
    reloadResourceData(): Promise<boolean>;
    /** 初始化 i18next */
    config(options: L10nOptions): void;
    changeLanguage(language: Intl.BCP47LanguageTag): Promise<void>;
    t(key: L10nKey, options?: StandardOption | Template): L10nValue;
    /**
     * 实验性功能暂不开放
     * 数字类ICU
     */
    private tn;
    /**
     * 实验性功能暂不开放
     * 日期/时刻类ICU
     */
    private td;
    /**
     * 实验性功能暂不开放
     * 时长类ICU
     */
    private tt;
    /**
     * 实验性功能暂不开放
     * 数组类ICU
     */
    private tl;
    exists(key: L10nKey): boolean;
    get currentLanguage(): Intl.BCP47LanguageTag;
    get languages(): readonly Intl.BCP47LanguageTag[];
    direction(language?: Intl.BCP47LanguageTag): TextInfoDirection;
    on(event: L10nListenEvent, callback: (...args: any[]) => void): void;
    off(event: L10nListenEvent, callback: (...args: any[]) => void): void;
    getResourceBundle(language: string): ResourceData | undefined;
}
declare const l10n: L10nManager;
export default l10n;
