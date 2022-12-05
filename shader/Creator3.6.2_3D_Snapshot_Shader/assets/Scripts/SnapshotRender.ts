import { _decorator, Component, Node, Label, Camera, Sprite, RenderTexture, Material, gfx, SpriteFrame, UITransform, view, director, Director, ModelComponent, Size } from 'cc';
import { SnapshotFilter } from './SnapshotFilter';
const { ccclass, property } = _decorator;

@ccclass('SnapshotRender')
export class SnapshotRender extends Component {
    @property([Sprite])
    steps: Sprite[] = [];

    @property(Camera)
    runners: Camera[] = [];

    @property(Sprite)
    preview: Sprite = null;

    @property(Material)
    model_depth: Material = null;

    flow = 0;
    pool_a: RenderTexture[] = [];
    pool_b: RenderTexture[] = [];
    model: ModelComponent = null;
    model_normal: Material = null;

    snapshot: Camera = null!;

    get src(): RenderTexture {
        return this.snapshot.targetTexture;
    }

    get dst(): RenderTexture {
        return null!;
    }

    setSnapshot(target: Camera) {
        this.snapshot = target;

        let viewsize = new Size(view.getFrameSize().width * view.getDevicePixelRatio(), view.getFrameSize().height * view.getDevicePixelRatio());
        target.targetTexture = this.temporary(viewsize.width, viewsize.height, gfx.Format.RGBA8);

        // 宽屏适配

        let ratio = viewsize.width / viewsize.height
        let trs = this.preview.getComponent(UITransform);
        trs.setContentSize(trs.contentSize.height * ratio, trs.contentSize.height);

        this.steps.forEach(spr => {
            trs = spr.getComponent(UITransform);
            trs.setContentSize(trs.contentSize.height * ratio, trs.contentSize.height);
        })

        director.on(Director.EVENT_BEGIN_FRAME, () => {
            this.runners.forEach(cam => {
                cam.enabled = false;
                cam.targetTexture = null;
            });

            this.steps.forEach(step => {
                step.spriteFrame = null;
            })
        })
    }

    blit(src: RenderTexture, dst: RenderTexture, mat?: Material, genDepth?: boolean) {
        if (genDepth && this.model.material.parent != this.model_depth) {
            this.model_normal = new Material();
            this.model_normal.copy(this.model.material);
            this.model.setMaterial(this.model_depth, 0);
        }
        else if (!genDepth && this.model_normal && this.model.material.parent == this.model_depth) {
            this.model.setMaterialInstance(this.model_normal, 0);
        }

        if (dst != null) {
            this.steps[this.flow].setMaterialInstance(mat, 0);

            let frame = new SpriteFrame();
            frame.texture = src;

            this.steps[this.flow].spriteFrame = frame;

            // this has error, alway swap to default effect.
            // this.steps[this.flow].enabled = true;

            this.runners[this.flow].targetTexture = dst;
            this.runners[this.flow].enabled = true;

            this.flow++;
        }
        else {
            this.preview.setMaterialInstance(mat, 0);

            let frame = new SpriteFrame();
            frame.texture = src;
            this.preview.spriteFrame = frame;

            this.flow = 0;
        }
    }

    temporary(width: number, height: number, fmt: gfx.Format | any): RenderTexture {
        if (this.pool_a.length > 0) {
            return this.pool_a.shift();
        }

        let renderTex = new RenderTexture();

        const _colorAttachment = new gfx.ColorAttachment();
        _colorAttachment.format = fmt;

        const _depthStencilAttachment = new gfx.DepthStencilAttachment();
        _depthStencilAttachment.format = gfx.Format.DEPTH_STENCIL;

        renderTex.initialize({
            width: width,
            height: height,
            passInfo: new gfx.RenderPassInfo([_colorAttachment], _depthStencilAttachment)
        })

        return renderTex;
    }

    releaseTemporary(tmp: RenderTexture) {
        this.pool_b.push(tmp);
    }

    lateUpdate() {
        this.pool_a = this.pool_b;
        this.pool_b = [];
    }
}

