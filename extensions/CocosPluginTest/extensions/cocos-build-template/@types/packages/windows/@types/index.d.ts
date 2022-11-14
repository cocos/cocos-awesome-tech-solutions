/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';

import { IInternalBuildOptions, InternalBuildResult } from '@editor/library-type/packages/builder/@types/protect';
import { IOptions as INativeOption } from '@editor/library-type/packages/native';

export type IOrientation = 'landscape' | 'portrait';

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'windows': IOptions;
        native: INativeOption;
    }
}

export interface IOptions {
    renderBackEnd: {
        vulkan: boolean;
        gles3: boolean;
        gles2: boolean;
    };
    targetPlatform: 'win32' | 'x64';
    serverMode: boolean;
    targetPlatform: 'x64';
}

export interface IBuildResult extends InternalBuildResult {
    userFrameWorks: boolean; // 是否使用用户的配置数据
}
