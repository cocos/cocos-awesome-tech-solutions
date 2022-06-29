
import { _decorator, Component, Node, ScrollView, instantiate, Label } from 'cc';
import { effectPanel } from './effectPanel';
import { utils } from './utils';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = homePanel
 * DateTime = Fri Jun 24 2022 16:53:55 GMT+0800 (中国标准时间)
 * Author = linruimin
 * FileBasename = homePanel.ts
 * FileBasenameNoExtension = homePanel
 * URL = db://assets/homePanel.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('homePanel')
export class homePanel extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property(ScrollView)
    scrollView : ScrollView = null;

    @property(Node)
    item : Node = null;

    @property(effectPanel)
    ep : effectPanel = null;

    start () {
        for (let i = 0; i < utils.effectNames.length; i++)
        {
            let clonedItem = instantiate(this.item);
            clonedItem.active = true;
            let label = clonedItem.getChildByName("Label").getComponent(Label);
            label.string = utils.getEffectName(i);
            clonedItem.name = i+"";
            clonedItem.on(Node.EventType.MOUSE_UP, (event)=>{
                this.ep.show(i);
                this.node.active = false;
            }, this);
            this.scrollView.content.addChild(clonedItem);
        }
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
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
