import { _decorator, Component, director, Node, find, UITransform, RenderTexture, gfx, ImageAsset, Sprite, SpriteFrame, Texture2D, view, Color, Camera, Vec3, tween, Vec2, Canvas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {
    @property(Camera)
    copyCamera: Camera | null = null;
    @property(Node)
    copyNode: Node | null = null;
    @property(Node)
    targetNode: Node | null = null;
    @property(Node)
    arrivedNode: Node | null = null;

    renderTex: RenderTexture = null;
    _canvas: HTMLCanvasElement = null;
    _buffer: ArrayBufferView = null;
    tempPos: Vec3 = new Vec3();
    start() {
        this.onResizeCamera();
        this.renderTex = new RenderTexture();
        this.renderTex.reset({
            width: view.getVisibleSize().width,
            height: view.getVisibleSize().height
        });
        this.copyCamera.targetTexture = this.renderTex;
        this.tempPos = this.copyNode.getPosition();
    }
    
    // 由于是单 Canvas 所以需要手动适配截图相机 copyCamera 的配置参数,避免相机视野大小不同,动态切换横竖屏需要自行手动进行相关适配
    // 多canvas 就不用
    onResizeCamera() {
        let worldPos = new Vec3();
        let canvas = find('Canvas').getComponent(Canvas);
        this.copyCamera.orthoHeight = canvas.cameraComponent.orthoHeight;
        this.node.getWorldPosition(worldPos);
        this.copyCamera.node.setWorldPosition(worldPos.x, worldPos.y, 1000);

    }

    // 截图 全屏截图获取指定区域的像素，左下角为原点
    capture() {
        let width = this.targetNode.getComponent(UITransform).contentSize.width;
        let height = this.targetNode.getComponent(UITransform).contentSize.height;
        let worldPos = this.targetNode.getWorldPosition();

        let rt = this.renderTex;
        let texBuffers: ArrayBufferView[] = [];
        // 设置显示区域大小
        texBuffers[0] = new Uint8Array(width * height * 4);
        let region = new gfx.BufferTextureCopy();
        let boxWorld = this.targetNode.getComponent(UITransform).getBoundingBoxToWorld();
        //相对原点偏移值
        region.texOffset.x = boxWorld.x; //Math.round(worldPos.x);
        region.texOffset.y = boxWorld.y; //Math.round(worldPos.y);
        region.texExtent.width = width;
        region.texExtent.height = height;
        // @ts-ignore
        director.root.device.copyTextureToBuffers(rt.getGFXTexture(), texBuffers, [region]);
        this._buffer = texBuffers[0];
        this.showImage(width, height, boxWorld);
    }

    // 将获取到的图片数据赋给指定 sprite
    showImage(width: number, height: number, boxWorld) {
        let img = new ImageAsset();
        img.reset({
            _data: this._buffer,
            width: (width),
            height: height,
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
        });
        let texture = new Texture2D();
        texture.image = img;
        let sf = new SpriteFrame();
        sf.texture = texture;
        sf.packable = false;
        this.copyNode.getComponent(Sprite).spriteFrame = sf;
        this.copyNode.getComponent(Sprite).spriteFrame.flipUVY = true;
        // sprite 的 sizeMode 设置为了 TRIMMED 就不需要设置 contentsize 
        // this.copyNode.getComponent(UITransform).setContentSize(width, height);
        this.copyNode.setPosition(new Vec3(0, 0, 0))
        this.scheduleOnce(() => {
            this.getShowPicRange(this.targetNode, find('Canvas/15'), boxWorld)
        }, 3)
        // this.doCaptureAnim();
    }

    // 设置显示区域
    getShowPicRange(capNode, targetNode, offset) {
        let tWpos = targetNode.getWorldPosition();
        let cWpos = capNode.getWorldPosition();
        let capContentsize = capNode.getComponent(UITransform).contentSize;
        let tarContentsize = targetNode.getComponent(UITransform).contentSize;
        // 要显示的节点包围盒信息
        let tRect = {
            width: tarContentsize.width,
            height: tarContentsize.height,
            maxX: tWpos.x + tarContentsize.width / 2,
            minX: tWpos.x - tarContentsize.width / 2,
            maxY: tWpos.y + tarContentsize.height / 2,
            minY: tWpos.y - tarContentsize.height / 2,
            wPosX: tWpos.x,
            wPosY: tWpos.y,
        };

        // 要模糊的节点包围盒信息
        let cRect = {
            width: capContentsize.width,
            height: capContentsize.height,
            maxX: cWpos.x + capContentsize.width / 2,
            minX: cWpos.x - capContentsize.width / 2,
            maxY: cWpos.y + capContentsize.height / 2,
            minY: cWpos.y - capContentsize.height / 2,
            wPosX: cWpos.x,
            wPosY: cWpos.y,
        };

        //初始相对比例 - 没计算是否相交
        let range = {
            minX: tRect.minX / cRect.width,
            maxX: tRect.maxX / cRect.width,
            maxY: tRect.maxY / cRect.height,
            minY: tRect.minY / cRect.height

        }

        // 偏移比例
        let offsetRange = {
            x: offset.x / cRect.width,
            y: offset.y / cRect.height
        }

        // 获取材质实例对象进行设置
        let mat = this.copyNode.getComponent(Sprite).getMaterialInstance(0);
        // 模糊比例
        // mat.setProperty('texSize',new Vec2(width,height))
        // 非模糊区域范围 （0 - 1）
        mat.setProperty('minX', range.minX - offsetRange.x)
        mat.setProperty('maxX', range.maxX - offsetRange.x)
        mat.setProperty('minY', range.minY - offsetRange.y)
        mat.setProperty('maxY', range.maxY - offsetRange.y)
    }

    // 做截图动画
    doCaptureAnim() {
        if (this.copyNode) {
            let scale_fator = 0.95;
            let arrived_fator = 0.3;
            let pos = this.arrivedNode.getPosition();
            tween(this.copyNode)
                .to(0.2, { scale: new Vec3(scale_fator, scale_fator, 1) })
                .to(0.3, { scale: new Vec3(1, 1, 1) })
                .parallel(
                    tween(this.copyNode).to(0.5, { scale: new Vec3(arrived_fator, arrived_fator, 1) }),
                    tween(this.copyNode).to(0.5, { position: pos })
                ).start();
        }
    }

    // 读取指定区域像素值
    public readPixels(x = 0, y = 0, width: number, height: number, tex: any) {
        width = width;
        height = height;
        const gfxTexture = tex.getGFXTexture();
        if (!gfxTexture) {
            return null;
        }
        const needSize = 4 * width * height;
        let buffer = new Uint8Array(needSize);


        const gfxDevice = tex._getGFXDevice();

        const bufferViews: ArrayBufferView[] = [];
        const regions: gfx.BufferTextureCopy[] = [];

        const region0 = new gfx.BufferTextureCopy();
        region0.texOffset.x = x;
        region0.texOffset.y = y;
        region0.texExtent.width = width;
        region0.texExtent.height = height;
        regions.push(region0);

        bufferViews.push(buffer);
        gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, regions);
        // return buffer;
        let dstTexture = new Texture2D();
        dstTexture.reset({
            width: 500,
            height: 500,
            format: Texture2D.PixelFormat.RGBA8888,
            mipmapLevel: 0
        });
        dstTexture.uploadData(buffer);
        let sp = new SpriteFrame();
        sp.texture = dstTexture;
        find('Canvas/test').getComponent(Sprite).spriteFrame = sp;
    }

    // 生成单色图
    genSpriteFrame(width: number, height: number, color: Color = new Color(255, 255, 255, 255)) {
        const data: Uint8Array = new Uint8Array(width * height * 4);
        for (let i = 0; i < data.byteLength / 4; i++) {
            //R
            data[i * 4 + 0] = color.r;
            //G
            data[i * 4 + 1] = color.g;
            //B
            data[i * 4 + 2] = color.b;
            //A
            data[i * 4 + 3] = color.a;
        }

        const image = new ImageAsset();
        image.reset({
            _data: data,
            _compressed: false,
            width: width,
            height: height,
            format: Texture2D.PixelFormat.RGBA8888
        });

        const texture = new Texture2D()
        texture.image = image;

        const spf = new SpriteFrame();
        spf.texture = texture;

        // 动态生成的纹理，不能参与动态图集
        spf.packable = false;

        return spf;
    }


}

