
import { _decorator, Component, Node, Scheduler, director, game, Game, Label } from 'cc';
const { ccclass, property } = _decorator;

var timeScale = 1;

//@ts-ignore
game._calculateDT = function (now: number) {
    if (!now) now = performance.now();
        this._deltaTime = now > this._startTime ? (now - this._startTime) / 1000 : 0;
        if (this._deltaTime > Game.DEBUG_DT_THRESHOLD) {
            this._deltaTime = this.frameTime / 1000;
        }
        this._startTime = now;
        return this._deltaTime * timeScale;
};

// console.log(game._calculateDT)

@ccclass('GameControl')
export class GameControl extends Component {

    timer: Scheduler = null;

    isIcebound: boolean = false;

    @property(Label)
    iceBoundState: Label = null;

    @property(Label)
    sceneState: Label = null;

    iceBoundChangeClicked (event, iceBound) {
        if (iceBound === "1") {
            timeScale = 0.1;
            this.iceBoundState.string = "冰封"
        } else if (iceBound === "0"){
            timeScale = 1;
            this.iceBoundState.string = "解封"
        }
    }

    pauseMove () {
        director.pause();
        this.sceneState.string = "游戏逻辑暂停";
    }

    resumeMove () {
        director.resume();
        this.sceneState.string = "游戏正常运行";
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
