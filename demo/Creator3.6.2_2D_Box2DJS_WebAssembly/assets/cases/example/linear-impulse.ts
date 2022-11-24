import { _decorator, Component, Node, Vec2, RigidBody2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LinearImpulse')
export class LinearImpulse extends Component {
    @property
    impulse = new Vec2

    start () {
        // Your initialization goes here.
        let body = this.node.getComponent(RigidBody2D);
        if (!body) return;
 
        body.applyLinearImpulseToCenter(this.impulse)
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
