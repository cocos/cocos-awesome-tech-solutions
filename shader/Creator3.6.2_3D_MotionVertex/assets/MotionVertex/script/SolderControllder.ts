
import { _decorator, Component, Material, SkinnedMeshRenderer, Vec3, Vec4, v4, v3, clamp01, systemEvent, SystemEvent, EventKeyboard, KeyCode, Button, input, Input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SolderControllder')
export class SolderControllder extends Component {
    private materials: Array<Material> = [];

    private directionUniform = v4();
    private direction: Vec3 = v3();

    private currentPosition: Vec3 = null;
    private lastPosition: Vec3 = null;

    private t = 0;
    private xAxis = 0;
    private zAxis = 0;
    private speed = 10;

    @property(Node)
    leftButton :Node = null;

    @property(Node)
    rightButton :Node = null;

    @property(Node)
    upButton :Node = null;

    @property(Node)
    downButton :Node = null;
    
    onLoad () {
        this.leftButton.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.leftButton.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.rightButton.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.rightButton.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.upButton.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.upButton.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.downButton.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.downButton.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy () {
        this.leftButton.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.leftButton.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.rightButton.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.rightButton.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.upButton.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.upButton.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.downButton.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.downButton.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(onNode)
    {
        switch (onNode.target.name) {
            case "left":
                this.xAxis = -1;
                break;
            case "right":
                this.xAxis = 1;
                break;
            case "up":
                this.zAxis = -1;
                break;
            case "down":
                this.zAxis = 1;
                break;
        }
    }

    onTouchEnd(onNode)
    {
        switch (onNode.target.name) {
            case "left":
                this.xAxis = 0;
                break;
            case "right":
                this.xAxis = 0;
                break;
            case "up":
                this.zAxis = 0;
                break;
            case "down":
                this.zAxis = 0;
                break;
        }
    }

    start() {
        this.currentPosition = this.node.position.clone();
        this.lastPosition = this.currentPosition.clone();

        let components = this.node.getComponentsInChildren(SkinnedMeshRenderer);
        components.forEach(
            (comp) => {
                this.materials.push(comp.material);
            }
        );

        systemEvent.on(
            SystemEvent.EventType.KEY_DOWN,
            this.onKeyDown,
            this
        );

        systemEvent.on(
            SystemEvent.EventType.KEY_UP,
            this.onKeyUp,
            this
        );
    }

    update(dt: number) {
        this.currentPosition.x += this.speed * dt * this.xAxis;
        this.currentPosition.z += this.speed * dt * this.zAxis;
        this.node.setPosition(this.currentPosition);

        if (this.currentPosition.equals(this.lastPosition)) {
            this.t = 0;
        }

        this.t += dt;
        this.t = clamp01(this.t);
        Vec3.lerp(this.lastPosition, this.lastPosition, this.currentPosition, this.t);
        Vec3.subtract(this.direction, this.lastPosition, this.currentPosition);

        this.materials.forEach(
            (material: Material) => {
                let handle = material.passes[0].getHandle("direction")
                material.passes[0].getUniform(handle, this.directionUniform);
                this.directionUniform.set(
                    this.direction.x,
                    this.direction.y,
                    this.direction.z,
                    this.directionUniform.w,
                );
                material.passes[0].setUniform(handle, this.directionUniform);
            }
        );
    }

    private onKeyDown(event: EventKeyboard) {
        let code = event.keyCode;
        switch (code) {
            case KeyCode.KEY_A:
                this.xAxis = -1;
                break;
            case KeyCode.KEY_D:
                this.xAxis = 1;
                break;
            case KeyCode.KEY_W:
                this.zAxis = -1;
                break;
            case KeyCode.KEY_S:
                this.zAxis = 1;
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        let code = event.keyCode;
        switch (code) {
            case KeyCode.KEY_A:
                this.xAxis = 0;
                break;
            case KeyCode.KEY_D:
                this.xAxis = 0;
                break;
            case KeyCode.KEY_W:
                this.zAxis = 0;
                break;
            case KeyCode.KEY_S:
                this.zAxis = 0;
                break;
        }
    }
}