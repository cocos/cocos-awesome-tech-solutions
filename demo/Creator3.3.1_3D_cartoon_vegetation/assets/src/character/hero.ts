
import { _decorator, Component, Node, Vec3, Vec2, Animation, lerp, AnimationClip, AnimationState, animation, AnimationComponent, RigidBody, ColliderComponent, ICollisionEvent, BoxCollider, sys, systemEvent, SystemEventType, EventKeyboard, macro } from 'cc';
import input from '../utils/input';
import { JoyStick } from '../utils/joy-stick';
import OrbitCamera from '../utils/orbit-camera';
const { ccclass, property, type } = _decorator;

let tempVec3 = new Vec3;

@ccclass('Hero')
export class Hero extends Component {
    @property
    moveSpeed = 10;

    @property
    runSpeed = 20;

    @type(Animation)
    animation: Animation | null = null;

    @type(RigidBody)
    rigidBody: RigidBody | null = null;

    @type(JoyStick)
    joyStick: JoyStick | null = null;

    @property
    jumpForce = 5;

    @type(OrbitCamera)
    orbitCamera: OrbitCamera | null = null;

    jumping = false;

    speed = new Vec3;
    targetSpeed = new Vec3;

    rotation = 0;
    targetRotation = 0;

    _currentAnim = '';

    _currentCollider: ColliderComponent | null = null;

    start () {
        this.animation!.on(AnimationComponent.EventType.STOP, this.onAnimationStop.bind(this))
        let collider = this.getComponent(BoxCollider);
        if (collider) {
            collider.on('onCollisionEnter', this.onCollision, this);
            collider.on('onCollisionStay', this.onCollision, this);
            collider.on('onCollisionExit', this.onCollisionExit, this);
        }

        systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);

        if (!sys.isMobile && this.joyStick) {
            this.joyStick = null;
        }

        if (this.joyStick) {
            this.joyStick.node.on(Node.EventType.TOUCH_START, this.onJoyStickTouchStart, this);
        }
    }

    onKeyDown (event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.up:
            case macro.KEY.w:
            case macro.KEY.down:
            case macro.KEY.s: {
                if (this.orbitCamera) {
                    // this.orbitCamera.resetTargetRotation()
                }
                break;
            }
        }
    }
    onKeyUp (event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.down:
            case macro.KEY.s:
                this.targetRotation += 180;
                break;
        }
    }

    onJoyStickTouchStart () {
        if (this.orbitCamera) {
            // this.orbitCamera.resetTargetRotation()
        }
    }

    onCollision (event: ICollisionEvent) {
        let otherCollider = event.otherCollider;
        this._currentCollider = otherCollider;
    }

    onCollisionExit (event: ICollisionEvent) {
        this._currentCollider = null;
    }

    play (name) {
        if (!this.animation) {
            return;
        }
        if (this._currentAnim === name) {
            let state = this.animation.getState(name);
            if (state.wrapMode !== AnimationClip.WrapMode.Normal) {
                return;
            }
        }
        this._currentAnim = name

        this.animation.crossFade(name, 0.1);
    }

    onAnimationStop (type, state) {
        if (state.name === 'UnarmedJumpRunning') {
            this.jumping = false;
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.

        let moving = false;
        let speed = this.speed;
        let speedAmount = this.moveSpeed;
        if (input.key.shift) {
            speedAmount = this.runSpeed;
        } else if (this.joyStick) {
            speedAmount = this.moveSpeed + (this.runSpeed * 0.8 - this.moveSpeed) * this.joyStick.magnitude;
        }

        this.targetSpeed.x = this.targetSpeed.z = 0;

        if (input.key.left) {
            this.targetRotation += 180 * deltaTime;
        }
        else if (input.key.right) {
            this.targetRotation -= 180 * deltaTime;
        }
        else if (this.joyStick) {
            // keep joystrick angle is relative to current camera view angle
            this.targetRotation = this.joyStick.rotation + this.orbitCamera!.targetRotation.y;
        }

        let targetRotationRad = this.targetRotation * Math.PI / 180;
        if (input.key.up || (this.joyStick && this.joyStick.magnitude > 0)) {
            this.targetSpeed.x = speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.z = speedAmount * Math.cos(targetRotationRad);
            moving = true;
        }

        let reverseRotation = 0;
        if (input.key.down) {
            this.targetSpeed.x = -speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.z = -speedAmount * Math.cos(targetRotationRad);
            moving = true;
            reverseRotation = 180;
        }

        Vec3.lerp(speed, speed, this.targetSpeed, deltaTime * 5);


        if (input.key.space || (this.joyStick && this.joyStick.jump)) {
            if (!this.jumping) {
                this.jumping = true;
                this.rigidBody!.applyImpulse(tempVec3.set(0, this.jumpForce, 0));
            }
        }

        if (this.jumping) {

        }
        else if (moving) {
            if (Math.abs(this.runSpeed - speedAmount) <= 5) {
                this.play('FastRun');
            }
            else {
                this.play('Running');
            }
        }
        else {
            speed.x = speed.z = 0;
            this.play('Yawn');
        }

        if (this.joyStick) {
            this.rotation = this.targetRotation + reverseRotation;
        }
        else {
            this.rotation = lerp(this.rotation, this.targetRotation + reverseRotation, deltaTime * 5);
        }

        this.rigidBody!.getLinearVelocity(tempVec3);
        speed.y = tempVec3.y;
        this.rigidBody!.setLinearVelocity(speed);

        if (this.speed.y < -3) {
            if (this._currentAnim !== 'JumpingDown') {
                this._currentAnim = 'JumpingDown';
                // this.play('JumpingDown')
            }
        }
        else if (this.speed.y > 3) {
            this.jumping = true;
            if (this._currentAnim !== 'JumpingUp') {
                this._currentAnim = 'JumpingUp';
                this.play('JumpingUp')
            }
        }
        else if (this._currentAnim === 'JumpingDown') {
            this.jumping = false;
        } else if (this._currentAnim === 'JumpingUp' && this._currentCollider) {
            this.jumping = false;
        }

        this.animation!.node.eulerAngles = tempVec3.set(0, this.rotation, 0);
    }
}
