/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';

import { IInternalBuildOptions, InternalBuildResult } from '@editor/library-type/packages/builder/@types/protect';

export type IOrientation = 'landscape' | 'portrait';

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'ios': IOptions;
        native: {
            JobSystem: 'none' | 'tbb' | 'taskFlow';
        };
    }
}

export interface IBuildResult extends InternalBuildResult {
    userFrameWorks: boolean; // 是否使用用户的配置数据
}

export interface IOptions {
    packageName: string;
    orientation: {
        landscapeRight: boolean;
        landscapeLeft: boolean;
        portrait: boolean;
        upsideDown: boolean;
    },
    skipUpdateXcodeProject: boolean;
    renderBackEnd: {
        metal: boolean;
        gles3: boolean;
        gles2: boolean;
    },
    osTarget: {
        iphoneos: boolean,
        simulator: boolean,
    },
    developerTeam?: string,
    targetVersion: string,
}
