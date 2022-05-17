
import { _decorator, Component, Node, Sprite, Texture2D, UITransform, ImageAsset, Color } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = mediaRender
 * DateTime = Thu May 12 2022 11:17:20 GMT+0800 (中国标准时间)
 * Author = linruimin
 * FileBasename = mediaRender.ts
 * FileBasenameNoExtension = mediaRender
 * URL = db://assets/mediaRender.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('mediaRender')
export class mediaRender extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    sprite : Sprite = null;
    texture : Texture2D = null;
    img : ImageAsset = null;
    width = 1920;
    height = 1080;

    start () {
        this.sprite = this.node.getComponent(Sprite);
        this.texture = new Texture2D();
        this.img = new ImageAsset();
        this.img.reset({
            _data: null,
            width: this.width,
            height: this.height,
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
        });
        this.texture.image = this.img;
        this.sprite.spriteFrame.texture = this.texture;
    }

    onStop()
    {
        jsb.MediaPlayer.getInstance().stop();
    }

    onOpen()
    {
        jsb.MediaPlayer.getInstance().open();
    }

    onPlay()
    {
        this.isShow = true;
        jsb.MediaPlayer.getInstance().play();
    }

    isShow = false;
    time = 0;
    update (deltaTime: number) {
        
        this.time += deltaTime;
        if (this.isShow && this.time > 0.1)
        {
            this.time = 0;
            this.resetTexture();
        }
       
    }

    resetTexture()
    {
        let data = jsb.MediaPlayer.getInstance().getFrameData();
        if (data === null || data == undefined || data == "" || data.byteLength == 0)
        {
            return;
        }

        let dataNew = new Uint8Array(data);

        let image = new ImageAsset({
            _data: dataNew,
            width: this.width,
            height: this.height,
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
        });
        this.texture.image = image;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
