
import { _decorator, Component, Node, Label, Material, Color, EffectAsset, RenderTexture, find, CCObject, gfx, Texture2D, builtinResMgr, renderer, director, Director, game, Vec4 } from 'cc';
import { SnapshotRender } from './SnapshotRender';

export abstract class SnapshotFilter {
    protected mainMaterial: Material = null;
    protected name: string = "";
    protected color: Color = new Color();

    constructor(name: string, color: Color, shader: EffectAsset) {
        this.name = name;
        this.color = color;

        this.mainMaterial = new Material();
        this.mainMaterial.initialize({ effectName: name, effectAsset: shader });
    }

    abstract OnRenderImage(render: SnapshotRender, src: RenderTexture, dst: RenderTexture);

    public GetName(): string {
        return this.name;
    }

    public GetColor(): Color {
        return this.color;
    }
}

export class BaseFilter extends SnapshotFilter {
    pass0: renderer.MaterialInstance;
    needDepth: boolean = false;

    constructor(name: string, color: Color, shader: EffectAsset, needDepth?: boolean) {
        super(name, color, shader);
        this.needDepth = needDepth;
        this.pass0 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass0.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true
        }, 0);
    }

    OnRenderImage(render: SnapshotRender, src: RenderTexture, dst: RenderTexture) {
        render.blit(src, dst, this.pass0, this.needDepth);
    }
}

export class BlurFilter extends SnapshotFilter {
    pass0: renderer.MaterialInstance;
    pass1: renderer.MaterialInstance;
    constructor(name: string, color: Color, shader: EffectAsset) {
        super(name, color, shader);
        this.pass0 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass0.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true
        }, 0);
        this.pass1 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass1.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true,
            USE_VERTICAL: true
        }, 0);
    }

    OnRenderImage(render: SnapshotRender, src: RenderTexture, dst: RenderTexture) {
        // Create a temporary RenderTexture to hold the first pass.
        let tmp: RenderTexture = render.temporary(src.width, src.height, src.getPixelFormat());

        this.pass0.setProperty('_textureSize', new Vec4(1200, 800))
        this.pass1.setProperty('_textureSize', new Vec4(1200, 800))

        // Perform both passes in order.
        render.blit(src, tmp, this.pass0);   // First pass.
        render.blit(tmp, dst, this.pass1);   // Second pass.

        render.releaseTemporary(tmp);
    }
}

export class BloomFilter extends SnapshotFilter {
    pass0: renderer.MaterialInstance;
    pass1: renderer.MaterialInstance;

    private blur: BlurFilter = null;
    // IDs of each pass inside the shader.
    private thresholdPass = 0;
    private horizontalPass = 1;
    private verticalPass = 2;
    private bloomPass = 3;

    constructor(name: string, color: Color, shader: EffectAsset, blur: BlurFilter) {
        super(name, color, shader);
        this.blur = blur;

        this.pass0 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass0.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true
        }, 0);
        this.pass0.setProperty('threshold', 0.58);

        this.pass1 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass1.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true,
            USE_PASS2: true,
        }, 0);
    }

    OnRenderImage(render: SnapshotRender, src: RenderTexture, dst: RenderTexture) {
        // Create a temporary RenderTexture to hold the first pass.
        let thresholdTex: RenderTexture = render.temporary(src.width, src.height, src.getPixelFormat());
        render.blit(src, thresholdTex, this.pass0);

        let blurTex: RenderTexture = render.temporary(src.width, src.height, src.getPixelFormat());
        this.blur.OnRenderImage(render, thresholdTex, blurTex);
        render.releaseTemporary(thresholdTex);

        this.pass1.setProperty("srcTexture", src);
        render.blit(blurTex, dst, this.pass1);
        render.releaseTemporary(blurTex);
    }
}

export class NeonFilter extends BaseFilter {
    pass0: renderer.MaterialInstance;
    private bloom: BloomFilter = null;

    constructor(name: string, color: Color, shader: EffectAsset, bloom: BloomFilter) {
        super(name, color, shader);
        this.bloom = bloom;

        this.pass0 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass0.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true
        }, 0);
    }

    OnRenderImage(render: SnapshotRender, src: RenderTexture, dst: RenderTexture) {
        let tmp: RenderTexture = render.temporary(src.width, src.height, src.getPixelFormat());
        if (this.bloom) {
            render.blit(src, tmp, this.pass0);
            this.bloom.OnRenderImage(render, tmp, dst);
        }
        else {
            render.blit(src, dst, this.pass0);
        }
        render.releaseTemporary(tmp);
    }
}

export class PixelFilter extends SnapshotFilter {
    private pixelSize = 3;
    private pass0: renderer.MaterialInstance;
    private pass1: renderer.MaterialInstance;

    constructor(name: string, color: Color, shader: EffectAsset) {
        super(name, color, shader);
        this.pass0 = new renderer.MaterialInstance({ parent: builtinResMgr.get(`ui-sprite-material`) });
        this.pass0.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true,
        }, 0);
        this.pass1 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass1.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true,
            USE_VERTICAL: true
        }, 0);
    }

    OnRenderImage(render: SnapshotRender, src: RenderTexture, dst: RenderTexture) {
        let width = src.width / this.pixelSize;
        let height = src.height / this.pixelSize;

        let tmp: RenderTexture = render.temporary(width, height, src.getPixelFormat());

        // Make sure the upsampling does not interpolate.
        src.setFilters(Texture2D.Filter.NEAREST, Texture2D.Filter.NEAREST);

        // Obtain a smaller version of the source input.
        render.blit(src, tmp, this.pass0);
        render.blit(tmp, dst, this.pass1);

        render.releaseTemporary(tmp);
    }
}

export class CRTFilter extends BaseFilter {
    private pixelFilter: PixelFilter = null!;
    private brightness = 27.0;
    private contrast = 2.1;

    constructor(name: string, color: Color, shader: EffectAsset, pixelFilter: PixelFilter) {
        super(name, color, shader);
        this.pixelFilter = pixelFilter;

        this.pass0 = new renderer.MaterialInstance({ parent: this.mainMaterial });
        this.pass0.recompileShaders({
            USE_TEXTURE: true,
            SAMPLE_FROM_RT: true,
        }, 0);
        this.pass0.setProperty("_Brightness", this.brightness);
        this.pass0.setProperty("_Contrast", this.contrast);
    }

    OnRenderImage(render: SnapshotRender, src: RenderTexture, dst: RenderTexture) {
        let tmp: RenderTexture = render.temporary(src.width, src.height, src.getPixelFormat());
        this.pixelFilter.OnRenderImage(render, src, tmp);
        render.blit(tmp, dst, this.pass0);
        render.releaseTemporary(tmp);
    }
}
