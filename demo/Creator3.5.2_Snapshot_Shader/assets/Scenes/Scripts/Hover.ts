import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Hover')
export class Hover extends Component {
    @property(Vec3)
    hoverVector: Vec3 = new Vec3();

    @property(Node)
    hoverTransform:Node = null;

    startPos: Vec3 = new Vec3();

    start() {
        this.startPos = this.hoverTransform.position.clone();
    }

    update(dt: number) {
        this.hoverTransform.position = this.startPos.add(this.hoverVector.multiplyScalar(Math.sin((new Date()).getTime())));
    }
}

