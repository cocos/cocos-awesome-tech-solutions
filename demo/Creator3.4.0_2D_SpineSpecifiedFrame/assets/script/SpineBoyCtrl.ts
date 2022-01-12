import { _decorator, Component, Node, sp, Label, EditBox } from "cc";
const { ccclass, property } = _decorator;

const enum ANIM_LOOP_MODE {
    // 不循环
    No_Loop = 0,
    // 普通循环
    LOOP = 1,
    // 正向播放后逆向播放循环
    REVERSE_LOOP = 2
};

@ccclass('SpineBoyCtrl')
export default class SpineBoyCtrl extends Component{
    @property(Node)
    inputBeginFrame !: Node;
    @property(Node)
    inputEndFrame !: Node;
    @property(Label)
    frameTipLabel !: Label;
    
    private spine !: sp.Skeleton;

    frames : number = 0; // 总帧数
    duration : number = 0;
    frameRate : number = 30;
    secondsPerFrame : number = 0; // 每帧时间

    beginTime : number = 0;
    endTime : number = 0;
    isReversePlayOnce : boolean = false; // 是否反向播放一次
    loopMode : ANIM_LOOP_MODE = ANIM_LOOP_MODE.No_Loop; // 定义循环模式

    onLoad () {
        var spine = this.spine = this.getComponent('sp.Skeleton') as sp.Skeleton;
        console.log(this.spine.getCurrent(0));

        this.duration = this.spine.getCurrent(0).animation.duration;
        this.frames = Math.ceil(this.frameRate * this.duration);
        this.secondsPerFrame = 1 / this.frameRate;

        this.frameTipLabel.string = `总帧数 ${this.frames}`;

        spine.setCompleteListener(trackEntry => {
            if (this.isReversePlayOnce) {
                this.doReverse();
                this.isReversePlayOnce = false;
            } else if (this.loopMode !== ANIM_LOOP_MODE.No_Loop) {
                if (this.loopMode == ANIM_LOOP_MODE.LOOP) {
                    this.onPlayLoopClick();
                }
            }
        });
    }

    onClickFramePlay () {
        let beginStr = this.inputBeginFrame.getComponent(EditBox)!.string;
        let endStr = this.inputEndFrame.getComponent(EditBox)!.string;
        let beginIndex = parseInt(beginStr) || 1;
        let endIndex = parseInt(endStr) || this.frames;

        this.beginTime = beginIndex * this.secondsPerFrame;
        this.endTime = endIndex * this.secondsPerFrame;
        if (this.beginTime <= 0) this.beginTime = 0;
        if (this.endTime >= this.duration) this.endTime = this.duration;
        this.isReversePlayOnce = false;
        this.loopMode = ANIM_LOOP_MODE.No_Loop;
        this.spine.setAnimation(0, 'portal', false);
        this.doPlay();
    }

    onPlayOnceClick () {
        this.spine.setAnimation(0, 'portal', false);
        this.beginTime = 1;
        this.endTime = 2;
        this.isReversePlayOnce = false;
        this.loopMode = ANIM_LOOP_MODE.No_Loop;
        this.doPlay();
    }

    onPlayReverseClick () {
        this.spine.setAnimation(0, 'portal', false);
        this.beginTime = 1;
        this.endTime = 2;
        this.isReversePlayOnce = true;
        this.loopMode = ANIM_LOOP_MODE.No_Loop;
        this.doPlay();
    }

    onPlayLoopClick () {
        this.spine.setAnimation(0, 'portal', false);
        this.beginTime = 1;
        this.endTime = 2;
        this.isReversePlayOnce = false;
        this.loopMode = ANIM_LOOP_MODE.LOOP;
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
