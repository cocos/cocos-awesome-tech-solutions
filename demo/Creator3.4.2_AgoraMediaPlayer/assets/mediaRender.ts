
import { _decorator, Component, Node, Sprite, Texture2D, UITransform, ImageAsset, Color, macro, SpriteFrame } from 'cc';
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
    sprite: Sprite = null;
    texture: Texture2D = null;
    raw: Uint8Array = null;
    width = 1920;
    height = 1080;

    start() {
        this.raw = new Uint8Array(this.width * this.height * 4);
        this.sprite = this.node.getComponent(Sprite);

        var image = new ImageAsset();
        image.reset({
            _data: this.raw,
            width: this.width,
            height: this.height,
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
        });

        this.texture = new Texture2D();
        this.texture.image = image;
        
        let spriteFrame = new SpriteFrame();
        spriteFrame.packable = false;
        spriteFrame.texture = this.texture;
        this.sprite.spriteFrame = spriteFrame;

        this.schedule(() => {
            // @ts-ignore
            var size = jsb.MediaPlayer.getInstance().getFrameData(this.raw, this.width, this.height);
            if (size.width == 0) return;
            let image = new ImageAsset({
                _data: this.raw,
                width: size.width,
                height: size.height,
                format: Texture2D.PixelFormat.RGBA8888,
                _compressed: false
            });


            if (this.texture) {
                this.texture.destroy();
                this.texture = null;
            }

            this.texture = new Texture2D();
            this.texture.image = image;
   
            let spriteFrame = new SpriteFrame();
            spriteFrame.packable = false;
            spriteFrame.texture = this.texture;
            this.sprite.spriteFrame = spriteFrame;
        }, 0.1, macro.REPEAT_FOREVER);        
    }

    onStop() {
        // @ts-ignore
        jsb.MediaPlayer.getInstance().stop();
    }

    onOpen() {
        // @ts-ignore
        jsb.MediaPlayer.getInstance().open();
    }

    onPlay() {
        // @ts-ignore
        jsb.MediaPlayer.getInstance().play();
    }
}
