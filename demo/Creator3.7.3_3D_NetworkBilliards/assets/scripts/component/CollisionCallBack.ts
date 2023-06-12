
import { _decorator, Component, Node, PhysicsSystem, Collider, ITriggerEvent, tween, MeshRenderer, Vec3, Vec4, RigidBody, game, director, isValid, Enum } from 'cc';
const { ccclass, property } = _decorator;
import GEnum from '../config/GEnum';
import GConst from '../config/GConst';
@ccclass('CollisionCallBack')
export class CollisionCallBack extends Component {

    //#region 组件第一次激活前执行，也就是第一次执行 update 之前触发
    start () {
        this.initCollisionListener();
    }
    //#endregion

    //#region 初始化碰撞发生的监听
    initCollisionListener () {
        this.getComponent(Collider).on("onTriggerEnter", this.onTriggerEnter);
    }
    //#endregion

    //#region 碰撞发生时执行的回调
    onTriggerEnter (triggerEvent: ITriggerEvent) {
        // console.log(triggerEvent.otherCollider.node.name)
        // console.log(triggerEvent.otherCollider.getGroup())
        if (triggerEvent.otherCollider.getGroup() === GEnum.ColliderGroup.BALL) {
            var ballCollider = triggerEvent.otherCollider;
            if (ballCollider.node.name === GConst.hitBallNodeName) {
                ballCollider.node.setScale(Vec3.ZERO);
            } else {
                ballCollider.node.destroy();
            }
        }
    }
    #endregion
}