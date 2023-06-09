import { _decorator, Component, Vec3, math, input, Input, KeyCode } from 'cc';
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
         input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
         input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
 
         //鼠标监听
         input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

    }

    onKeyUp(event:any) {
        switch (event.keyCode) {
            case KeyCode.SHIFT_LEFT:
            case KeyCode.SHIFT_RIGHT:
                this.startShift = false;
                break;
            case KeyCode.KEY_W:
                this.startW = false;
                break;
            case KeyCode.KEY_A:
                this.startA = false;
                break;
            case KeyCode.KEY_S:
                this.startS = false;
                break;
            case KeyCode.KEY_D:
                this.startD = false;
                break;
        }
    }

    onKeyDown(event:any) {
        switch (event.keyCode) {
            case KeyCode.SHIFT_LEFT:
            case KeyCode.SHIFT_RIGHT:
                this.startShift = true;
                break;
            case KeyCode.KEY_W:
                this.startW = true;
                break;
            case KeyCode.KEY_A:
                this.startA = true;
                break;
            case KeyCode.KEY_S:
                this.startS = true;
                break;
            case KeyCode.KEY_D:
                this.startD = true;
                break;
        }
    }

    onMouseMove(event:any) {
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
