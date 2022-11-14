/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';
export * from '../../../@types/editor';

import { IInternalBuildOptions } from '@editor/library-type/packages/builder/@types/protect';

export type IOrientation = 'auto' | 'landscape' | 'portrait';

export interface IOptions {
    appid: string;
    buildOpenDataContextTemplate: boolean;
    orientation: IOrientation;
    separateEngine: boolean;
    wasm: 'js' | 'wasm' | boolean;
    enabelWebGL2: 'off' | 'sameAsProjectSetting';
}

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        wechatgame: IOptions;
    };
}

// TODO 需要更新 editor 接口定义
export type IModules = Record<string, IModuleItem>;

export interface IFlagBaseItem {
    /**
     * Display text.
     */
    label: string;

    /**
     * Description.
     */
    description?: string;

    native?: string;

    wechatPlugin?: boolean;

    default?: string[];
}
export interface IBaseItem {
    /**
     * Display text.
     */
    label: string;

    /**
     * Description.
     */
    description?: string;

    required?: boolean;

    native?: string;

    wechatPlugin?: boolean;
}

export interface IModuleItem extends IBaseItem {
    /**
     * Display text.
     */
    label: string;

    /**
     * Description.
     */
    description?: string;

    /**
     * Whether if the feature of options allow multiple selection.
     */
    multi?: boolean;

    /**
     * If have default it will checked
     */
    default?: string[];

    options?: Record<string, IBaseItem>;

    category?: string;

    flags?: Record<string, IFlagBaseItem>;
}

export interface IDisplayModuleItem extends IModuleItem {
    _value: boolean;
    _option?: string;
    options?: Record<string, IDisplayModuleItem>;
}

export interface IDisplayModuleCache {
    _value: boolean;
    _option?: string;
    flags?: Record<string, boolean>;
}
