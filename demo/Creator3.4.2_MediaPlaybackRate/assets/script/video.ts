
import { _decorator, Component, Node, AudioSource, SystemEvent, EventMouse, log, EventKeyboard, KeyCode, ToggleComponent, AssetManager, assetManager, resources, AudioClip, Slider, Label, VideoPlayer, sys } from 'cc';
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

@ccclass('Video')
export class Video extends Component {
    @property(VideoPlayer)
    videoPlayer: VideoPlayer = null!;
    @property(Label)
    labCurrentRate : Label = null!;
    @property(Node)
    decreaseRate : Node = null!;
    @property(Node)
    increaseRate : Node = null!;

    @property(Label)
    labTime : Label = null!;
    
    playbackRate = 1.0;
    currentTime = 0.0;
    minValueA : number = 0;
    maxValueA : number = 1;
    minValueB : number = 0;
    maxValueB : number = 100;

    start() {
        if (NATIVE) {
            if (sys.platform == sys.Platform.IOS) {
                this.minValueA = 0;
                this.maxValueA = 1;
                this.minValueB = 1;
                this.maxValueB = 100;
            } else if (sys.platform == sys.Platform.ANDROID) {
                this.minValueA = 0;
                this.maxValueA = 1;
                this.minValueB = 1;
                this.maxValueB = 20;
            }
        } else {
            this.minValueA = 0;
            this.maxValueA = 1;
            this.minValueB = 1;
            this.maxValueB = 16;
        }

        this.decreaseRate.getChildByName('min').getComponent(Label).string = this.minValueA + '';
        this.decreaseRate.getChildByName('max').getComponent(Label).string = this.maxValueA + '';
        this.increaseRate.getChildByName('min').getComponent(Label).string = this.minValueB + '';
        this.increaseRate.getChildByName('max').getComponent(Label).string = this.maxValueB + '';


        this.resetRate();
        this.play();
    }

    clickStop()
    {
        this.videoPlayer.stop();
    }

    play()
    {
        this.currentTime = 0.0;
        this.videoPlayer.playbackRate = this.playbackRate;
        this.videoPlayer.play();
    }

    changeDecreaseRate (slider: Slider) {
        this.playbackRate = slider.progress * (this.maxValueA - this.minValueA) + this.minValueA;

        this.afterChangeRate();
    }

    changeIncreaseRate(slider: Slider){
        this.playbackRate = slider.progress * (this.maxValueB - this.minValueB) + 1;

        this.afterChangeRate();
    }

    afterChangeRate()
    {
        this.videoPlayer.stop();

        this.resetRate();
        
        this.play();
    }

    resetRate () {
        this.labCurrentRate.string = `当前倍速：${ this.playbackRate.toFixed(2) }倍`
    }

    update (deltaTime: number) {
        this.currentTime += deltaTime;
        this.labTime.string = `播放时间：${this.videoPlayer.currentTime.toFixed(2)}, 系统时间：${ this.currentTime.toFixed(2) }`
    }
}