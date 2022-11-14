import type { WebviewTag } from 'electron';
import ISceneFacade from './scene-facade-interface';
/**
 * 这个是 engine-view 标签的接口
 */
export interface EngineView {
    dirty: boolean;
    managerReady: boolean;

    $scene: WebviewTag;
    depend: any;
    $floatWindow: any;

    // 封装的 webview 通讯模块
    ipc: any;

    info: any;

    /**
     * 初始化
     */
    init(): Promise<any>;

    /**
     * 调用场景进程里的方法
     * @param methodName 
     * @param params 
     * @param forced 
     * @param timeout 
     */

    callSceneMethod<T extends keyof ISceneFacade>(methodName: T, params: Parameters<ISceneFacade[T]>, forced?: boolean, timeout?: boolean): Promise<ReturnType<typeof ISceneFacade[T]>>

    /**
     * 执行组件方法
     * @param options
     */
    executeComponentMethod(options: { uuid: string, index: number, methodNames: string[] });

    //////////////

    attachFloatWindow(name: string, options: FloatWindowOptions)

    detachFloatWindow(name: string)

    attachToolbar(name: string, options: any)

    detachToolbar(name: string)

    attachInfobar(name: string, options: any)

    detachInfobar(name: string)
}
export interface FloatWindowOptions {
    type: string;
    width: number;
    height: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;

    dock?: boolean;

    mode?: 'dock' | 'simple';

    template: string;
    ready?: ($window: HTMLDivElement, info: ScenePluginInfo, componentMap: { [type: string]: ScenePluginComponentInfo[] }) => void;
    close?: Function;
    update?: Function;
    send?: Function;
}
