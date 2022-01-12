
import { _decorator, Component, Node, dragonBones, math, Label, EditBox } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('main')
export class main extends Component {
    @property(dragonBones.ArmatureDisplay)
    armDisplay !: dragonBones.ArmatureDisplay;
    @property(Node)
    inputBeginFrame !: Node;
    @property(Node)
    inputEndFrame !: Node;
    @property(Label)
    frameTipLabel !: Label;

    armatureComp !: dragonBones.Armature;
    animationState !: dragonBones.AnimationState;
    armAnimation !: dragonBones.Animation;
    setPlayTime : number = 0; // 设置播放的最长时间

    beginProgress : number = 0;
    endProgress : number = 0;
    isLoop : boolean = false; // 是否循环
    totalTimes : number = 0; // 总时长

    beginTime : number = 0;
    visualFrameRate : number = 30; // (虚拟) 帧率
    visualFrames : number = 0; // (虚拟)总帧数
    visualSecondsPerFrame : number = 0; // (虚拟)每帧时间

    start () {
        this.armatureComp = this.armDisplay.armature();
        this.animationState = this.armatureComp.animation.getState("idle")!;
        this.armAnimation = this.armatureComp.animation;

        this.totalTimes = this.animationState.totalTime || 0;
        this.visualFrames = Math.ceil(this.totalTimes * this.visualFrameRate) || 0;
        this.visualSecondsPerFrame = 1 / this.visualFrameRate;

        this.frameTipLabel.string = `总帧数 ${this.visualFrames}`;
    }

    // 按照指定帧(虚拟)播放
    onFrameClick () {
        let beginStr = this.inputBeginFrame.getComponent(EditBox)!.string;
        let endStr = this.inputEndFrame.getComponent(EditBox)!.string;
        let beginIndex = parseInt(beginStr) || 1;
        let endIndex = parseInt(endStr) || this.visualFrames;

        this.beginTime = beginIndex * this.visualSecondsPerFrame;
        this.setPlayTime = endIndex * this.visualSecondsPerFrame;
        this.isLoop = false;

        this.doFramePlay();
    }

    doFramePlay () {
        this.animationState.stop();
        this.animationState.currentTime = this.totalTimes * this.beginTime;

        this.scheduleOnce(()=>{
            this.animationState.play();
        }, 0.1);
    }

    // 按照进度播放  百分比
    onProgressClick () {
        // 按下 从 25% 进度开始 到 75% 停止
        this.beginProgress = 0.25;
        this.endProgress = 0.75;
        this.isLoop = false;
        this.setPlayTime = this.endProgress * this.totalTimes;

        this.doProgressPlay();
    }

    // 按照进度播放 (循环)  百分比
    onProgressLoopClick () {
        this.beginProgress = 0.5;
        this.endProgress = 1;
        this.isLoop = true;
        this.setPlayTime = this.endProgress * this.totalTimes;

        this.doProgressPlay();
    }

    doProgressPlay () {
        this.animationState.stop();
        this.animationState.currentTime = this.totalTimes * this.beginProgress;
        if (this.isLoop) {
            this.animationState.playTimes = 0;
        } else {
            this.animationState.playTimes = -1;
        }

        this.scheduleOnce(()=>{
            this.animationState.play();
        }, 0.1);
    }

    update (dt: number) {
        if (this.animationState) {
            const diffTime = this.animationState.currentTime - this.setPlayTime;
            // 容错误差 0.03
            if (diffTime >= 0 || Math.abs(diffTime) < 3e-2) {
                if (!this.isLoop) {
                    this.armAnimation.stop();
                } else {
                    this.armAnimation.stop();
                    this.animationState.currentTime = this.totalTimes * this.beginProgress;

                    this.scheduleOnce(()=>{
                        this.animationState.play();
                    }, 0.1);
                }
            }
        }
    }
}
