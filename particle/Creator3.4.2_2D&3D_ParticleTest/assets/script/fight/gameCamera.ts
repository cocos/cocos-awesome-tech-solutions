import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameManager } from './gameManager';
const { ccclass, property } = _decorator;
@ccclass('GameCamera')
export class GameCamera extends Component {

    public ndFollowTarget: Node = null!;//相机跟随的目标节点

    private _oriCameraWorPos: Vec3 = new Vec3();//初始相机世界坐标
    private _targetCameraWorPos: Vec3 = new Vec3();//目标相机世界坐标
    private _curCameraWorPos: Vec3 = new Vec3();//目标相机世界坐标

    start () {
        this._oriCameraWorPos = this.node.worldPosition.clone();
    }

    public resetCamera () {
        this._targetCameraWorPos.set(this._oriCameraWorPos);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    lateUpdate () {
        if (!this.ndFollowTarget || !this.ndFollowTarget.worldPosition || !this.ndFollowTarget.active) {
            return;
        }

        this._targetCameraWorPos = this._targetCameraWorPos.lerp(this.ndFollowTarget.worldPosition, 0.5);
        this._curCameraWorPos.set(this._oriCameraWorPos.x + this._targetCameraWorPos.x, this._oriCameraWorPos.y, this._oriCameraWorPos.z + this._targetCameraWorPos.z);
        this.node.setWorldPosition(this._curCameraWorPos);
    }
}