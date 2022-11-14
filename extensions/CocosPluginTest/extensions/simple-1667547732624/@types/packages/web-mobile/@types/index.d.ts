/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';

import { IInternalBuildOptions, IPolyFills, ISettings } from '@editor/library-type/packages/builder/@types/protect';

export type IOrientation = 'auto' | 'landscape' | 'portrait';
export interface IOptions {
    orientation: IOrientation;
    embedWebDebugger: boolean;
}
export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'web-mobile': IOptions;
    }
}
