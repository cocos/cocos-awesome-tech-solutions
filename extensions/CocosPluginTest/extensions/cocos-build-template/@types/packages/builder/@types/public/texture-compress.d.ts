export type ITextureCompressType =
    | 'jpg'
    | 'png'
    | 'webp'
    | 'pvrtc_4bits_rgb'
    | 'pvrtc_4bits_rgba'
    | 'pvrtc_4bits_rgb_a'
    | 'pvrtc_2bits_rgb'
    | 'pvrtc_2bits_rgba'
    | 'pvrtc_2bits_rgb_a'
    | 'etc1_rgb'
    | 'etc1_rgb_a'
    | 'etc2_rgb'
    | 'etc2_rgba'
    | 'astc_4x4'
    | 'astc_5x5'
    | 'astc_6x6'
    | 'astc_8x8'
    | 'astc_10x5'
    | 'astc_10x10'
    | 'astc_12x12'
    | string;
export type ITextureCompressPlatform = 'miniGame' | 'web' | 'ios' | 'android';

export interface IHandlerInfo {
    type: 'program' | 'npm' | 'function';
    info: ICommandInfo | Function;
    func?: Function;
}

export interface ICustomConfig {
    id: string;
    name: string;
    path: string;
    command: string;
    format: string;
    overwrite?: boolean;
}

export interface ICommandInfo {
    command: string;
    params?: string[];
    path: string;
}

export interface ITextureFormatInfo {
    displayName: string;
    value: ITextureCompressType | string;
    formatSuffix?: string;
    alpha?: boolean;
    formatType?: string;
    handler?: IHandlerInfo;
    custom?: boolean;
    params?: string[];
}
export interface ISupportFormat {
    rgb: ITextureCompressType[];
    rgba: ITextureCompressType[];
}
export interface IConfigGroupsInfo {
    defaultSupport?: ISupportFormat,
    support: ISupportFormat,
    displayName: string;
    icon: string;
}
export type IConfigGroups = Record<ITextureCompressPlatform, IConfigGroupsInfo>;

export type IPVRQuality = 'fastest' | 'fast' | 'normal' | 'high' | 'best';
export type IETCQuality = 'slow' | 'fast';
export type IASTCQuality = 'veryfast' | 'fast' | 'medium' | 'thorough' | 'exhaustive';
