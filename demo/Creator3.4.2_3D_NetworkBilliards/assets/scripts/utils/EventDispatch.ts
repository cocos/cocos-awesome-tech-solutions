 import { _decorator, Component, Node } from 'cc';
 const { ccclass, property } = _decorator;

 @ccclass
export default class EventDispatch {

    private static _instance : EventDispatch;

    public static instance(){
        if (null == EventDispatch._instance) {
            EventDispatch._instance = new EventDispatch();
        }
        return EventDispatch._instance;
    }

    constructor() {
        this.regists = {};
    }

    regists:{};
    
    on(eventName,callFun,object){
        // console.log("on  "+eventName);
        if ( undefined === this.regists[eventName] ) {
            this.regists[eventName ] = [];
        }
        this.regists[eventName].push([callFun,object]);
    }

    emit(eventName,param = null) {
        if ( undefined !== this.regists[eventName]) {
            let methodLs = this.regists[eventName];
            methodLs.forEach(element => {
                element[0].call(element[1],param);
            });
        }
    }

    off(eventName,object){
        if ( undefined !== this.regists[eventName]  ) {
            if (undefined === object) {
                this.regists[eventName].splice(0,this.regists[eventName].length);
            } else {
                let methodLs = this.regists[eventName];
                methodLs.forEach( (element, index ) => {
                    if (element[1] == object){
                        methodLs.splice(index,1);
                        // console.log("off "+eventName);
                        return;
                    }
                });
            }
        }
    }

    clear(eventName,callFun,object){
        this.regists = {};
    }

}

