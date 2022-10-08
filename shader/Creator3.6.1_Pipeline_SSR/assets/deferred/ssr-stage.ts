import { _decorator, RenderStage, gfx, Material, RenderFlow, renderer, pipeline, RenderPipeline } from "cc";
import { convertRenderQueue, getPhaseID, RenderQueue, renderQueueClearFunc, RenderQueueDescEx, renderQueueSortFunc } from "./ssr_queue";

const { ccclass, property } = _decorator;

@ccclass("SSRStage")
export class SSRStage extends RenderStage {

    private _sampleBuffer: gfx.Buffer = null!;
    private _sampleBufferData!: Float32Array;

    public static initInfo = {
        name: 'SSRStage',
        priority: 12,
        tag: 0,
    };

    private _renderArea = new gfx.Rect();
    protected _renderQueues: RenderQueue[] = [];

    @property(Material)
    private renderMaterial: Material | null = null;

    @property(RenderQueueDescEx)
    protected renderQueues: RenderQueueDescEx[] = [];

    activate(pipeline: RenderPipeline, flow: RenderFlow) {
        super.activate(pipeline, flow);
        for (let i = 0; i < this.renderQueues.length; i++) {
            this._renderQueues[i] = convertRenderQueue(this.renderQueues[i]);
        }
    }

    render(camera: renderer.scene.Camera) {
        const deferred = this._pipeline as RenderPipeline;
        const device = deferred.device;
        const cmdBuff = deferred.commandBuffers[0];
        this._renderQueues.forEach(renderQueueClearFunc);

        deferred.pipelineUBO.updateCameraUBO(camera);
        deferred.generateRenderArea(camera, this._renderArea);

        const renderObjects = deferred.pipelineSceneData.renderObjects;

        let m = 0; let p = 0; let k = 0;
        for (let i = 0; i < renderObjects.length; ++i) {
            const ro = renderObjects[i];
            const subModels = ro.model.subModels;
            for (m = 0; m < subModels.length; ++m) {
                const subModel = subModels[m];
                const passes = subModel.passes;
                for (p = 0; p < passes.length; ++p) {
                    const pass = passes[p];
                    if (pass.phase != getPhaseID('ssr')) {
                        continue;
                    }
                    for (k = 0; k < this._renderQueues.length; k++) {
                        this._renderQueues[k].insertRenderPass(ro, m, p);
                    }
                }
            }
        }
        this._renderQueues.forEach(renderQueueSortFunc);

        const deferredData = deferred.getPipelineRenderData();
        const framebuffer = deferredData.outputFrameBuffer;
        const renderPass = framebuffer.renderPass;

        // don't do clear
        cmdBuff.beginRenderPass(renderPass, framebuffer, this._renderArea, [], camera.clearDepth, camera.clearStencil);
        cmdBuff.bindDescriptorSet(pipeline.SetIndex.GLOBAL, deferred.descriptorSet);

        const pass = this.renderMaterial!.passes[0];
        for (var i = 0; i < 3; ++i) {
            // @ts-ignore
            pass.descriptorSet.bindTexture(i, deferredData.gbufferRenderTargets[i]);
            pass.descriptorSet.bindSampler(i, deferredData.sampler);
        }

        pass.descriptorSet.bindTexture(3, deferredData.outputDepth);
        pass.descriptorSet.bindSampler(3, deferredData.sampler);
        pass.descriptorSet.update();

        cmdBuff.bindDescriptorSet(pipeline.SetIndex.MATERIAL, pass.descriptorSet);
        for (let i = 0; i < this.renderQueues.length; i++) {
            this._renderQueues[i].recordCommandBuffer(device, renderPass, cmdBuff);
        }

        cmdBuff.endRenderPass();
    }

    public destroy() {
        this._sampleBuffer?.destroy();
        this._sampleBuffer = null!;
    }

}
