/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';
import { IInternalBuildOptions } from '@editor/library-type/packages/builder/@types/protect';

export type IOrientation = 'landscape' | 'portrait';

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'vivo-mini-game': IOptions;
    }
}

export interface IOptions {
    package: string;
    icon: string;
    versionName: string;
    versionCode: string;
    minPlatformVersion: string;
    deviceOrientation: IOrientation;
    useDebugKey: boolean;
    privatePemPath: string;
    certificatePemPath: string;
    logLevel: string;
    separateEngine: boolean;
}

export interface ICompileOptions {
    name: string;
    useDebugKey: boolean;
}
