import { _decorator, Component, Node, Vec2, Collider2D, Contact2DType, Vec3, PhysicsSystem2D, PHYSICS_2D_PTM_RATIO } from 'cc';
const { ccclass, property } = _decorator;

let pointVelPlatform = new Vec2;
let pointVelOther = new Vec2;
let relativeVel = new Vec2;
let relativePoint = new Vec2;

@ccclass('OneWayPlatform')
export class OneWayPlatform extends Component {

    start () {
        // Your initialization goes here.
        let collider = this.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact) {
        let otherBody = otherCollider.body;
        let platformBody = selfCollider.body;

        let worldManifold = contact.getWorldManifold();
        let points = worldManifold.points;

        //check if contact points are moving into platform
        for (let i = 0; i < points.length; i++) {
            platformBody.getLinearVelocityFromWorldPoint(points[i], pointVelPlatform);
            otherBody.getLinearVelocityFromWorldPoint(points[i], pointVelOther);
            platformBody.getLocalVector(pointVelOther.subtract(pointVelPlatform), relativeVel);

            if (relativeVel.y < -1 * PHYSICS_2D_PTM_RATIO) //if moving down faster than PHYSICS_2D_PTM_RATIO pixel/s (1m/s), handle as before
                return;  //point is moving into platform, leave contact solid and exit
            else if (relativeVel.y < 1 * PHYSICS_2D_PTM_RATIO) { //if moving slower than PHYSICS_2D_PTM_RATIO pixel/s (1m/s)
                //borderline case, moving only slightly out of platform
                platformBody.getLocalPoint(points[i], relativePoint);
                let platformFaceY = selfCollider.worldAABB.height / 2;  //front of platform, should only used on a box collider
                if (relativePoint.y > platformFaceY - 0.1 * PHYSICS_2D_PTM_RATIO)
                    return;  //contact point is less than 3.2pixel (10cm) inside front face of platfrom
            }
            else {
                //moving up faster than 1 m/s
            }
        }

        // store disabled state to contact
        contact.disabled = true;
    }
}
