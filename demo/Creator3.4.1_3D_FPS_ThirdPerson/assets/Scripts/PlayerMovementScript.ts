
import { SmoothDampV3 } from './Utils/MathEx'
import { InputEx } from './Utils/InputEx';
import { _decorator, Component, Node, Vec3, RigidBody, KeyCode, AudioSource, ICollisionEvent, BoxCollider, Label, PhysicsSystem } from 'cc';
import { TimeEx } from './Utils/TimeEx';

const { ccclass, property } = _decorator;

@ccclass('PlayerMovementScript')
export class PlayerMovementScript extends Component {
    @property({ tooltip: "最大加速度" })
    maxSpeed: number = 3.0;
    @property({ tooltip: "停止耗时限定" })
    deaccelerationSpeed: number = 0.2;
    @property({ tooltip: "加速速率" })
    accelerationSpeed: number = 100000.0;
    @property({ tooltip: "跳跃使用的力度" })
    jumpForce: number = 15000.0;

    currentSpeed: number = 0.0;

    @property(Label)
    label: Label = null!;
    @property(Node)
    cameraMain: Node = null!;

    @property(RigidBody)
    rigidBody: RigidBody = null!;
    @property(BoxCollider)
    collider: BoxCollider = null!;

    @property(AudioSource)
    walkSound: AudioSource = null!;
    @property(AudioSource)
    runSound: AudioSource = null!;

    private slowdownV: Vec3 = new Vec3();
    private horizontalMovement: Vec3 = new Vec3();
    private grounded: boolean = false;

    start() {
        PhysicsSystem.instance.autoSimulation = false;
        InputEx.RegisterEvent();
        this.collider.on('onCollisionStay', this.OnCollisionStay, this);
        this.collider.on('onCollisionExit', this.OnCollisionExit, this);
    }

    onDestroy() {
        InputEx.UnRegisterEvent();
        this.collider.off('onCollisionStay', this.OnCollisionStay, this);
        this.collider.off('onCollisionExit', this.OnCollisionExit, this);
    }

    OnCollisionStay(event: ICollisionEvent) {
        event.contacts.forEach(contact => {
            let out: Vec3 = new Vec3();
            contact.getWorldNormalOnB(out);
            if (Vec3.angle(out, Vec3.UP) < 60) {
                this.grounded = true;
            }
        });
    }

    OnCollisionExit() {
        this.grounded = false;
    }

    /**
     * 蹲下
     */
    Crouching() {
        if (InputEx.GetKeyDown(KeyCode.KEY_C)) {
            this.node.scale = this.node.scale.lerp(new Vec3(1, 0.6, 1), TimeEx.deltaTime * 15);
        }
        else {
            this.node.scale = this.node.scale.lerp(new Vec3(1, 1, 1), TimeEx.deltaTime * 15);
        }
        this.cameraMain.scale = new Vec3(1 / this.node.scale.x, 1 / this.node.scale.y, 1 / this.node.scale.z);
    }

    /**
     * 跳跃
     */
    Jumping() {
        if (this.grounded && InputEx.GetKeyDown(KeyCode.SPACE)) {
            this.rigidBody.applyForce(Vec3.UP.clone().multiplyScalar(this.jumpForce))
            this.walkSound.stop();
            this.runSound.stop();
        }
    }

    /**
     * 移动
     */
    PlayerMovementLogic() {
        let velocity: Vec3 = new Vec3();
        this.rigidBody.getLinearVelocity(velocity);

        if (this.label) {
            this.label.string = `${this.currentSpeed.toFixed(2)}`;
        }

        this.currentSpeed = velocity.length();
        this.horizontalMovement = new Vec3(velocity.x, velocity.y, velocity.z);

        if (this.horizontalMovement.length() > this.maxSpeed) {
            this.horizontalMovement = this.horizontalMovement.normalize();
            this.horizontalMovement.multiplyScalar(this.maxSpeed);
            this.rigidBody.setLinearVelocity(new Vec3(
                this.horizontalMovement.x,
                this.horizontalMovement.y,
                this.horizontalMovement.z
            ));
        }

        if (this.grounded) {
            this.rigidBody.applyLocalForce(new Vec3(InputEx.GetAxis("Horizontal") * this.accelerationSpeed * TimeEx.deltaTime, 0, InputEx.GetAxis("Vertical") * this.accelerationSpeed * TimeEx.deltaTime));
        } else {
            this.rigidBody.applyLocalForce(new Vec3(InputEx.GetAxis("Horizontal") * this.accelerationSpeed / 2 * TimeEx.deltaTime, 0, InputEx.GetAxis("Vertical") * this.accelerationSpeed / 2 * TimeEx.deltaTime));
        }

        if (this.grounded && InputEx.GetAxis("Horizontal") == 0 && InputEx.GetAxis("Vertical") == 0) {
            let finalSpeed = SmoothDampV3(velocity,
                new Vec3(0, 0, 0),
                this.slowdownV,
                this.deaccelerationSpeed);
            this.rigidBody.setLinearVelocity(finalSpeed);
        }
    }

    /**
     * 射击
     */
    RaycastForMeleeAttacks() {

    }

    /**
     * 行走音效
     */
    WalkingSound() {
        if (this.currentSpeed <= 1) {
            this.walkSound.stop();
            this.runSound.stop();
            return;
        }

        if (this.maxSpeed == 3 && !this.walkSound.playing) {
            this.walkSound.play();
            this.runSound.stop();
            return;
        }

        if (this.maxSpeed == 5 && !this.runSound.playing) {
            this.walkSound.stop();
            this.runSound.play();
            return;
        }
    }

    update(dt: number) {
        TimeEx.deltaTime = dt;
        PhysicsSystem.instance.step(TimeEx.deltaTime);
    }

    lateUpdate() {
        this.Jumping();
        this.Crouching();
        this.WalkingSound();
        this.RaycastForMeleeAttacks();
        this.PlayerMovementLogic();
    }
}
