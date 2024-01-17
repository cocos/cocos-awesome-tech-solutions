// @ts-ignore
// @ts-ignore

import { join } from 'path';
module.paths.push(join(Editor.App.path, 'node_modules'));

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    rotateCamera () {
        const { director } = require('cc');

        var lastSelectedNodeUUID = Editor.Selection.getLastSelected("node");
        director.getScene().walk((target: any)=>{
            if (target.uuid == lastSelectedNodeUUID) {
                    var targetComp = target.getComponent("NewComponent");
                    if (targetComp) {
                        targetComp.test();
                    }
                return;
            }
        });

        let mainCamera = director.getScene().getChildByName("Main Camera");
        if (mainCamera) {
            let euler = mainCamera.eulerAngles;
            euler.y += 10;
            mainCamera.setRotationFromEuler(euler);
            return true;
        }
        return false;
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {}
