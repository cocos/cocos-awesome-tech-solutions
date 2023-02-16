import { _decorator, Node, geometry, Vec3, PhysicsSystem } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FOWUtils')
export class FOWUtils {
    public static IsObstacle (beginx: number, beginy: number, heightRange: number, direction: Vec3, x: number, y: number) {
        var px = beginx + x;
        var py = beginy + y;
        var ray = new geometry.Ray(px, beginy + heightRange, py, direction.x, direction.y, direction.z);
        var isHit = PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, heightRange, true);
        if (isHit) {
            // console.log("is Hit");
            return true;
        } else {
            // console.log("is Not Hit");
            return false;
        }
    }
}