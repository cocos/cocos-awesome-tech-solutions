import { _decorator, Component, Node, tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GravityAnims')
export class GravityAnims extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
        
        let angleStep = Math.PI * 2 / this.node.children.length;
        
        this.node.children.forEach((c, index) => {
            tween(c)
                .to(2, {
                    position: new Vec3(Math.cos(angleStep * index), Math.sin(angleStep * index), 0).multiplyScalar(150),
                    eulerAngles: new Vec3(0, 0, 720)
                })
                .delay(0.5)
                .to(2, {
                    position: Vec3.ZERO,
                    eulerAngles: new Vec3(0, 0, 0)
                })
                .union()
                .repeatForever()
                .start()
        })
    }

    update (deltaTime: number) {
        // Your update function goes here.
        var a = 1;
    }
}
