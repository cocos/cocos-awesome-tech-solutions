export declare type L10nKey = string;
export declare type L10nValue = string;
export interface ResourceList {
    defaultLanguage?: Intl.BCP47LanguageTag;
    fallbackLanguage?: Intl.BCP47LanguageTag;
    languages: Intl.BCP47LanguageTag[];
}
export interface ResourceBundle {
    [language: Intl.BCP47LanguageTag]: ResourceData;
}
export interface ResourceData {
    [namespace: string]: ResourceItem;
}
export interface ResourceItem {
    [key: string]: any;
}
export interface FallbackLanguageObjectList {
    [language: string]: readonly string[];
}
export declare type FallbackLanguage = string | readonly string[] | FallbackLanguageObjectList | ((language: Intl.BCP47LanguageTag) => string | readonly string[] | FallbackLanguageObjectList);
export interface L10nOptions {
    /**
     * Logs info level to console output. Helps finding issues with loading not working.
     * @default false
     */
    /**
     * Resources to initialize with (if not using loading or not appending using addResourceBundle)
     * @default undefined
     */
    resources?: ResourceBundle;
    /**
     * Language to use (overrides language detection)
     */
    language?: Intl.BCP47LanguageTag;
    /**
     * Language to use if translations in user language are not available.
     * @default same as language
     */
    fallbackLanguage?: false | FallbackLanguage;
    /**
     * @default IntlManager.LOCAL_STORAGE_LANGUAGE_KEY
     */
    localStorageLanguageKey?: string;
    /**
     * @zh
     * 可以对key进行前置处理，返回值应该是处理后的key
     *
     * @en
     * Preprocess the key
     *
     * @param key
     * @return string
     * onBeforeProcessHandler
     */
    beforeTranslate?: (key: L10nKey) => L10nValue;
    /**
     * @zh
     * 对value进行后置处理，返回值应该是处理后的value
     *
     * @en
     * Postprocess the value, return the processed value
     *
     * @param key
     * @param value
     * @return string
     */
    afterTranslate?: (key: string, value: string) => string;
    /**
     * Allows null values as valid translation
     * @default true
     */
    returnNull?: boolean;
    /**
     * Allows empty string as valid translation
     * @default true
     */
    returnEmptyString?: boolean;
}
