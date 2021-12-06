
import { _decorator, Component, Node, Sprite, SpriteFrame, assetManager, resources, Enum, Asset, BufferAsset } from 'cc';
import { EDITOR } from 'cc/env';
import { GIFCache } from "./GIF";

const { ccclass, property, requireComponent, executeInEditMode } = _decorator;

/**
 * Predefined variables
 * Name = GIFComponent
 * DateTime = Thu Nov 18 2021 18:18:11 GMT+0800 (中国标准时间)
 * Author = Koei
 * FileBasename = GIFComponent.ts
 * FileBasenameNoExtension = GIFComponent
 * URL = db://assets/GIF/GIFComponent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
enum LOADTYPE {
    LOCAL = 0,
    REMOTE = 1,//单选
    RESOURCES = 2,//多选
}

@ccclass('GIFComponent')
@executeInEditMode
@requireComponent(Sprite)
export class GIFComponent extends Component {


    public delays = [];
    public gifSp: Sprite;
    public frames: SpriteFrame[] = [];
    //加载类型
    @property
    private _loadMode: LOADTYPE = LOADTYPE.LOCAL;
    @property({
        type: Enum(LOADTYPE),
        tooltip: '加载类型'
    })
    set loadMode(val: LOADTYPE) {
        this.initData();
        this._loadMode = val;
    }
    get loadMode() {
        return this._loadMode;
    }
    @property({ type: Asset, visible: false })
    private _gif: Asset = null;

    get gif() { return this._gif; }
    @property({ type: Asset, visible() { return this.loadMode == LOADTYPE.LOCAL } })
    set gif(gif: Asset) {
        this._gif = gif;
        this.localPath = gif.toString();
        this.loadUrl(this.localPath);
    }
    @property({ type: String, visible() { return this.loadMode == LOADTYPE.REMOTE; } })
    _remoteUrl: string = ''

    set remoteUrl(v: string) {
        this._remoteUrl = v;
    }
    get remoteUrl() {
        return this._remoteUrl;
    }

    @property({ type: String, visible() { return this.loadMode == LOADTYPE.RESOURCES; } })
    _resourcesPath: string = '';
    set resourcesPath(v: string) {
        this._resourcesPath = v;
    }
    get resourcesPath() {
        return this._resourcesPath;
    }
    //本地路径
    private localPath: string = '';
    public setLocalPath(path: string) {
        this.localPath = path

    }
    frameIdx = 0;

    start() {
        // [3]
        if (this.loadMode != LOADTYPE.LOCAL && EDITOR) {
            return;
        }
        this.gifSp = this.node.getComponent(Sprite);
        if (this._gif) {
            this.setLocalPath(this._gif.toString())

        }
        if (this._resourcesPath.length > 0) {

            this.loadResources();
        } else {
            console.log(this.localPath, ' localpath')
            let path = this.localPath == '' ? this._remoteUrl : this.localPath;

            this.loadUrl(path);

        }
    }

    initData() {
        this._gif = null;
        this._remoteUrl = '';
        this._resourcesPath = '';
    }

    //resources 动态加载
    loadResources() {
        if (EDITOR) return;
        GIFCache.getInstance();

        resources.load(this._resourcesPath,Asset, (err, data: any) => {
            console.log(err, data, ' =====loadData');
            if (err) {
                console.error(err, '加载失败');

                return;
            }
            this.delays = data._nativeAsset.delays.map(v => v / 1e2);
            this.frames = data._nativeAsset.spriteFrames;
            this.play(true, false);
        })

    }

    //远程或者本地加载
    loadUrl(url) {
        console.log(url, ' ==url ', this.remoteUrl)
        if (url == '') return;

        GIFCache.getInstance();

        assetManager.loadAny({ url: url }, (err, data: any) => {
            console.log(err, data, '  data');
            if (err) {
                return;
            }
            this.delays = data.delays.map(v => v / 1e2);
            this.frames = data.spriteFrames;
            this.play(true, false);
        })

    }


    play(loop, playNext) {

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
