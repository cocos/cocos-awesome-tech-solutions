// @ts-ignore
import packageJSON from '../package.json';
import { ExecuteSceneScriptMethodOptions } from '../@types/packages/scene/@types/public';
import { join } from 'path';
import { request } from 'http';
module.paths.push(join(Editor.App.path, 'node_modules'));

const options: ExecuteSceneScriptMethodOptions = {
    name: packageJSON.name,
    method: 'rotateCamera',
    args: []
}

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },
    log() {
        console.warn("Test Cocos");
    },
    async queryNode () {
        const info = await Editor.Message.request('scene', 'query-node', "7c3e7fab-7b1e-4865-ba84-3cf81b48b9fb");
        console.warn(info);
    },
    initData () {
        console.warn("The scene is already loaded");
    },
    async broadcast () {
        await Editor.Message.broadcast('simple-1667547732624:ready');
    },
    listenBroadcast (message) {
        if (message) {
            console.warn(message);
        } else {
            console.warn("The broadcast has been sent");
        }
    },
    sendByCode () {
        Editor.Message.send("simple-1667547732624", "simple-1667547732624:ready");
    },
    async callEngineAPI() {
        const result = await Editor.Message.request('scene', 'execute-scene-script', options);
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() { 
    console.warn("Hello Cocos");
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
    console.warn("goodBye Cocos");
}
