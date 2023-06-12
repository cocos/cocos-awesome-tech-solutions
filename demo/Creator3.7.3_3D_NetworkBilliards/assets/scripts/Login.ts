
import { _decorator, Component, Node, EditBox, director } from 'cc';
import GCmd from './config/GCmd';
import { Main } from './Main';
import NetWork from './network/NetWork';
import EventDispatch from './utils/EventDispatch';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Index
 * DateTime = Tue Nov 29 2022 20:05:39 GMT+0800 (China Standard Time)
 * Author = mykylin
 * FileBasename = Index.ts
 * FileBasenameNoExtension = Index
 * URL = db://assets/scripts/Index.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
 function urlParse() {
    var params = {};
    if (window.location == null) {
        return params;
    }
    var name, value;
    var str = window.location.href; //取得整个地址栏
    var num = str.indexOf("?")
    str = str.substring(num + 1); //取得所有参数   stringvar.substr(start [, length ]

    var arr = str.split("&"); //各个参数放到数组里
    for (var i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            params[name] = value;
        }
    }
    return params;
}

@ccclass('Login')
export class Login extends Component {

    @property(EditBox)
    editAccount:EditBox;

    start () {
        // [3]
        let params = urlParse();
        if(params['userId']){
            this.editAccount.string = params['userId'];
        }

        EventDispatch.inst.on(GCmd.S2C.USER_LOGIN_SUCCESS,this.onLoginSuccess,this);
        EventDispatch.inst.on(GCmd.S2C.USER_LOGIN_SUCCESS,this.onLoginFailed,this);
    }

    onDestroy(){
        EventDispatch.inst.off(GCmd.S2C,this);
    }

    onBtnStartClicked(){
        let userId = this.editAccount.string;
        if(userId){
            NetWork.connectToWsserver(()=>{
                NetWork.sendDataToServer(null,GCmd.C2S.USER_LOGIN,{
                    userId:userId,
                });
            });
            Main.userId = userId;
        }
    }

    onLoginSuccess(data){
        console.log(data);
        Main.loginData = data;
        director.loadScene('gameplay');
    }

    onLoginFailed(){
        console.log('oops!');
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
