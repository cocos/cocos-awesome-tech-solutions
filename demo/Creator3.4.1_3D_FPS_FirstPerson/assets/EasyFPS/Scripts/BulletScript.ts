
import { _decorator, Component, Node, Prefab, Mask, PhysicsSystem, geometry, instantiate, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletScript')
export class BulletScript extends Component {
    public maxDistance: number = 1000000;
    public floatInfrontOfWall: number = 1;
    @property(Prefab)
    public decalHitWall: Prefab = null!;
    @property(Prefab)
    public bloodEffect: Prefab = null!;

    start() {
        let wpos = this.node.getWorldPosition();
        let forward = this.node.forward.clone();
        let ray = new geometry.Ray(wpos.x, wpos.y, wpos.z, forward.x, forward.y, forward.z);

        let isHit = PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, this.maxDistance, true);
        if (isHit) {
            let result = PhysicsSystem.instance.raycastClosestResult;

            let quat = new Quat;
            Quat.fromViewUp(quat, new Vec3(result.hitNormal.x, result.hitNormal.y, result.hitNormal.z), new Vec3(0, 1, 0));

            if (result.collider.node.name.indexOf('Wall') >= 0) {
                let effect = instantiate(this.decalHitWall);
                effect.setWorldPosition(result.hitPoint.add(result.hitNormal.clone().multiplyScalar(this.floatInfrontOfWall)));
                effect.setWorldRotation(quat);
                effect.parent = this.node.parent;
            }
            else if (result.collider.node.name.indexOf('Enemies') >= 0){
                let effect = instantiate(this.bloodEffect);
                effect.setWorldPosition(result.hitPoint.add(result.hitNormal.clone().multiplyScalar(this.floatInfrontOfWall)));
                effect.setWorldRotation(quat);
                effect.parent = this.node.parent;
            }
        }

        this.node.destroy();
    }

}
