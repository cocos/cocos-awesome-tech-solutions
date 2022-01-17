
import { _decorator, Component, Node, EditBox, Label } from 'cc';
import { JSB } from 'cc/env';
const { ccclass, property } = _decorator;

/**
 *  登录 -> 实名认证 -> 获取实名认证结果 
 *  实名认证过期 -> 重新实名认证       
 */
@ccclass('NewComponent')
export class NewComponent extends Component {
    @property(EditBox)
    nameEditbox: EditBox = null!;
    @property(EditBox)
    certiEditbox: EditBox = null!;
    @property(Label)
    messageLabel: Label = null!;

    websocket:any= null;

    /**
     * 根据防沉迷系统预设数据
     * 当 ai 为 100000000000000001 - 100000000000000008 且 name 和 idNum 正确的情况下
     * 系统会返回实名认证结果  认证成功
     * 当 ai 为 200000000000000001 - 200000000000000008 且 name 和 idNum 正确的情况下
     * 系统会返回实名认证结果  认证中
     * 其他情况 
     * 系统会返回实名认证结果  认证失败
     */
    ai: string = "100000000000000001"; // 测试数据
    
    pi: string = "1fffbjzos82bs9cnyj1dna7d6d29zg4esnh99u"; // 测试数据

    start () {
        let self = this;
        // 判断当前浏览器是否支持WebSocket
        if ('WebSocket' in window) {
            // 这边请填写本地的ip地址
            self.websocket = new WebSocket("ws://192.168.54.125:8080/");
        }

        // 连接发生错误的回调方法
        self.websocket.onerror = function () {
            console.log("WebSocket连接发生错误");
            self.messageLabel.string = "WebSocket连接发生错误";
        };

        // 连接成功建立的回调方法
        self.websocket.onopen = function () {
            console.log("WebSocket连接成功");
            self.messageLabel.string = "WebSocket连接成功";
        }

        // 接收到消息的回调方法
        self.websocket.onmessage = function (event: any) {

            console.log(event, 'onmessage');
            self.messageLabel.string = event.data;
            // console.log(event.data.errmsg)
            self.messageLabel.string = JSON.parse(event.data).errmsg;
        }

        // 连接关闭的回调方法
        self.websocket.onclose = function () {
            console.log("WebSocket连接关闭");
            self.messageLabel.string = "WebSocket连接关闭";

        }

        // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = function () {
            self.websocket.close();
        }

    }
    //关闭WebSocket连接
    closeWebSocket () {
        this.websocket.close();
    }

    loginTest() {
        let obj = {
            'eventType': '1001',
            'playId': this.ai
        }
        this.send(JSON.stringify(obj));
    }

    Certiget () {
        let obj = {
            'eventType': '1002',
            'idCard': this.certiEditbox.string, 
            'name': this.nameEditbox.string,
            'playId': this.ai
        }
        this.send(JSON.stringify(obj));
    }

    ResultTest() {
        let obj = {
            'eventType': '1003',
            'idCard': this.certiEditbox.string, 
            'name': this.nameEditbox.string,
            'playId': this.ai
        }
        this.send(JSON.stringify(obj));
    }

    DataSubmission () {
        let obj = {
            'eventType': '1004',
            'idCard': this.certiEditbox.string, 
            'name': this.nameEditbox.string,
            'playId': this.pi
        }
        this.send(JSON.stringify(obj));
    }

    //发送消息
    send(event: any) {
        this.websocket.send(event);
    }
    
    /**
       * get请求
       * @param {string} url 
       * @param {function} callback 
       */
    httpGet(url: any, callback: any) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            // cc.log("Get: readyState:" + xhr.readyState + " status:" + xhr.status);
            if (xhr.readyState === 4 && xhr.status == 200) {
                let respone = xhr.responseText;
                let rsp = JSON.parse(respone);
                callback(rsp);
            } else if (xhr.readyState === 4 && xhr.status == 401) {
                callback({ status: 401 });
            } else {
                callback(xhr)
            }
        };
        xhr.withCredentials = true;
        xhr.open('GET', url + "?ai=test", true);

        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.setRequestHeader("appId", "appId");
        xhr.setRequestHeader("bizId", "bizId");
        xhr.setRequestHeader("timestamps", "1639039065203");
        xhr.setRequestHeader("sign", "sign");


        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 8000;// 8 seconds for timeout

        xhr.send();
    }

    checkCerti() {
        let name = this.nameEditbox.string;
        let IDNumber = this.certiEditbox.string;
        if (JSB) {
            jsb.reflection.callStaticMethod("com/cocos/game/AppActivity", "checkCerti", "(Ljava/lang/String;Ljava/lang/String;)V", name + "", IDNumber + "");
        }
    }

    seekCerti() {
        let name = this.nameEditbox.string;
        let IDNumber = this.certiEditbox.string;
        if (JSB) {
            jsb.reflection.callStaticMethod("com/cocos/game/AppActivity", "seekCerti", "(Ljava/lang/String;Ljava/lang/String;)V", name + "", IDNumber + "");
        }
    }

    confirmCerti() {
        let name = this.nameEditbox.string;
        let IDNumber = this.certiEditbox.string;
        if (JSB) {
            jsb.reflection.callStaticMethod("com/cocos/game/AppActivity", "confirmCerti", "(Ljava/lang/String;Ljava/lang/String;)V", name + "", IDNumber + "");
        }
    }

    showMessage(str: string) {
        this.messageLabel.string = str;
    }
}