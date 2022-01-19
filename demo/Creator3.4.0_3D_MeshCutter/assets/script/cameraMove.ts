import { _decorator, Component, Node, Vec3, systemEvent, SystemEvent, math, macro } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('cameraMove')
export class cameraMove extends Component {


    private startShift = false;
    private startW = false;
    private startA = false;
    private startS = false;
    private startD = false;

    start() {

        //键盘监听
        systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

        //鼠标监听
        systemEvent.on(SystemEvent.EventType.MOUSE_MOVE, this.onMouseMove, this);

    }

    onKeyUp(event) {
        switch (event.keyCode) {
            case macro.KEY.shift:
                this.startShift = false;
                break;
            case macro.KEY.w:
                this.startW = false;
                break;
            case macro.KEY.a:
                this.startA = false;
                break;
            case macro.KEY.s:
                this.startS = false;
                break;
            case macro.KEY.d:
                this.startD = false;
                break;
        }
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case macro.KEY.shift:
                this.startShift = true;
                break;
            case macro.KEY.w:
                this.startW = true;
                break;
            case macro.KEY.a:
                this.startA = true;
                break;
            case macro.KEY.s:
                this.startS = true;
                break;
            case macro.KEY.d:
                this.startD = true;
                break;
        }
    }

    onMouseMove(event) {
        if (event.movementX != 0 && this.startShift) {
            const up = new Vec3(0, 1, 0);
            const right = new Vec3(1, 0, 0);
            const rotationx = this.node.getRotation();
            math.Quat.rotateAround(rotationx, rotationx, up, -event.movementX / 5 / 360.0 * 3.1415926535);
            math.Quat.rotateAround(rotationx, rotationx, right, -event.movementY / 2.5 / 360.0 * 3.1415926535);
            this.node.setRotation(rotationx);
        }
    }

    update(deltaTime: number) {

        if (this.startW) {

            this.node.translate(new Vec3(0, deltaTime, 0));
        }

        if (this.startA) {

            this.node.translate(new Vec3(-deltaTime, 0, 0));

        }

        if (this.startS) {

            this.node.translate(new Vec3(0, -deltaTime, 0));

        }

        if (this.startD) {

            this.node.translate(new Vec3(deltaTime, 0, 0));

        }

    }
}
