
import { _decorator, Component, Node, Label, sys } from 'cc';
import { NATIVE } from 'cc/env';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Main
 * DateTime = Tue May 24 2022 17:45:11 GMT+0800 (中国标准时间)
 * Author = muxiandong
 * FileBasename = main.ts
 * FileBasenameNoExtension = main
 * URL = db://assets/script/main.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
 
@ccclass('Main')
export class Main extends Component {
    @property(Node)
    audioPanel : Node = null!;
    @property(Node)
    videoPanel : Node = null!;
    @property(Label)
    tagLabel : Label = null!;

    isVideo : boolean = false;

    start () {
        let aLabel = this.audioPanel.getChildByName('platform').getComponent(Label);
        let bLabel = this.videoPanel.getChildByName('platform').getComponent(Label);

        aLabel.string = sys.platform;
        bLabel.string = sys.platform;
    }

    onChangeClick () {
        this.isVideo = !this.isVideo;
        this.audioPanel.active = false;
        this.videoPanel.active = false;
        if (this.isVideo) {
            this.videoPanel.active = true;
            this.tagLabel.string = "切换到音频";
        } else {
            this.audioPanel.active = true;
            this.tagLabel.string = "切换到视频";
        }
    }
}
