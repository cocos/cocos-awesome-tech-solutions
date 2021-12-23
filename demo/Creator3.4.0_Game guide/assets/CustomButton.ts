
import { _decorator, Component, Node, EventTouch, EventHandler, Button, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = NewComponent
 * DateTime = Thu Dec 23 2021 15:09:09 GMT+0800 (中国标准时间)
 * Author = zzf520
 * FileBasename = NewComponent.ts
 * FileBasenameNoExtension = NewComponent
 * URL = db://assets/NewComponent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
enum State {
    NORMAL = 'normal',
    HOVER = 'hover',
    PRESSED = 'pressed',
    DISABLED = 'disabled',
}

@ccclass('NewComponent')
export class NewComponent extends Button {

    protected _onTouchBegan (event?: EventTouch) {
        if (!this._interactable || !this.enabledInHierarchy) { return; }

        //@ts-ignore
        this._pressed = true;
        this._updateState();
        if (event) {
            event.propagationStopped = false;
        }
        event.preventSwallow = true;
    }

    protected _onTouchMove (event?: EventTouch) {
        //@ts-ignore
        if (!this._interactable || !this.enabledInHierarchy || !this._pressed) { return; }
        // mobile phone will not emit _onMouseMoveOut,
        // so we have to do hit test when touch moving
        if (!event) {
            return;
        }

        const touch = (event).touch;
        if (!touch) {
            return;
        }

        const hit = this.node._uiProps.uiTransformComp!.isHit(touch.getUILocation());
        //@ts-ignore
        if (this._transition === Button.Transition.SCALE && this.target && this._originalScale) {
            if (hit) {
                //@ts-ignore
                Vec3.copy(this._fromScale, this._originalScale);
                //@ts-ignore
                Vec3.multiplyScalar(this._toScale, this._originalScale, this._zoomScale);
                //@ts-ignore
                this._transitionFinished = false;
            } else {
                //@ts-ignore
                this._time = 0;
                //@ts-ignore
                this._transitionFinished = true;
                //@ts-ignore
                this.target.setScale(this._originalScale);
            }
        } else {
            let state;
            if (hit) {
                state = State.PRESSED;
            } else {
                state = State.NORMAL;
            }
            this._applyTransition(state);
        }

        if (event) {
            event.propagationStopped = false;
        }
        event.preventSwallow = true;
    }

    protected _onTouchEnded (event?: EventTouch) {
        if (!this._interactable || !this.enabledInHierarchy) {
            return;
        }

        //@ts-ignore
        if (this._pressed) {
            EventHandler.emitEvents(this.clickEvents, event);
            this.node.emit(Button.EventType.CLICK, this);
        }
        //@ts-ignore
        this._pressed = false;
        this._updateState();

        if (event) {
            event.propagationStopped = false;
        }
        event.preventSwallow = true;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
