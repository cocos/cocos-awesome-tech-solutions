import { _decorator, Component, sp, AnimationState } from "cc";
const { ccclass, property } = _decorator;

@ccclass('SpineBoyCtrl')
export default class SpineBoyCtrl extends Component{
    private spine !: sp.Skeleton;

    frames : number = 0;
    duration : number = 0;
    frameRate : number = 30;
    secondPerFrame : number = 0;

    beginTime : number = 0;
    endTime : number = 0;

    timeCount : number = 0;

    onLoad () {
        this.spine = this.getComponent('sp.Skeleton') as sp.Skeleton;
        console.log(this.spine.getCurrent(0));

        this.duration = this.spine.getCurrent(0).animation.duration;
        this.frames = Math.ceil(this.frameRate * this.duration);
        this.secondPerFrame = 1 / this.frameRate;

        console.log(this.duration, this.frameRate, this.frames, this.secondPerFrame);
    }

    update (dt: number) {
    }

    onClick () {
        this.spine.setAnimation(0, 'portal', false);

        this.beginTime = 1.5;
        this.endTime = 2.5;
        this.doPlay();
    }

    // 指定时间播放
    doPlay () {
        this.spine.timeScale = 0;
        this.spine.getCurrent(0).animationStart = this.beginTime;
        this.spine.getCurrent(0).animationEnd = this.endTime;
        this.spine.timeScale = 1;
    }

    // 指定时间播放(逆向)
    doReverse () {
        this.spine.timeScale = 0;
        this.spine.getCurrent(0).animationStart = this.beginTime;
        this.spine.getCurrent(0).animationEnd = this.endTime;
        this.spine.timeScale = -1;
    }
}
