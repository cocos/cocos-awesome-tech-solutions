
import { _decorator, Component, Node, CameraComponent, math, instantiate } from 'cc';
const { ccclass, property } = _decorator;

import { InputEx } from './Utils/InputEx';
import { SmoothDamp } from './Utils/MathEx';
import { TimeEx } from './Utils/TimeEx';
import { PlayerMovementScript } from './PlayerMovementScript';

@ccclass('MouseLookScript')
export class MouseLookScript extends Component {
    @property(CameraComponent)
    public myCamera: CameraComponent = null!;
    @property
    public mouseSensitvity: number = 4;
    @property
    public yRotationSpeed: number = 0.1;
    @property
    public xCameraSpeed: number = 0.1;
    @property
    public topAngleView: number = 60;
    @property
    public bottomAngleView: number = -45;

    private timeSpeed: number = 2.0;
    private timer: number = 0.0;
    private int_timer: number = 0;
    private wantedZ: number = 0;
    private zRotation: number = 0.0;
    private timerToRotateZ: number = 0.0;

    public mouseSensitvity_notAiming: number = 300;
    public mouseSensitvity_aiming: number = 50;

    private rotationYVelocity: number[] = [0];
    private cameraXVelocity: number[] = [0];

    public wantedYRotation: number = 0;
    public currentYRotation: number = 0;
    public wantedCameraXRotation: number = 0;
    public currentCameraXRotation: number = 0;

    start() {
    }

    onDestroy() {

    }

    /**
     * 相机 Z 轴旋转
     */
    HeadMovement() {
        this.timer += this.timeSpeed * TimeEx.deltaTime;
        this.int_timer = Math.round(this.timer);

        if (this.int_timer % 2 == 0) {
            this.wantedZ = -1;
        } else {
            this.wantedZ = 1;
        }

        this.zRotation = math.lerp(this.zRotation, this.wantedZ, TimeEx.deltaTime * this.timerToRotateZ);
    }

    /**
     * 鼠标移动控制
     */
    MouseInputMovement() {
        this.wantedYRotation += (InputEx.GetAxis("Mouse X") * this.mouseSensitvity);
        this.wantedCameraXRotation -= (InputEx.GetAxis("Mouse Y") * this.mouseSensitvity);
        this.wantedCameraXRotation = math.clamp(this.wantedCameraXRotation, this.bottomAngleView, this.topAngleView);
    }

    WeaponRotation() {
        
    }

    ApplyingStuff() {
        this.currentYRotation = SmoothDamp(this.currentYRotation, this.wantedYRotation, this.rotationYVelocity, this.yRotationSpeed);
        this.currentCameraXRotation = SmoothDamp(this.currentCameraXRotation, this.wantedCameraXRotation, this.cameraXVelocity, this.xCameraSpeed);
        // 左右视角使用相机
        this.node.setRotationFromEuler(0, this.currentYRotation, 0);
        // 左右视角使用相机
        this.myCamera.node.setRotationFromEuler(-this.currentCameraXRotation, 180, this.zRotation);
    }

    update(dt: number) {
        this.MouseInputMovement();
        if (PlayerMovementScript.prototype.currentSpeed > 1) {
            this.HeadMovement();
        }
    }

    lateUpdate() {
        if (InputEx.GetButton("Fire2")) {
            this.mouseSensitvity = this.mouseSensitvity_aiming;
        }
        else if (this.getComponent(PlayerMovementScript).maxSpeed > 5) {
            this.mouseSensitvity = this.mouseSensitvity_notAiming;
        }
        else {
            this.mouseSensitvity = this.mouseSensitvity_notAiming;
        }

        this.ApplyingStuff();
    }
}
