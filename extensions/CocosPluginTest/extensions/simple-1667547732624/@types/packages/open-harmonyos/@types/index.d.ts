
/// <reference path="../../../@types/index.d.ts"/>
/// <reference path="@editor/library-type/packages/builder/@types/protect/global.d.ts"/>

export * from '@editor/library-type/packages/builder/@types/protect';
import { IInternalBuildOptions, InternalBuildResult } from '@editor/library-type/packages/builder/@types/protect';
export type IOrientation = 'landscape' | 'portrait';

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'open-harmonyos': IOptions;
    }
}

export interface IOptions {
    packageName: string;
    orientation: {
        landscapeRight: boolean;
        landscapeLeft: boolean;
        portrait: boolean;
        upsideDown: boolean;
    },

    apiLevel: string;
    sdkPath: string;
    ndkPath: string;

    renderBackEnd: {
        // vulkan: boolean;
        gles3: boolean;
        // gles2: boolean;
    }
}

export interface IBuildResult extends InternalBuildResult {
    userFrameWorks: boolean; // 是否使用用户的配置数据
}
