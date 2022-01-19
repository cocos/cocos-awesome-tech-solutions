import { Platform } from "../../../builder/@types/public";

export type IPreviewType = 'game-view' | 'simulator' | 'browser';

export type ISupportDataType = 'settings' | 'renderData';

export interface IHookConfig {
    methods: string;
    hook: string;
}
export interface IGenerateSettingsOptions {
    type: IPreviewType;
    startScene?: string;
    platform?: Platform;
}

export interface IPreviewPluginConfig {
    methods?: string;
    hooks?: Record<string, string>;
}

// 界面渲染配置
export interface IRenderData {
    title: string; // 预览页面 title
    enableDebugger: boolean; // 是否开启 vConsole
    config: { // 预览页面菜单栏配置
        device: string; // 设备名称
        // https://github.com/cocos-creator/engine/blob/3d/cocos/core/platform/debug.ts
        debugMode: string; // cc.DebugMode 枚举名称
        showFps: boolean;
        fps: number;
    }
}
