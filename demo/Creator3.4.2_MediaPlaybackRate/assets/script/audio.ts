
import { _decorator, Component, Node, AudioSource, SystemEvent, EventMouse, log, EventKeyboard, KeyCode, ToggleComponent, AssetManager, assetManager, resources, AudioClip, Slider, Label, sys } from 'cc';
import { NATIVE } from 'cc/env';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Music
 * DateTime = Mon Oct 25 2021 18:15:30 GMT+0800 (中国标准时间)
 * Author = linruimin
 * FileBasename = music.ts
 * FileBasenameNoExtension = music
 * URL = db://assets/audiosource/music.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('Audio')
export class Audio extends Component {

    @property(AudioSource)
    audioSource: AudioSource = null!;
    @property(Label)
    labCurrentRate : Label = null!;
    @property(Label)
    labTime : Label = null!;
    @property(Node)
    decreaseRate : Node = null!;
    @property(Node)
    increaseRate : Node = null!;

    playbackRate = 1.0;
    currentTime = 0.0;

    minValueA : number = 0;
    maxValueA : number = 1;
    minValueB : number = 0;
    maxValueB : number = 100;

    start () {
        if (NATIVE) {
            if (sys.platform == sys.Platform.IOS) {
                this.minValueA = 0.3;
                this.maxValueA = 1;
                this.minValueB = 1;
                this.maxValueB = 100;
            } else if (sys.platform == sys.Platform.ANDROID) {
                this.minValueA = 0.5;
                this.maxValueA = 1;
                this.minValueB = 1;
                this.maxValueB = 2;
            }
        } else {
            this.minValueA = 0;
            this.maxValueA = 1;
            this.minValueB = 1;
            this.maxValueB = 100;
        }

        this.decreaseRate.getChildByName('min').getComponent(Label).string = this.minValueA + '';
        this.decreaseRate.getChildByName('max').getComponent(Label).string = this.maxValueA + '';
        this.increaseRate.getChildByName('min').getComponent(Label).string = this.minValueB + '';
        this.increaseRate.getChildByName('max').getComponent(Label).string = this.maxValueB + '';

        this.resetRate();
        this.play();
    }

    play () {
        this.currentTime = 0.0;
        // @ts-ignore
        this.audioSource.playbackRate = this.playbackRate;
        this.audioSource.play();
    }

    onToggleSoundSize (toggle: ToggleComponent) {
        this.audioSource.stop();
        resources.load(toggle.node.name, AudioClip, (err, clip) => {
            console.log(clip);

            // 超过 100kb 的音频，只能 1倍倍数播放
            // if (clip.name == 'more') {

            // }
            
            this.audioSource.clip = clip;
            this.play();
        });
    }

    changeDecreaseRate(slider: Slider){
        this.playbackRate = slider.progress * (this.maxValueA - this.minValueA) + this.minValueA;
        this.afterChangeRate();
    }

    changeIncreaseRate(slider: Slider){
        this.playbackRate = slider.progress * (this.maxValueB - this.minValueB) + 1;
        this.afterChangeRate();
    }

    afterChangeRate()
    {
        this.audioSource.stop();

        this.resetRate();
        
        this.play();
    }

    resetRate()
    {
        this.labCurrentRate.string = `当前倍速：${ this.playbackRate.toFixed(2) }倍`
    }

    update (deltaTime: number) {
        this.currentTime += deltaTime;
        this.labTime.string = `播放时间：${this.audioSource.currentTime.toFixed(2)}, 系统时间：${ this.currentTime.toFixed(2) }`
    }
}
