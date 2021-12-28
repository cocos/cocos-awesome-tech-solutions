import { _decorator, Component, Node, SkeletalAnimation, SkeletalAnimationState, EditBox, Label } from 'cc';
const { ccclass, property } = _decorator;

const WALK_BEGIN_TIME = 0;
const DANCE_BEGIN_TIME = 2;
const WALK_TIME = 1.3;

@ccclass('Main')
export class Main extends Component {

    @property(SkeletalAnimation)
    skeletalAnim! : SkeletalAnimation;
    @property(Node)
    inputBeginFrame !: Node;
    @property(Node)
    inputEndFrame !: Node;
    @property(Label)
    frameTipLabel !: Label;


    skeletalAnimState! : SkeletalAnimationState;
    setPlayTime : number = 0; // 设置播放的最长时间
    isLoop : boolean = false; // 是否循环
    mode : number = 0; // 0走路 1跳舞 2全播

    frames : number = 0; // 总帧数
    secondsPerFrame : number = 0; // 每帧时间

    start () {
        this.skeletalAnimState = <SkeletalAnimationState>this.skeletalAnim.node.getComponent(SkeletalAnimation)!.getState("donghua");

        let duration = this.skeletalAnimState.duration || 0;
        let frameRate = this.skeletalAnimState.frameRate || 0;
        this.frames = Math.ceil(duration * frameRate);

        this.secondsPerFrame = (1 / frameRate) || 0;
        this.frameTipLabel.string = `总帧数 ${this.frames}`;
    }

    onClickFramePlay () {
        let beginStr = this.inputBeginFrame.getComponent(EditBox)!.string;
        let endStr = this.inputEndFrame.getComponent(EditBox)!.string;
        let beginIndex = parseInt(beginStr) || 1;
        let endIndex = parseInt(endStr) || this.frames;

        let beginTime = beginIndex * this.secondsPerFrame;
        let endTime = endIndex * this.secondsPerFrame;
        
        if (this.skeletalAnimState) {
            this.isLoop = false;
            this.skeletalAnimState.setTime(beginTime);
            this.skeletalAnimState.play();

            if (endTime >= this.skeletalAnimState.duration) endTime = this.skeletalAnimState.duration;
            this.setPlayTime = endTime;
        }
    }

    // 走
    onClickWalk () {
        if (this.skeletalAnimState) {
            this.isLoop = false;
            this.doSetWalk();
        }
    }

    // 跳舞
    onClickDance () {
        if (this.skeletalAnimState) {
            this.isLoop = false;
            this.doSetDance();
        }
    }

    // 全播
    onClickPlay () {
        if (this.skeletalAnimState) {
            this.isLoop = false;
            this.doPlay();
        }
    }

    // 循环走
    onClickLoopWalk () {
        if (this.skeletalAnimState) {
            this.isLoop = true;
            this.mode = 0;
            this.doSetWalk();
        }
    }

    // 循环跳舞
    onClickLoopDance () {
        if (this.skeletalAnimState) {
            this.isLoop = true;
            this.mode = 1;
            this.doSetDance();
        }
    }

    // 循环全播
    onClickLoopPlay () {
        if (this.skeletalAnimState) {
            this.isLoop = true;
            this.mode = 2;
            this.doPlay();
        }
    }

    update (dt: number) {
        if (this.skeletalAnimState) {
            if (this.skeletalAnimState.time > this.setPlayTime) {
                if (this.isLoop) {
                    if (this.mode === 0) this.doSetWalk();
                    if (this.mode === 1) this.doSetDance();
                    if (this.mode === 2) this.doPlay();
                    return ;
                }

                this.skeletalAnimState.stop();
            }
        }
    }

    doSetWalk () {
        this.skeletalAnimState.setTime(WALK_BEGIN_TIME);
        this.skeletalAnimState.play();
        this.setPlayTime = WALK_TIME;
    }

    doSetDance () {
        this.skeletalAnimState.setTime(DANCE_BEGIN_TIME);
        this.skeletalAnimState.play();
        this.setPlayTime = this.skeletalAnimState.length;
        this.skeletalAnimState.time = DANCE_BEGIN_TIME;
    }

    doPlay () {
        this.skeletalAnimState.setTime(0);
        this.skeletalAnimState.play();
        this.setPlayTime = this.skeletalAnimState.length;
        this.skeletalAnimState.time = 0;
    }
}
