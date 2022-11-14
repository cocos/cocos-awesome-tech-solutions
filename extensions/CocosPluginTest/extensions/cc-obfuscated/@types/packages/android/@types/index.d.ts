/// <reference path='../../../@types/index'/>
export * from '@editor/library-type/packages/builder/@types/protect';

import { IInternalBuildOptions, InternalBuildResult } from '@editor/library-type/packages/builder/@types/protect';
import { IOptions as INativeOption } from '@editor/library-type/packages/native';

export type IOrientation = 'landscape' | 'portrait';

export interface ITaskOption extends IInternalBuildOptions {
    packages: {
        'android': IOptions;
        native: INativeOption;
    }
}

export type IAppABI = 'armeabi-v7a' | 'arm64-v8a' | 'x86' | 'x86_64';

export interface IOptions {
    packageName: string;
    orientation: {
        landscapeRight: boolean;
        landscapeLeft: boolean;
        portrait: boolean;
        upsideDown: boolean;
    },

    apiLevel: number;
    appABIs: IAppABI[];

    useDebugKeystore: boolean;
    keystorePath: string;
    keystorePassword: string;
    keystoreAlias: string;
    keystoreAliasPassword: string;

    appBundle: boolean;
    androidInstant: boolean;
    remoteUrl: string;
    sdkPath: string;
    ndkPath: string;

    swappy: boolean;

    renderBackEnd: {
        vulkan: boolean;
        gles3: boolean;
        gles2: boolean;
    }
}

export interface IBuildResult extends InternalBuildResult {
    userFrameWorks: boolean; // 是否使用用户的配置数据
}

export interface ICertificateSetting {
    country: string;
    state: string;
    locality: string;
    organizationalUnit: string;
    organization: string;
    email: string;
    certificatePath: string;

    password: string; // 密钥密码
    confirmPassword: string; // 确认密钥密码

    alias: string; // 密钥别名
    aliasPassword: string;
    confirmAliasPassword: string;

    validity: number; // 有效期
}
