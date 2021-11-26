import { _decorator, Component, Node, RigidBody } from 'cc';
import { BuoyancyManager } from './buoyancy-manager';
import { BuoyancyPoint } from './buoyancy-point';
const { ccclass, property } = _decorator;

@ccclass('BuoyancyObject')
export class BuoyancyObject extends Component {
    @property
    density = 0.75;

    @property
    dragInWater = 1;

    @property
    angularDragInWater = 1;

    points: BuoyancyPoint[] = [];
    body: RigidBody | null = null;

    initDrag = 0;
    initAngularDrag = 0;

    onEnable () {
        if (BuoyancyManager.instance) {
            BuoyancyManager.instance.addObject(this);
        }

        this.points = this.getComponentsInChildren(BuoyancyPoint);
        this.body = this.getComponent(RigidBody);

        if (this.body) {
            this.initDrag = this.body.linearDamping;
            this.initAngularDrag = this.body.angularDamping;
        }
    }

    onDisable () {
        if (BuoyancyManager.instance) {
            BuoyancyManager.instance.removeObject(this);
        }
    }

}
