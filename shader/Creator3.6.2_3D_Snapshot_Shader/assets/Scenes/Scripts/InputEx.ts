import { Director, director, EventKeyboard, EventMouse, EventTouch, Game, game, input, Input, KeyCode, sys, Vec2 } from "cc";

const TOUCH_VK = EventMouse.BUTTON_LEFT;

interface KeyConfig {
    PKey?: KeyCode,
    NKey?: KeyCode,
    PMouse?: number,
    NMouse?: number,
    MoveX?: boolean,
    MoveY?: boolean,
    WheelX?: boolean,
    WheelY?: boolean,
    Sensitivity?: number
}

const keyMap: { [id: string]: KeyConfig } = {
    "Fire1": { PMouse: EventMouse.BUTTON_LEFT, Sensitivity: 1 },
    "Fire2": { PMouse: EventMouse.BUTTON_RIGHT, Sensitivity: 1 },
    "Horizontal": { PKey: KeyCode.KEY_A, NKey: KeyCode.KEY_D, Sensitivity: 1 },
    "Vertical": { PKey: KeyCode.KEY_W, NKey: KeyCode.KEY_S, Sensitivity: 1 },
    "Mouse X": { MoveX: true, Sensitivity: -0.1 },
    "Mouse Y": { MoveY: true, Sensitivity: 0.1 },
    "Mouse ScrollWheel": { WheelY: true, Sensitivity: 0.1 },
};

let keyHold: KeyCode[] = []
let mouseHold: number[] = [];
let mouseClick: number[] = [];
let mouseMove: Vec2 = new Vec2;
let mouseWheel: Vec2 = new Vec2;

export class InputEx {

    static RegisterEvent() {
        if (sys.isMobile) {
            input.on(Input.EventType.TOUCH_START, InputEx.onTouchStart);
            input.on(Input.EventType.TOUCH_END, InputEx.onTouchEnd);
            input.on(Input.EventType.TOUCH_MOVE, InputEx.onTouchMove);
        }
        else {
            input.on(Input.EventType.KEY_DOWN, InputEx.onKeyDown);
            input.on(Input.EventType.KEY_UP, InputEx.onKeyUp);
            input.on(Input.EventType.MOUSE_WHEEL, InputEx.onMouseWheel);
            input.on(Input.EventType.MOUSE_DOWN, InputEx.onMouseDown);
            input.on(Input.EventType.MOUSE_MOVE, InputEx.onMouseMove);
            input.on(Input.EventType.MOUSE_UP, InputEx.onMouseUp);
        }

        // 每帧清除数据
        director.on(Director.EVENT_AFTER_UPDATE, () => {
            mouseMove.x = 0;
            mouseMove.y = 0;
            mouseWheel.x = 0;
            mouseWheel.y = 0;
            mouseClick = [];
        })
    }

    static UnRegisterEvent() {
        input.off(Input.EventType.KEY_DOWN, InputEx.onKeyDown);
        input.off(Input.EventType.KEY_UP, InputEx.onKeyUp);
        input.off(Input.EventType.MOUSE_DOWN, InputEx.onMouseDown);
        input.off(Input.EventType.MOUSE_MOVE, InputEx.onMouseMove);
        input.off(Input.EventType.MOUSE_UP, InputEx.onMouseUp);
    }

    static GetKeyDown(key: KeyCode): boolean {
        if (keyHold.indexOf(key) >= 0)
            return true
        return false
    }

    static GetButtonDown(name: string): boolean {
        let cfg = keyMap[name];
        if (null == cfg) {
            return false;
        }

        if (cfg.PMouse != null && (mouseClick.indexOf(cfg.PMouse) >= 0)) {
            let pos = mouseClick.indexOf(cfg.PMouse);
            if (pos < 0) return;
            mouseClick.splice(pos, 1);
            return true
        }

        if (cfg.NMouse != null && (mouseClick.indexOf(cfg.NMouse) >= 0)) {
            let pos = mouseClick.indexOf(cfg.PMouse);
            if (pos < 0) return;
            mouseClick.splice(pos, 1);
            return true
        }

        return false
    }

    static GetButton(name: string): boolean {
        let cfg = keyMap[name];
        if (null == cfg) {
            return false;
        }
        if (keyMap[name] && mouseHold.indexOf(cfg.PMouse) >= 0)
            return true
        return false
    }

    static GetAxis(name: string): number {
        let cfg = keyMap[name];
        let ret = 0;

        if (null == cfg) {
            return 0;
        }

        if (cfg.PKey != null && (keyHold.indexOf(cfg.PKey) >= 0)) {
            ret = cfg.Sensitivity;
        }

        if (cfg.NKey != null && (keyHold.indexOf(cfg.NKey) >= 0)) {
            ret = -cfg.Sensitivity;
        }

        if (cfg.PMouse != null && (mouseHold.indexOf(cfg.PMouse) >= 0)) {
            ret = cfg.Sensitivity;
        }

        if (cfg.NMouse != null && (mouseHold.indexOf(cfg.NMouse) >= 0)) {
            ret = -cfg.Sensitivity;
        }

        if (cfg.MoveX != null) {
            ret = mouseMove.x * cfg.Sensitivity;
        }

        if (cfg.MoveY != null) {
            ret = mouseMove.y * cfg.Sensitivity;
        }

        if (cfg.WheelX != null) {
            ret = mouseWheel.x * cfg.Sensitivity;
        }

        if (cfg.WheelY != null) {
            ret = mouseWheel.y * cfg.Sensitivity;
        }

        return ret;
    }

    private static onKeyDown(event: EventKeyboard) {
        if (keyHold.indexOf(event.keyCode) >= 0)
            return;
        keyHold.unshift(event.keyCode);
    }

    private static onKeyUp(event: EventKeyboard) {
        let pos = keyHold.indexOf(event.keyCode);
        if (pos < 0)
            return;
        keyHold.splice(pos, 1);
    }

    private static onMouseMove(event: EventMouse) {
        mouseMove = event.getDelta();
        let pos = mouseHold.indexOf(event.getButton());
        if (pos < 0) return;
        mouseHold.splice(pos, 1);
    }

    private static onMouseDown(event: EventMouse) {
        if (mouseHold.indexOf(event.getButton()) >= 0) return;
        mouseHold.unshift(event.getButton());
    }

    private static onMouseUp(event: EventMouse) {
        let pos = mouseHold.indexOf(event.getButton());
        if (pos < 0) return;
        mouseHold.splice(pos, 1);
        mouseClick.unshift(event.getButton());
    }

    private static onMouseWheel(event: EventMouse) {
        mouseWheel.x = event.getScrollX();
        mouseWheel.y = event.getScrollY();
    }

    private static onTouchStart(event: EventTouch) {
        if (mouseHold.indexOf(TOUCH_VK) >= 0) return;
        mouseHold.unshift(TOUCH_VK);
    }

    private static onTouchEnd(event: EventTouch) {
        let pos = mouseHold.indexOf(TOUCH_VK);
        if (pos < 0) return;
        mouseHold.splice(pos, 1);
        mouseClick.unshift(TOUCH_VK);
    }

    private static onTouchMove(event: EventTouch) {
        mouseMove = event.getDelta();
        let pos = mouseHold.indexOf(TOUCH_VK);
        if (pos < 0) return;
        mouseHold.splice(pos, 1);
    }
}