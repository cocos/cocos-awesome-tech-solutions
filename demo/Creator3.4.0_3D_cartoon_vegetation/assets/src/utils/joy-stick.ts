
import { _decorator, Component, Node, Vec3, Vec2, EventTouch, UITransform, view, math } from 'cc';
const { ccclass, property } = _decorator;

let _tempVec3 = new Vec3();
let _tempVec2 = new Vec2();
let _tempSize = new math.Size();

@ccclass('JoyStick')
export class JoyStick extends Component {

    @property
    maxRadius = 10;

    @property({ type: Node })
    control: Node | null = null;

    @property({ type: Node })
    controlBg: Node | null = null;

    @property({ type: Node })
    jumpBtn: Node | null = null;

    @property({ type: Node })
    jumpWidget: Node | null = null;

    direction: Vec3 = new Vec3;
    magnitude: number = 0;
    rotation: number = 0;
    jump = false;

    _currentScreenVerticle = true;
    _originRadius = 0;
    _originSize = 0;

    start () {
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);

        if (this.jumpBtn) {
            this.jumpBtn.on(Node.EventType.TOUCH_START, this.jumpStart, this);
            this.jumpBtn.on(Node.EventType.TOUCH_CANCEL, this.jumpStop, this);
            this.jumpBtn.on(Node.EventType.TOUCH_END, this.jumpStop, this);
        }

        this._originSize = this.node.getComponent(UITransform)?.contentSize.width || 0;
        this._originRadius = this.maxRadius;
        this.updateScreen();
    }

    update () {
        this.updateScreen();
    }

    updateScreen () {
        let size = view.getFrameSize();
        let preScreenVerticle = this._currentScreenVerticle;
        if (size.width > size.height) {
            this._currentScreenVerticle = false;
        } else {
            this._currentScreenVerticle = true;
        }

        let scaleValue = 2;
        if (preScreenVerticle != this._currentScreenVerticle) {
            if (!this._currentScreenVerticle) {
                this.control?.setScale(Vec3.ONE);
                this.controlBg?.setScale(Vec3.ONE);
                this.maxRadius = this._originRadius;
                this.jumpWidget?.setScale(Vec3.ONE);

                _tempSize.set(this._originSize, this._originSize);
                this.node.getComponent(UITransform)?.setContentSize(_tempSize);
            } else {
                _tempVec3.set(scaleValue, scaleValue, scaleValue);

                _tempSize.set(this._originSize * scaleValue, this._originSize * scaleValue);
                this.node.getComponent(UITransform)?.setContentSize(_tempSize);

                this.maxRadius = scaleValue * this._originRadius;
                this.control?.setScale(_tempVec3);
                this.controlBg?.setScale(_tempVec3);
                this.jumpWidget?.setScale(_tempVec3);
            }
        }
    }

    touchMove (event: EventTouch) {
        if (!this.control) return;

        event.getLocation(_tempVec2);

        let x = _tempVec2.x / view.getScaleX();
        let y = _tempVec2.y / view.getScaleY();

        this.node.getWorldPosition(_tempVec3);
        _tempVec3.set(x - _tempVec3.x, y - _tempVec3.y, 0);

        Vec3.subtract(this.direction, _tempVec3, Vec3.ZERO);
        this.direction.normalize();

        let distance = Vec3.distance(_tempVec3, Vec3.ZERO);
        if (distance >= this.maxRadius) {
            distance = this.maxRadius;
        }

        this.magnitude = distance / this.maxRadius;
        Vec3.multiplyScalar(_tempVec3, this.direction, distance);
        Vec3.add(_tempVec3, Vec3.ZERO, _tempVec3);

        this.rotation = -Math.atan2(this.direction.x, this.direction.y) * (180.0 / Math.PI);

        this.control.setPosition(_tempVec3);
    }

    touchEnd (event: EventTouch) {
        if (!this.control) return;

        this.rotation = 0;
        this.magnitude = 0;
        this.direction.set(Vec3.ZERO);
        this.control.setPosition(Vec3.ZERO);
    }

    jumpStart () {
        this.jump = true;
    }

    jumpStop () {
        this.jump = false;
    }
}