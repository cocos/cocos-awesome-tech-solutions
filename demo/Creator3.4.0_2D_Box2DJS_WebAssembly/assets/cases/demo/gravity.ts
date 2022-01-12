import { _decorator, Component, Node, RigidBody2D, PhysicsSystem2D, Vec2, Collider2D, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Gravity')
export class Gravity extends Component {
    // use this for initialization

    collider: Collider2D;
    bodies: RigidBody2D[];
    originGravity = new Vec2;

    onEnable () {
        this.bodies = [];
        this.collider = this.getComponent(Collider2D);
        this.originGravity.set(PhysicsSystem2D.instance.gravity);
        PhysicsSystem2D.instance.gravity = Vec2.ZERO;

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
 
    onDisable () {
        PhysicsSystem2D.instance.gravity = this.originGravity;
    }
 
    onBeginContact (selfCollider, otherCollider, contact) {
        this.bodies.push(otherCollider.body);
    }
 
    onEndContact (selfCollider, otherCollider, contact) {
        let index = this.bodies.indexOf(otherCollider.body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
        }
    }
    
    // called every frame, uncomment this function to activate update callback
    update (dt) {
        if (!this.collider) {
            return;
        }
 
        let bodies = this.bodies;
        for (let i = 0; i < bodies.length; i++) {
            this._applyForce(bodies[i]);
        }
    }
 
    _applyForce (body: RigidBody2D) {
    }
}
