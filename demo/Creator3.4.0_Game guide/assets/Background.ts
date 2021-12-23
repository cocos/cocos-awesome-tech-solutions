
import { _decorator, Component, Node, EventTouch, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = NewComponent_002
 * DateTime = Thu Dec 23 2021 15:55:33 GMT+0800 (中国标准时间)
 * Author = zzf520
 * FileBasename = NewComponent-002.ts
 * FileBasenameNoExtension = NewComponent-002
 * URL = db://assets/NewComponent-002.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('NewComponent_002')
export class NewComponent_002 extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start () {
        this.node.on(Node.EventType.TOUCH_START, (event: EventTouch )=>{
            this.node.children[0].getComponent(Label).string = '已接受到上层传递的事件';

        })

        this.node.on(Node.EventType.TOUCH_END, (event: EventTouch )=>{
            this.node.children[0].getComponent(Label).string = '点击事件已结束';

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
