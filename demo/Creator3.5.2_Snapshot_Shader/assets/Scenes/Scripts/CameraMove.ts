import { _decorator, Component, Node, Vec2, RigidBody, Vec3, Input, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

import { InputEx } from './InputEx';

@ccclass('CameraMove')
export class CameraMove extends Component {
    moveSpeed: number = 7.5;
    cameraSpeed: number = 3.0;

    rotation: Vec3 = Vec3.ZERO.clone();
    moveVector: Vec3 = Vec3.ZERO.clone();

    rigidbody: RigidBody = null;

    start() {
        InputEx.RegisterEvent();
        this.rigidbody = this.getComponent(RigidBody);
    }

    onDestroy() {
        InputEx.UnRegisterEvent();
    }

    update(dt: number) {
        return;

        // Rotate the camera.
        this.rotation = this.rotation.add(new Vec3(-InputEx.GetAxis("Mouse Y"), InputEx.GetAxis("Mouse X"), 0));
        this.node.setRotationFromEuler(this.rotation.multiplyScalar(this.cameraSpeed));

        // Move the camera.
        let x = InputEx.GetAxis("Horizontal");
        let z = InputEx.GetAxis("Vertical");

        let move: Vec3 = Vec3.ZERO;
        let speed = this.moveSpeed;

        move = new Vec3(x, 0.0, z);
        speed = this.moveSpeed * (InputEx.GetKeyDown(KeyCode.SPACE) ? 2.5 : 1.0);

        this.moveVector = move.multiplyScalar(speed);
    }

    lateUpdate() {
        return;
        
        let wdir = this.moveVector.transformMat4(this.node.getWorldMatrix());
        this.rigidbody.setLinearVelocity(wdir);
    }
}

