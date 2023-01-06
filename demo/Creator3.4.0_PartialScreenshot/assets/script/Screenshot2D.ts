
import { _decorator, Component, Node, Camera, RenderTexture, director, gfx, ImageAsset, renderer, view, Size, Texture2D, SpriteFrame, Sprite, UITransform, spriteAssembler, sys, Vec2, Canvas, warnID, log, error, Button, assetManager, instantiate, Vec3, Label } from 'cc';
import { JSB, PREVIEW } from 'cc/env';
import { Canvas2Image } from "./Canvas2Image";
const { ccclass, property } = _decorator;

@ccclass('Screenshot2D')
export class Screenshot2D extends Component {

    @property(Camera)
    copyCamera: Camera = null!;

    @property(Node)
    targetNode: Node = null!;

    @property(Button)
    downloaderBtn: Button = null!;

    @property(Node)
    copyNode: Node = null!;

    @property(Label)
    tips: Label = null!;

    rt: RenderTexture = null;

    _canvas: HTMLCanvasElement = null!;

    _buffer: ArrayBufferView = null!;

    canvas2image: Canvas2Image = null!;

    start() {
        this.canvas2image = Canvas2Image.getInstance();
        this.rt = new RenderTexture();
        this.rt.reset({
            width: view.getVisibleSize().width,
            height: view.getVisibleSize().height,
        })
        this.copyCamera.targetTexture = this.rt;
        this.scheduleOnce(() => {
            this.capture();
        }, 2)
    }

    capture() {
        this.copyRenderTex();
    }

    copyRenderTex() {
        var width = this.targetNode.getComponent(UITransform).width;
        var height = this.targetNode.getComponent(UITransform).height;
        var worldPos = this.targetNode.getWorldPosition();
        this._buffer = this.rt.readPixels(Math.round(worldPos.x), Math.round(worldPos.y), width, height);
        this.showImage(width, height);
    }

    showImage(width, height) {
        let img = new ImageAsset();
        img.reset({
            _data: this._buffer,
            width: width,
            height: height,
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
        });
        let texture = new Texture2D();
        texture.image = img;
        let sf = new SpriteFrame();
        sf.texture = texture;
        sf.packable = false;
        this.copyNode!.getComponent(Sprite).spriteFrame = sf;
        this.copyNode!.getComponent(Sprite).spriteFrame.flipUVY = true;
        if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
            this.copyNode!.getComponent(Sprite).spriteFrame.flipUVY = false;
        }
        this.copyNode?.getComponent(UITransform)?.setContentSize(new Size(width, height));
        this.downloaderBtn.node.active = true;
        this.tips.string = `截图成功`;
    }

    savaAsImage(width, height, arrayBuffer) {
        if (sys.isBrowser) {
            if (!this._canvas) {
                this._canvas = document.createElement('canvas');
                this._canvas.width = width;
                this._canvas.height = height;
            } else {
                this.clearCanvas();
            }
            let ctx = this._canvas.getContext('2d')!;
            let rowBytes = width * 4;
            for (let row = 0; row < height; row++) {
                let sRow = height - 1 - row;
                let imageData = ctx.createImageData(width, 1);
                let start = sRow * width * 4;
                for (let i = 0; i < rowBytes; i++) {
                    imageData.data[i] = arrayBuffer[start + i];
                }
                ctx.putImageData(imageData, 0, row);
            }
            //@ts-ignore
            this.canvas2image.saveAsPNG(this._canvas, width, height);
            this.tips.string = `保存图片成功`;
        } else if (sys.isNative) {
            //@ts-ignore
            let filePath = jsb.fileUtils.getWritablePath() + 'render_to_sprite_image.png';

            //目前 3.0.0 ~ 3.4.0 版本还不支持 jsb.saveImageData , 引擎将在 3.6.1 支持。
            //目前此方案仅支持在 android 和 ios 上将 imageData 保存为本地 png 文件：https://gitee.com/zzf2019/engine-native/commit/4af67e64a1caeb951016a9920efb7ee46d479ae5 12

            //@ts-ignore
            if (jsb.saveImageData) {
                //@ts-ignore
                let success = jsb.saveImageData(this._buffer, width, height, filePath);
                if (success) {
                    // 用于测试图片是否正确保存到本地设备路径下
                    assetManager.loadRemote<ImageAsset>(filePath, (err, imageAsset)=> {
                        if (err) {
                            console.log("show image error")
                        } else {
                            var newNode = instantiate(this.targetNode);
                            newNode.setPosition(new Vec3(-newNode.position.x, newNode.position.y, newNode.position.z));
                            this.targetNode.parent.addChild(newNode);
                            
                            const spriteFrame = new SpriteFrame();
                            const texture = new Texture2D();
                            texture.image = imageAsset;
                            spriteFrame.texture = texture;
                            newNode.getComponent(Sprite).spriteFrame = spriteFrame;
                            spriteFrame.packable = false;
                            spriteFrame.flipUVY = true;
                            if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                                spriteFrame.flipUVY = false;
                            }
    
                            this.tips.string = `成功保存在设备目录并加载成功: ${filePath}`;
                        }
                    });
                    log("save image data success, file: " + filePath);
                    this.tips.string = `成功保存在设备目录: ${filePath}`;
                }
                else {
                    error("save image data failed!");
                    this.tips.string = `保存图片失败`;
                }
            }
        } else if (sys.platform === sys.Platform.WECHAT_GAME) {
            if (!this._canvas) {
                //@ts-ignore
                this._canvas = wx.createCanvas();
                this._canvas.width = width;
                this._canvas.height = height;
            } else {
                this.clearCanvas();
            }
            var ctx = this._canvas.getContext('2d');

            var rowBytes = width * 4;

            for (var row = 0; row < height; row++) {
                var sRow = height - 1 - row;
                var imageData = ctx.createImageData(width, 1);
                var start = sRow * width * 4;

                for (var i = 0; i < rowBytes; i++) {
                    imageData.data[i] = arrayBuffer[start + i];
                }

                ctx.putImageData(imageData, 0, row);
            }
            //@ts-ignore
            this._canvas.toTempFilePath({
                x: 0,
                y: 0,
                width: this._canvas.width,
                height: this._canvas.height,
                destWidth: this._canvas.width,
                destHeight: this._canvas.height,
                fileType: "png",
                success: (res) =>{
                    //@ts-ignore
                    wx.showToast({
                        title: "截图成功"
                    });
                    this.tips.string = `截图成功`;
                    //@ts-ignore
                    wx.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: (res)=> {
                            //@ts-ignore              
                            wx.showToast({
                                title: "成功保存到设备相册",
                            });
                            this.tips.string = `成功保存在设备目录: ${res.tempFilePath}`;
                        },
                        fail: ()=> {
                            this.tips.string = `保存图片失败`;
                        }
                    })
                },
                fail: ()=> {
                    //@ts-ignore
                    wx.showToast({
                        title: "截图失败"
                    });
                    this.tips.string = `截图失败`;
                }
            })
        }
    }

    clearCanvas() {
        let ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    onSaveImageBtnClicked() {
        var width = this.targetNode.getComponent(UITransform).width;
        var height = this.targetNode.getComponent(UITransform).height;
        this.savaAsImage(width, height, this._buffer)
    }
}
