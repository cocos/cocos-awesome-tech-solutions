/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';

import { appTemplateData, IInternalBuildOptions, IPolyFills } from '@editor/library-type/packages/builder/@types/protect';

export interface IOptions {
    useWebGPU: boolean;
    resolution: {
        designHeight: number;
        designWidth: number;
    };
}
export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'web-desktop': IOptions;
    };
    appTemplateData: appTemplateData;
}
