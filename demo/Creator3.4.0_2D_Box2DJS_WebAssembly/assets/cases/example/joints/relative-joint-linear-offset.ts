import { _decorator, Component, Node, RelativeJoint2D, tween, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RelativeJointLinearOffset')
export class RelativeJointLinearOffset extends Component {
    @property
    time = 0.5

    @property
    yOffset = 100

    start () {
        // Your initialization goes here.
        let relativeJoint = this.getComponent(RelativeJoint2D);
        tween(relativeJoint)
            .to(this.time, { linearOffset: new Vec2(0, this.yOffset) })
            .to(this.time, { linearOffset: new Vec2(0, 0) })
            .union()
            .repeatForever()
            .start()
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
