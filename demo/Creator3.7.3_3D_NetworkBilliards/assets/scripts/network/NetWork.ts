import GEvent from "../config/GEvent";
import GCmd from "../config/GCmd";

import { _decorator, Component, Node, Asset } from 'cc';
import EventDispatch from "../utils/EventDispatch";
const { ccclass, property } = _decorator;

@ccclass
export default class NetWork {
    // websocket 连接地址
    // public static wssLink: string = "ws://192.168.50.79:8002";
    // public static wssLink: string = "ws://172.16.68.160:8002";
    public static wssLink: string = "ws://192.168.52.170:8002";
    // public static wssLink: string = "ws://172.16.68.135:8002";

    public static _wsiSendBinary: WebSocket;

    public static initNetWorkListen = function (wsObj: WebSocket) {

        wsObj.onmessage = function (event) {
            var msgObj = JSON.parse(event.data);
            if (msgObj.data) {
                var _data = JSON.parse(msgObj.data)
            }
            // console.log(`s2c: ${msgObj.command}`, _data);

            switch (msgObj.command) {
                case GCmd.S2C.USER_LOGIN_SUCCESS:
                    EventDispatch.inst.emit(GEvent.USER_LOGIN_SUCCESS, _data);
                    break;
                case GCmd.S2C.USER_LOGIN_FAIL:
                    EventDispatch.inst.emit(GEvent.USER_LOGIN_FAIL);
                    break;
                case GCmd.S2C.HIT_BALL_SYNC:
                    EventDispatch.inst.emit(GEvent.HIT_BALL_SYNC, _data);
                    break;
                case GCmd.S2C.HIT_BALL_COMPLETE_SYNC:
                    EventDispatch.inst.emit(GEvent.HIT_BALL_COMPLETE_SYNC, _data);
                    break;
                case GCmd.S2C.REQUEST_CUE_SYNC:
                    EventDispatch.inst.emit(GEvent.CUE_SYNC, _data)
            }
        }
    }

    public static connectToWsserver = function (cb?: Function) {
        this._wsiSendBinary = new WebSocket(this.wssLink, []);
        this.initNetWorkListen(this._wsiSendBinary);
        this._wsiSendBinary.onopen = function () {
            console.log("[Connection Server Succes]", true);
            if (cb instanceof Function) {
                cb();
            }
        };
    }

    public static sendDataToServer = function (target: any, command: string, data?: Object) {
        // console.log(`c2s: ${command} , ${data}`);

        var _serverObj = {
            "command": command,
            "data": JSON.stringify(data)
        }
        this._wsiSendBinary.send(JSON.stringify(_serverObj));
    }
}