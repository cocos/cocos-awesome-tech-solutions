
import { _decorator, Component, Node, Label } from 'cc';
import { homePanel } from './homePanel';
import { utils } from './utils';
const { ccclass, property } = _decorator;

@ccclass('effectPanel')
export class effectPanel extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property(Node)
    effects : Node = null;

    @property(Label)
    labName : Label = null;

    @property(homePanel)
    hp : homePanel = null;

    currentIndex = 0;

    start () {
        this.reset();
    }

    show(index)
    {
        this.currentIndex = index;
        this.reset();
    }

    reset()
    {
        for (let i =0; i< this.effects.children.length; i++)
        {
            this.effects.children[i].active = false;
        }
        this.effects.children[this.currentIndex].active = true;

        this.labName.string = utils.getEffectName(this.currentIndex);
    }

    onClickPrev(){
        this.currentIndex--;
        if (this.currentIndex < 0)
            this.currentIndex = this.effects.children.length - 1;

        this.reset();
    }

    onClickNext()
    {
        this.currentIndex++;
        if (this.currentIndex >= this.effects.children.length)
            this.currentIndex = 0;

        this.reset();
    }

    onClickHome()
    {
        this.hp.node.active = true;
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
