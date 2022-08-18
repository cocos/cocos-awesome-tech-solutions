import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Rotate')
export class Rotate extends Component {
    @property(Vec3)
    eulerAngles: Vec3 = new Vec3();

    @property(Node)
    rotationTransform:Node = null;

    update(deltaTime: number) {        
        this.rotationTransform.setRotationFromEuler(this.eulerAngles.add3f(0.1, 0.1, 0.1));
    }
}

