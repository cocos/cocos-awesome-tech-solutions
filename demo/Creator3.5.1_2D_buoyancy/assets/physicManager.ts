import { _decorator, Component, v2, Vec2, PhysicsSystem2D, EPhysics2DDrawFlags, Sprite, sp, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PhysicManager')
export class PhysicManager extends Component {
    @property
    public debug = true;
    @property
    public gravity = new Vec2(0, -20);

    onLoad () {
        const physicsManager = PhysicsSystem2D.instance;
        physicsManager.enable = true;
        physicsManager.physicsWorld.setGravity(this.gravity);
        if(this.debug){
           physicsManager.debugDrawFlags = EPhysics2DDrawFlags.Joint | EPhysics2DDrawFlags.Shape;
        }
    }

}

