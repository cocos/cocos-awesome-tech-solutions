import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Animated')
export class Animated extends Component {
    @property
    y = 300

    @property
    time = 1

    @property
    delay = 0

    start () {
        // Your initialization goes here.

        let eulerAngle = new Vec3(0, 0, 0)
        tween(this.node)
            .delay(this.delay)
            .to(this.time, { position: new Vec3(this.node.position.x, this.y, 0), scale: Vec3.ONE })
            .by(this.time, { eulerAngles: new Vec3(0, 0, 720), scale: Vec3.ZERO})
            .to(this.time, { position: new Vec3(this.node.position), scale: Vec3.ZERO })
            .union()
            .repeatForever()
            .start()
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
