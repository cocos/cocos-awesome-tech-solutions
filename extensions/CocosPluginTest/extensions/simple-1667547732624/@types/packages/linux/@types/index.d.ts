/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';
import { IInternalBuildOptions, InternalBuildResult } from '@editor/library-type/packages/builder/@types/protect';

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'linux': IOptions;
        native: any;
    }
}

interface IOptions {
    renderBackEnd: {
        metal: boolean;
        gles3: boolean;
        gles2: boolean;
    },
}
