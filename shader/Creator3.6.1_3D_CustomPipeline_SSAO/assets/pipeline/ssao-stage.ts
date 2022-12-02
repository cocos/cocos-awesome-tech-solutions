import { DeferredPipeline, gfx, Material, pipeline as Pipeline, PipelineStateManager, renderer, RenderFlow, RenderStage, Vec3, _decorator, lerp } from "cc";
import { UBOSsao } from "./uboDefine";
import { SsaoRenderPipeline } from "./ssao-render-pipeline";
const { ccclass, property } = _decorator;

const colors: gfx.Color[] = [new gfx.Color(0, 0, 0, 1)];

@ccclass("SsaoStage")
export class SsaoStage extends RenderStage {
    private _sampleBuffer: gfx.Buffer = null!;
    private _sampleBufferData!: Float32Array;

    public static initInfo = {
        name: 'SsaoStage',
        priority: 12,
        tag: 0,
    };

    @property(Material)
    private ssaoMaterial: Material | null = null;
    private _renderArea = new gfx.Rect();

    activate(pipeline: DeferredPipeline, flow: RenderFlow) {
        super.activate(pipeline, flow);

        const device = pipeline.device;


        this._sampleBuffer = device.createBuffer(new gfx.BufferInfo(
            gfx.BufferUsageBit.UNIFORM | gfx.BufferUsageBit.TRANSFER_DST,
            gfx.MemoryUsageBit.HOST | gfx.MemoryUsageBit.DEVICE,
            UBOSsao.SIZE,
            UBOSsao.SIZE,
        ));

        this._sampleBufferData = new Float32Array(UBOSsao.COUNT);

        const sampleOffset = UBOSsao.SSAO_SAMPLES_OFFSET / 4;
        for (let i = 0; i < UBOSsao.SAMPLES_SIZE; i++) {
            let sample = new Vec3(
                Math.random() * 2.0 - 1.0,
                Math.random() * 2.0 - 1.0,
                Math.random() + 0.01,
            );
            sample = sample.normalize();
            let scale = i / UBOSsao.SAMPLES_SIZE;
            scale = lerp(0.1, 1.0, scale * scale);
            sample.multiplyScalar(scale);
            const index = 4 * (i + sampleOffset);
            this._sampleBufferData[index + 0] = sample.x;
            this._sampleBufferData[index + 1] = sample.y;
            this._sampleBufferData[index + 2] = sample.z;
        }
        this._pipeline.descriptorSet.bindBuffer(UBOSsao.BINDING, this._sampleBuffer);
    }

    render(camera: renderer.scene.Camera) {
        const ssaoPipeline = this._pipeline as SsaoRenderPipeline;
        const device = ssaoPipeline.device;
        const cmdBuff = ssaoPipeline.commandBuffers[0];
        // camera Uniform
        this._sampleBufferData[UBOSsao.CAMERA_NEAR_FAR_LINEAR_INFO_OFFSET] = camera.nearClip;
        this._sampleBufferData[UBOSsao.CAMERA_NEAR_FAR_LINEAR_INFO_OFFSET + 1] = camera.farClip;
        this._sampleBufferData[UBOSsao.CAMERA_NEAR_FAR_LINEAR_INFO_OFFSET + 3] = 1 / camera.nearClip;
        this._sampleBufferData[UBOSsao.CAMERA_NEAR_FAR_LINEAR_INFO_OFFSET + 2] = 1 / camera.farClip;

        cmdBuff.updateBuffer(this._sampleBuffer, this._sampleBufferData);

        ssaoPipeline.pipelineUBO.updateCameraUBO(camera);

        this._pipeline.generateRenderArea(camera, this._renderArea);

        if (camera.clearFlag & gfx.ClearFlagBit.COLOR) {
            colors[0].x = camera.clearColor.x;
            colors[0].y = camera.clearColor.y;
            colors[0].z = camera.clearColor.z;
        }

        colors[0].w = camera.clearColor.w;

        const deferredData = ssaoPipeline.getPipelineRenderData();
        const ssaoRenderData = ssaoPipeline.getSsaoRenderData(camera);
        const framebuffer = ssaoRenderData.frameBuffer!;
        const renderPass = framebuffer.renderPass;

        cmdBuff.beginRenderPass(renderPass, framebuffer, this._renderArea,
            colors, camera.clearDepth, camera.clearStencil);

        cmdBuff.bindDescriptorSet(Pipeline.SetIndex.GLOBAL, ssaoPipeline.descriptorSet);

        // ssaoMaterialPass
        const pass = this.ssaoMaterial!.passes[0];
        for (var i = 0; i < 3; ++i) {
            pass.descriptorSet.bindTexture(i, deferredData.gbufferRenderTargets[i]);
            pass.descriptorSet.bindSampler(i, deferredData.sampler);
        }

        pass.descriptorSet.bindTexture(3, deferredData.outputDepth);
        pass.descriptorSet.bindSampler(3, deferredData.sampler);
        pass.descriptorSet.update();

        const shader = pass.getShaderVariant();
        cmdBuff.bindDescriptorSet(Pipeline.SetIndex.MATERIAL, pass.descriptorSet);

        const inputAssembler = ssaoPipeline.quadIAOffscreen;
        let pso: gfx.PipelineState | null = null;
        if (pass != null && shader != null && inputAssembler != null) {
            pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, inputAssembler);
        }

        if (pso != null) {
            cmdBuff.bindPipelineState(pso);
            cmdBuff.bindInputAssembler(inputAssembler);
            cmdBuff.draw(inputAssembler);
        }

        cmdBuff.endRenderPass();
    }

    public destroy() {
        this._sampleBuffer?.destroy();
        this._sampleBuffer = null!;
    }
}
