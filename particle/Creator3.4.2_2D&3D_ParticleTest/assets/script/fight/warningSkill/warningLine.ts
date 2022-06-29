import { GameManager } from './../gameManager';
import { _decorator, Component, Node, Vec3 } from 'cc';
import { poolManager } from '../../framework/poolManager';

const { ccclass, property } = _decorator;

@ccclass('WarningLine')
export class WarningLine extends Component {
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

    // update (deltaTime: number) {
    //     // [4]
    // }
}