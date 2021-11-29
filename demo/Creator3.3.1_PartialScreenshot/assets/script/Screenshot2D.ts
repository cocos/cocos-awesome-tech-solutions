
import { _decorator, Component, Node, Camera, RenderTexture, director, gfx, ImageAsset, renderer, view, Size, Texture2D, SpriteFrame, Sprite, UITransform, spriteAssembler, sys, Vec2 } from 'cc';
import { JSB, PREVIEW } from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('Screenshot2D')
export class Screenshot2D extends Component {

    @property(Camera)
    copyCamera: Camera = null!;

    @property(Node)
    targetNode: Node = null!;

    rt: RenderTexture = null;

    @property(Node)
    CopyNode: Node = null!;

    start() {
        if (PREVIEW && sys.isNative) {
            console.log("模拟器预览暂时有 bug，不支持使用，如果需要请构建发布测试");
            return;
        }
        this.rt = new RenderTexture();
        this.rt.reset({
            width: view.getVisibleSize().width,
            height: view.getVisibleSize().height,
        })
        this.copyCamera.targetTexture = this.rt;
        this.scheduleOnce(()=>{
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
        var rt = this.rt;
        var texBuffers : ArrayBufferView[] = [];
        texBuffers[0] = new Uint8Array(width * height * 4);
        var region = new gfx.BufferTextureCopy();
        region.texOffset.x = worldPos.x;
        region.texOffset.y = worldPos.y;
        region.texExtent.width = width;
        region.texExtent.height = height;
        director.root.device.copyTextureToBuffers(rt.getGFXTexture(), texBuffers, [region]);
        this.showImage(width, height, texBuffers[0]);
    }

    showImage (width, height, arrayBuffer) {
        let img = new ImageAsset();
        img.reset({
            _data: arrayBuffer,
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
        this.CopyNode!.getComponent(Sprite).spriteFrame = sf;
        this.CopyNode!.getComponent(Sprite).spriteFrame.flipUVY = true;
        this.CopyNode?.getComponent(UITransform)?.setContentSize(new Size(width, height));
        this.targetNode.destroy();
    }
    
    setShoot()
    {
        let width = 80;
        let height = 80;
        let texture = new RenderTexture();
        const colorAttachment = new gfx.ColorAttachment();
        colorAttachment.loadOp = gfx.LoadOp.LOAD;
        colorAttachment.endAccesses = [gfx.AccessType.FRAGMENT_SHADER_READ_TEXTURE];
        // colorAttachment.endLayout = gfx.TextureLayout.SHADER_READONLY_OPTIMAL;
        const depthStencilAttachment = new gfx.DepthStencilAttachment();
        const passInfo = new gfx.RenderPassInfo([colorAttachment], depthStencilAttachment);
        texture.reset({ width: width, height: height, passInfo: passInfo });
    }
}


























