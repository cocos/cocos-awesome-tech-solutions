/// <reference path='../../../@types/index'/>

export * from '@editor/library-type/packages/builder/@types/protect';

import { IInternalBuildOptions } from '@editor/library-type/packages/builder/@types/protect';

export type IOrientation = 'auto' | 'landscape' | 'portrait';

export interface IOptions {
    appid: string;
    buildOpenDataContextTemplate: boolean;
    orientation: IOrientation;
    physX: {
        use: 'physX' | 'project';
        notPackPhysXLibs: boolean;
        mutiThread: boolean;
        subThreadCount: number;
        epsilon: number;
    };
}

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'bytedance-mini-game': IOptions;
    };
}
