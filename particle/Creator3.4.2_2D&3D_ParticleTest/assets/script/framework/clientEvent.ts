import { _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("clientEvent")
export class clientEvent {
    private static _handlers: { [key: string]: any[] } = {};

    /**
     * 监听事件
     * @param {string} eventName 事件名称
     * @param {function} handler 监听函数
     * @param {object} target 监听目标
     */
    public static on (eventName: string, handler: Function, target: any) {
        var objHandler: {} = {handler: handler, target: target};
        var handlerList: Array<any> = clientEvent._handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            clientEvent._handlers[eventName] = handlerList;
        }

        for (var i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = objHandler;
                return i;
            }
        }

        handlerList.push(objHandler);

        return handlerList.length;
    };

    /**
     * 取消监听
     * @param {string} eventName 监听事件
     * @param {function} handler 监听函数
     * @param {object} target 监听目标
     */
    public static off (eventName: string, handler: Function, target: any) {
        var handlerList = clientEvent._handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (var i = 0; i < handlerList.length; i++) {
            var oldObj = handlerList[i];
            if (oldObj.handler === handler && (!target || target === oldObj.target)) {
                handlerList.splice(i, 1);
                break;
            }
        }
    };

    /**
     * 分发事件
     * @param {string} eventName 分发事件名
     * @param  {...any} params 分发事件参数
     */
    public static dispatchEvent (eventName: string, ...args: any) {
        var handlerList = clientEvent._handlers[eventName];

        var args1 = [];
        var i;
        for (i = 1; i < arguments.length; i++) {
            args1.push(arguments[i]);
        }

        if (!handlerList) {
            return;
        }

        for (i = 0; i < handlerList.length; i++) {
            var objHandler = handlerList[i];
            if (objHandler.handler) {
                objHandler.handler.apply(objHandler.target, args1);
            }
        }
    };
}
