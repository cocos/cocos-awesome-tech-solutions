import { _decorator, Component, Sprite, SpriteFrame, resources, assetManager, CCString } from 'cc';
const { ccclass, property ,executeInEditMode,requireComponent} = _decorator;

import { GIFCache } from "./GIF";
@ccclass('CCGIF')
// @executeInEditMode
@requireComponent(Sprite)
export default class CCGIF extends Component {
    @property
    path: string = '';
    
    public delays = [];
    public gifSp: Sprite;
    public frames: SpriteFrame[] = [];

    onLoad() {
        this.gifSp = this.node.getComponent(Sprite);
    }

    preload() {
        GIFCache.getInstance();

        resources.load(this.path, (err, data: any) => {
            console.log(err, data);
            if (err) {
                console.error(err,'加载失败');
                return;
            }
            this.delays = data._nativeAsset.delays.map(v => v / 1e2);
            this.frames = data._nativeAsset.spriteFrames;
        });
    }

    loadUrl(url) {
        GIFCache.getInstance();

        assetManager.loadAny({ url: url }, (err, data: any) => {
            console.log(err, data, '  data');
            if (err) {
                return;
            }
            this.delays = data.delays.map(v => v / 1e2);
            this.frames = data.spriteFrames;
            this.play(true);
        })

    }
    frameIdx = 0;

    /**
     * 播放Gif
     * @param loop 是否循环
     * @param playNext 是否播放下一个
     * @returns void
     */
    play(loop = false, playNext = false) {
        let self = this;
        if (!playNext) {
            this.stop();
        }
        if (self.frames.length) {
            if (self.frameIdx >= self.frames.length) {
                self.frameIdx = 0;
                if (!loop) {
                    return;
                }
            }
            self.gifSp.spriteFrame = self.frames[self.frameIdx];
            // console.log(self.gifSp, '11111')
            self.scheduleOnce(() => {
                self.play(loop, true);
            }, self.delays[self.frameIdx]);
            self.frameIdx++;
        }
    }

    stop() {
        this.frameIdx = 0;
        this.unscheduleAllCallbacks();
    }
}



