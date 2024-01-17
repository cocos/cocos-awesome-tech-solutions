// @ts-ignore
import packageJSON from '../package.json';
import { ExecuteSceneScriptMethodOptions } from '../@types/packages/scene/@types/public';
import { extname, join } from 'path';
import { request } from 'http';
const Fs = require('fs');
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
    async queryAsset () {
        const info = await Editor.Message.request("asset-db", "query-assets", {
            pattern: "db://assets/spineRaptor/**",
            ccType: "sp.SkeletonData",
            // extname: "",
            // importer: "",
            // isBundle: ""
        });
        console.warn(info);
    },
    selectNode () {
        var lastSelectedNodeUUID = Editor.Selection.getLastSelected("node");
        if (lastSelectedNodeUUID.length > 0) {
            Editor.Selection.unselect("node",lastSelectedNodeUUID);
        }
        Editor.Selection.select("node", "24lnHBK1BLEqnU8Kyw5GD4");
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
    },
    async createPrefab (assetUUID) {
        var defaultPrefabInfo = await Editor.Message.request("asset-db", "query-asset-info", assetUUID);
       if (defaultPrefabInfo?.importer === "gltf" || defaultPrefabInfo?.importer === "fbx") {
            if (defaultPrefabInfo) {
                for (var value in defaultPrefabInfo.subAssets) {
                    if (defaultPrefabInfo.subAssets[value].type === "cc.Prefab") {
                        var prefabInfo = defaultPrefabInfo.subAssets[value];
                        var jsonUrl = prefabInfo.library[".json"];
                        const sourceCode = Fs.readFileSync(jsonUrl, 'utf8');
                        const info = await Editor.Message.request("asset-db", "create-asset", `db://assets/${defaultPrefabInfo.name}.prefab`, sourceCode, {overwrite: false, rename: true});
                        await Editor.Message.request("asset-db", "open-asset", info!.uuid);
                    }
                }
            }
       }
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
