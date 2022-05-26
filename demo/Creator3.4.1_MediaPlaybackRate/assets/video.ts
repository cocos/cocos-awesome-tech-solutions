
import { _decorator, Component, Node, AudioSource, SystemEvent, EventMouse, log, EventKeyboard, KeyCode, ToggleComponent, AssetManager, assetManager, resources, AudioClip, Slider, Label, VideoPlayer } from 'cc';
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
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    @property(VideoPlayer)
    videoPlayer: VideoPlayer = null!;

    @property(Label)
    labCurrentRate : Label = null!;

    @property(Label)
    labTime : Label = null!;
    
    playbackRate = 1.0;

    currentTime = 0.0;

    start() {
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

    changeDecreaseRate(slider: Slider){
        this.playbackRate = slider.progress;

        this.afterChangeRate();
    }

    changeIncreaseRate(slider: Slider){
        this.playbackRate = (slider.progress * 99) + 1;

        this.afterChangeRate();
    }

    afterChangeRate()
    {
        this.videoPlayer.stop();

        this.resetRate();
        
        this.play();
    }

    resetRate()
    {
        this.labCurrentRate.string = `当前倍速：${ this.playbackRate }倍`
    }

    update (deltaTime: number) {
        this.currentTime += deltaTime;
        this.labTime.string = `播放时间：${this.videoPlayer.currentTime.toFixed(2)}, 系统时间：${ this.currentTime.toFixed(2) }`
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
