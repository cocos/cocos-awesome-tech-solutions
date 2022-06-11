
import { SmoothDampV3 } from './Utils/MathEx'
import { InputEx } from './Utils/InputEx';
import { _decorator, Component, Node, Vec3, RigidBody, KeyCode, AudioSource, ICollisionEvent, BoxCollider, Label, PhysicsSystem, find } from 'cc';
import { TimeEx } from './Utils/TimeEx';

const { ccclass, property } = _decorator;

@ccclass('PlayerMovementScript')
export class PlayerMovementScript extends Component {
    @property({ tooltip: "最大加速度" })
    maxSpeed: number = 3.0;
    @property({ tooltip: "停止耗时限定" })
    deaccelerationSpeed: number = 0.2;
    @property({ tooltip: "加速速率"})
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
    @property(AudioSource)
    jumpSound: AudioSource = null!;

    private slowdownV: Vec3 = new Vec3();
    private horizontalMovement: Vec3 = new Vec3();
    private grounded: boolean = false;
    static speed = 0;

    start() {
        PlayerMovementScript.speed = this.accelerationSpeed;
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
        var gun = find("NewGun_semi") || find("NewGun_auto");
        if (gun) {
            var newPos = new Vec3();
            var newCameraY = 0;
            if (InputEx.GetKeyDown(KeyCode.KEY_C)) {
                gun.getPosition(newPos);
                newPos.lerp(new Vec3(gun.position.x, gun.position.y - 60, gun.position.z), 1);
                newCameraY = -0.6;
            } else {
                newPos.lerp(new Vec3(gun.position.x, gun.position.y + 60, gun.position.z), 1);
                newCameraY = 0;
                
            }
            gun.setPosition(newPos);
            this.cameraMain.setPosition(new Vec3(0, newCameraY, 0));
        }
    }

    /**
     * 跳跃
     */
    Jumping() {
        if (this.grounded && InputEx.GetKeyDown(KeyCode.SPACE)) {
            this.rigidBody.applyForce(Vec3.UP.clone().multiplyScalar(this.jumpForce))
            this.walkSound.stop();
            this.runSound.stop();
            this.jumpSound.play();
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
            let finalSpeed = SmoothDampV3(velocity,
                new Vec3(0, 0, 0),
                this.slowdownV,
                this.deaccelerationSpeed);
            this.rigidBody.setLinearVelocity(finalSpeed);
        }

        if (this.grounded) {
            this.rigidBody.applyLocalForce(new Vec3(InputEx.GetAxis("Horizontal") * this.accelerationSpeed * TimeEx.deltaTime, 0, InputEx.GetAxis("Vertical") * this.accelerationSpeed * TimeEx.deltaTime));
        } else {
            this.rigidBody.applyLocalForce(new Vec3(InputEx.GetAxis("Horizontal") * this.accelerationSpeed / 2 * TimeEx.deltaTime, 0, InputEx.GetAxis("Vertical") * this.accelerationSpeed / 2 * TimeEx.deltaTime));
        }

        if (InputEx.GetAxis("Horizontal") == 0 && InputEx.GetAxis("Vertical") == 0) {
            this.deaccelerationSpeed = 0.5;
        } else {
            this.deaccelerationSpeed = 0.1;
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
        let wr = this.node.worldRotation.clone();
        this.PlayerMovementLogic();
        PhysicsSystem.instance.step(TimeEx.deltaTime);
        PhysicsSystem.instance.emitEvents();
        this.node.worldRotation = wr;

        this.Jumping();
        this.Crouching();
        this.WalkingSound();
        this.RaycastForMeleeAttacks();
    }

    lateUpdate() {
    }
}
