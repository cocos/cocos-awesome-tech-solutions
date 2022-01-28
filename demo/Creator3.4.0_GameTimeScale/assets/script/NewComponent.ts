
import { _decorator, Component, Node, __private, SkeletalAnimation, Animation, AnimationState, SkeletalAnimationState, ccenum, Enum } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = NewComponent
 * DateTime = Wed Jan 05 2022 17:22:13 GMT+0800 (中国标准时间)
 * Author = zzf520
 * FileBasename = NewComponent.ts
 * FileBasenameNoExtension = NewComponent
 * URL = db://assets/script/NewComponent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

var WrapModeMask = Enum({
    Default: 0,
    Normal: 1,
    Loop: 2,
    ShouldWrap: 4,
    Clamp: 8,
    PingPong: 22,
    Reverse: 36
});

@ccclass('NewComponent')
export class NewComponent extends Component {

    @property(Animation)
    mySkeAni: Animation = null;

    start () {
        var state1 = this.mySkeAni.getState("Gun_trigger|Cube.002Action");
        state1.wrapMode = WrapModeMask.Default;
        state1.speed = 0.1;
        var state2 = this.mySkeAni.getState("muzzle fire|muzzle fire");
        state2.wrapMode = WrapModeMask.Default;
        state2.speed = 0.01;
        this.mySkeAni.on(Animation.EventType.FINISHED, this.playFire, this);
    }

    play () {
        this.mySkeAni.play("Gun_trigger|Cube.002Action");
    }

    playFire () {
        this.mySkeAni.play("muzzle fire|muzzle fire");
        this.mySkeAni.off(Animation.EventType.FINISHED, this.playFire, this)
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
