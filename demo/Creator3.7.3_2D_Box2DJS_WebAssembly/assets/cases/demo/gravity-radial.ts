import { _decorator, Component, Node, Vec2, IVec2Like, RigidBody2D } from 'cc';
import { Gravity } from './gravity';
const { ccclass, property } = _decorator;

@ccclass('GravityRadial')
export class GravityRadial extends Gravity {
    @property
    gravityForce = 500;
 
    _position = new Vec2;
    _center = new Vec2;
    
    _applyForce (body: RigidBody2D) {
        let position = this._position;
        let center = this._center;
 
        this._position.set(body.node.worldPosition);
        this._center.set(this.collider.node.worldPosition);
 
        let f = center.subtract( position ).normalize().multiplyScalar(this.gravityForce * body.getMass());
 
        body.applyForce(f, position, false);
    }
}
