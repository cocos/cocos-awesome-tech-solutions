
import { _decorator, Component, Node, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = NewComponent_001
 * DateTime = Thu Dec 23 2021 15:54:22 GMT+0800 (中国标准时间)
 * Author = zzf520
 * FileBasename = NewComponent-001.ts
 * FileBasenameNoExtension = NewComponent-001
 * URL = db://assets/NewComponent-001.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('NewComponent_001')
export class NewComponent_001 extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start () {
        this.node.on(Node.EventType.TOUCH_START, (event: EventTouch)=>{
            event.preventSwallow = true;
        })
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
