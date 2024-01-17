"use strict";
// @ts-ignore
// @ts-ignore
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
/**
 * @en
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    rotateCamera() {
        const { director } = require('cc');
        var lastSelectedNodeUUID = Editor.Selection.getLastSelected("node");
        director.getScene().walk((target) => {
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
function load() { }
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
function unload() { }
exports.unload = unload;
