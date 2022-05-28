import { Component, _decorator, systemEvent, SystemEvent, Vec3, EventTouch, Touch,
    Quat, Vec2, Node, EventMouse, lerp, director, Canvas } from 'cc'
import { EDITOR } from 'cc/env';
const { ccclass, property, type } = _decorator;

let tempVec3 = new Vec3();
let tempVec3_2 = new Vec3();
let tempQuat = new Quat();
const DeltaFactor = 1 / 200;
let PositiveForward = new Vec3(0, 0, 1);

@ccclass('OrbitCamera')
export default class OrbitCamera extends Component {
    @property
    enableTouch = true;
    @property
    enableScaleRadius = false;

    @property
    autoRotate = false;
    @property
    autoRotateSpeed = 90;

    @property
    rotateSpeed = 1;
    @property
    followSpeed = 1;
    @property
    xRotationRange = new Vec2(5, 70);
    @type(Node)
    _target: Node | null = null;

    @property
    get radius () {
        return this._targetRadius;
    }
    set radius (v) {
        this._targetRadius = v;
    }
    @property
    radiusScaleSpeed = 1;
    @property
    minRadius = 5;
    @property
    maxRadius = 10;

    @type(Node)
    get target () {
        return this._target;
    }
    set target (v) {
        this._target = v;
        this._targetRotation.set(this._startRotation);
        this._targetCenter.set(v!.worldPosition);
    }

    @type(Vec3)
    get targetRotation (): Vec3 {
        if (!EDITOR) {
            this._startRotation.set(this._targetRotation);
        }
        return this._startRotation;
    }
    set targetRotation (v: Vec3) {
        this._targetRotation.set(v);
        this._startRotation.set(v);
    }

    @property
    followTargetRotationY = true;

    private _startRotation = new Vec3();
    private _center = new Vec3();
    private _targetCenter = new Vec3();
    private _touched = false;
    private _targetRotation = new Vec3();
    private _rotation = new Quat();

    @property
    private _targetRadius = 10;
    private _radius = 10;

    start () {
        let canvas = director.getScene()!.getComponentInChildren(Canvas);
        if (canvas && canvas.node) {
            if (this.enableTouch) {
                canvas.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
                canvas.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
                canvas.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
            }

            if (this.enableScaleRadius) {
                canvas.node.on(Node.EventType.MOUSE_WHEEL, this.onMouseWhee, this)
            }
        }
        else {
            if (this.enableTouch) {
                systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this)
                systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this)
                systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this)
            }

            if (this.enableScaleRadius) {
                systemEvent.on(SystemEvent.EventType.MOUSE_WHEEL, this.onMouseWhee, this)
            }
        }


        this.resetTargetRotation();
        Quat.fromEuler(this._rotation, this._targetRotation.x, this._targetRotation.y, this._targetRotation.z);

        if (this.target) {
            this._targetCenter.set(this.target.worldPosition);
            this._center.set(this._targetCenter);
        }

        this._radius = this.radius;

        this.limitRotation()
    }

    resetTargetRotation () {
        let targetRotation = this._targetRotation.set(this._startRotation);
        if (this.followTargetRotationY) {
            targetRotation = tempVec3_2.set(targetRotation);
            Quat.toEuler(tempVec3, this.target!.worldRotation);
            targetRotation.y += tempVec3.y;
        }
    }

    onTouchStart () {
        this._touched = true;
    }
    onTouchMove (touch?: Touch, event?: EventTouch) {
        if (!this._touched) return;
        let delta = touch!.getDelta()

        Quat.fromEuler(tempQuat, this._targetRotation.x, this._targetRotation.y, this._targetRotation.z);

        Quat.rotateX(tempQuat, tempQuat, -delta.y * DeltaFactor);
        Quat.rotateAround(tempQuat, tempQuat, Vec3.UP, -delta.x * DeltaFactor);

        Quat.toEuler(this._targetRotation, tempQuat);

        this.limitRotation()
    }
    onTouchEnd () {
        this._touched = false;
    }

    onMouseWhee (event: EventMouse) {
        let scrollY = event.getScrollY();
        this._targetRadius += this.radiusScaleSpeed * -Math.sign(scrollY);
        this._targetRadius = Math.min(this.maxRadius, Math.max(this.minRadius, this._targetRadius));
    }

    limitRotation () {
        let rotation = this._targetRotation;

        if (rotation.x < this.xRotationRange.x) {
            rotation.x = this.xRotationRange.x
        }
        else if (rotation.x > this.xRotationRange.y) {
            rotation.x = this.xRotationRange.y
        }

        rotation.z = 0;
    }

    update (dt) {
        let targetRotation = this._targetRotation;
        if (this.autoRotate && !this._touched) {
            targetRotation.y += this.autoRotateSpeed * dt;
        }

        if (this.target) {
            this._targetCenter.set(this.target.worldPosition);

            if (this.followTargetRotationY) {
                targetRotation = tempVec3_2.set(targetRotation);
                Quat.toEuler(tempVec3, this.target.worldRotation);
                targetRotation.y += tempVec3.y;
            }
        }

        Quat.fromEuler(tempQuat, targetRotation.x, targetRotation.y, targetRotation.z);

        Quat.slerp(this._rotation, this._rotation, tempQuat, dt * 7 * this.rotateSpeed);
        Vec3.lerp(this._center, this._center, this._targetCenter, dt * 5 * this.followSpeed);

        this._radius = lerp(this._radius, this._targetRadius, dt * 5);

        Vec3.transformQuat(tempVec3, Vec3.FORWARD, this._rotation);
        Vec3.multiplyScalar(tempVec3, tempVec3, this._radius)
        tempVec3.add(this._center)

        this.node.position = tempVec3;
        this.node.lookAt(this._center);
    }
}
