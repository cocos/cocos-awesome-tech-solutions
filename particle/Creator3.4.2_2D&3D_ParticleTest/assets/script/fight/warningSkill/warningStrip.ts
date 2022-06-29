import { poolManager } from './../../framework/poolManager';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WarningStrip')
export class WarningStrip extends Component {
    private _scriptParent: any = null!;
    
    start () {
        // [3]
    }

    public init (scale: number, scriptParent: any) {
        scriptParent.recycleWarning();
        this._scriptParent = scriptParent;
        this.node.setWorldPosition(scriptParent.node.worldPosition.x, 2.5, scriptParent.node.worldPosition.z);
        this.node.forward = scriptParent.attackForward;
        this.node.setScale(1, 1, scale);
        
        this.showWarning();
    }


    public showWarning () {
            
    }

    public hideWarning () {
        poolManager.instance.putNode(this.node);
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
