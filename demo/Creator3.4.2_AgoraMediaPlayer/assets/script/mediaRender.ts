
import { _decorator, Component, Node, Texture2D, ImageAsset, macro, Material, find, Sprite, MeshRenderer } from 'cc';
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
    raw: Uint8Array = null;
    width = 1920;
    height = 1080;

    @property(Node)
    cubeNode !: Node;
    materials : Material[] = [];

    img: ImageAsset = null;
    tex: Texture2D = null;

    start() {
        this.raw = new Uint8Array(this.width * this.height * 4);

        let meshRenderers = this.cubeNode.getComponentsInChildren(MeshRenderer);
        for (let x in meshRenderers) {
            this.materials.push(meshRenderers[x].getMaterial(0));
        }

        this.schedule(() => {
            //@ts-ignore
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
            
            for (let x in this.materials) {
                this.materials[x].setProperty('mainTexture', this.texture);
            }
        }, 0.1, macro.REPEAT_FOREVER);        
    }

    onStop() {
        // @ts-ignore
        jsb.MediaPlayer.getInstance().stop();
    }

    onOpen() {
        // @ts-ignore
        jsb.MediaPlayer.getInstance().open("http://download.cocos.org/CocosTest/test-case/movie.mp4");
    }

    onPlay() {
        // @ts-ignore
        jsb.MediaPlayer.getInstance().play();
    }
}
