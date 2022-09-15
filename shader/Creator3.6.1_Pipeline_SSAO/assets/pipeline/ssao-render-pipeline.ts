import { _decorator, DeferredPipeline, gfx, renderer, View } from "cc";
import { UNIFORM_SSAOMAP_BINDING } from "./uboDefine";
const { ccclass } = _decorator;

const _samplerInfo = new gfx.SamplerInfo(
    gfx.Filter.POINT,
    gfx.Filter.POINT,
    gfx.Filter.NONE,
    gfx.Address.CLAMP,
    gfx.Address.CLAMP,
    gfx.Address.CLAMP,
);

export class SsaoRenderData {
    frameBuffer?: gfx.Framebuffer | null;
    renderTargets?: gfx.Texture[] | null;
    depthTex?: gfx.Texture | null;
}

@ccclass("SsaoRenderPipeline")
export class SsaoRenderPipeline extends DeferredPipeline {
    protected _width = 0;
    protected _height = 0;

    private _ssaoRenderData: SsaoRenderData | null = null!;
    private _ssaoRenderPass: gfx.RenderPass | null = null;

    public activate(swapchain: gfx.Swapchain): boolean {
        console.log("================= SsaoRenderPipeline")
        const result = super.activate(swapchain);
        this._width = swapchain.width;
        this._height = swapchain.height;
        this._generateSsaoRenderData();
        return result;
    }

    public getSsaoRenderData(camera: renderer.scene.Camera): SsaoRenderData {
        if (!this._ssaoRenderData) {
            this._generateSsaoRenderData();
        }
        return this._ssaoRenderData!;
    }

    private _generateSsaoRenderData() {
        if (!this._ssaoRenderPass) {
            const colorAttachment = new gfx.ColorAttachment();
            colorAttachment.format = gfx.Format.RGBA8;
            colorAttachment.loadOp = gfx.LoadOp.CLEAR;
            colorAttachment.storeOp = gfx.StoreOp.STORE;

            const depthStencilAttachment = new gfx.DepthStencilAttachment();
            depthStencilAttachment.format = this.device.getSwapchains()[0].depthStencilTexture.format;
            depthStencilAttachment.depthLoadOp = gfx.LoadOp.CLEAR;
            depthStencilAttachment.depthStoreOp = gfx.StoreOp.STORE;
            depthStencilAttachment.stencilLoadOp = gfx.LoadOp.CLEAR;
            depthStencilAttachment.stencilStoreOp = gfx.StoreOp.STORE;

            const renderPassInfo = new gfx.RenderPassInfo([colorAttachment], depthStencilAttachment);
            this._ssaoRenderPass = this.device.createRenderPass(renderPassInfo);
        }

        this._ssaoRenderData = new SsaoRenderData();
        this._ssaoRenderData.renderTargets = [];
        this._ssaoRenderData.renderTargets.push(this.device.createTexture(new gfx.TextureInfo(
            gfx.TextureType.TEX2D,
            gfx.TextureUsageBit.COLOR_ATTACHMENT | gfx.TextureUsageBit.SAMPLED,
            gfx.Format.RGBA8,
            this._width,
            this._height,
        )));

        this._ssaoRenderData.depthTex = this.device.createTexture(new gfx.TextureInfo(
            gfx.TextureType.TEX2D,
            gfx.TextureUsageBit.DEPTH_STENCIL_ATTACHMENT,
            this.device.getSwapchains()[0].depthStencilTexture.format,
            this._width,
            this._height,
        ));
        this._ssaoRenderData.frameBuffer = this.device.createFramebuffer(new gfx.FramebufferInfo(
            this._ssaoRenderPass!,
            this._ssaoRenderData.renderTargets,
            this._ssaoRenderData.depthTex,
        ));

        this.descriptorSet.bindTexture(UNIFORM_SSAOMAP_BINDING, this._ssaoRenderData.frameBuffer.colorTextures[0]!);
        const sampler = this.device.getSampler(_samplerInfo);
        this.descriptorSet.bindSampler(UNIFORM_SSAOMAP_BINDING, sampler);
    }


    public destroy(): boolean {
        this._destroyRenderData();
        return super.destroy();
    }

    private _destroyRenderData() {
        if (!this._ssaoRenderData) {
            return;
        }
        if (this._ssaoRenderData.depthTex) {
            this._ssaoRenderData.depthTex.destroy();
        }
        if (this._ssaoRenderData.renderTargets) {
            this._ssaoRenderData.renderTargets.forEach((o) => {
                o.destroy();
            })
        }
        if (this._ssaoRenderData.frameBuffer) {
            this._ssaoRenderData.frameBuffer.destroy();
        }
        this._ssaoRenderData = null;
    }
}
