
import { _decorator, Component, Node, Prefab, Mask, PhysicsSystem, geometry, instantiate, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DestroyAfterTimeParticle')
export class DestroyAfterTimeParticle extends Component {
    @property
	public timeToDestroy:number = 0.8;

    start() {
        this.scheduleOnce(()=>{
            this.node.destroy();
        }, this.timeToDestroy);
    }

}
