import { gfx, pipeline } from "cc";
const { DescriptorSetLayoutBinding, UniformSamplerTexture, DescriptorType, ShaderStageFlagBit, Type } = gfx;
const { SetIndex, PipelineGlobalBindings, globalDescriptorSetLayout } = pipeline;

let GlobalBindingStart = PipelineGlobalBindings.COUNT;
let GlobalBindingIndex = 0;

const UNIFORM_SSAOMAP_NAME = 'cc_ssaoMap';
export const UNIFORM_SSAOMAP_BINDING = GlobalBindingStart + GlobalBindingIndex++;
const UNIFORM_SSAOMAP_DESCRIPTOR = new DescriptorSetLayoutBinding(UNIFORM_SSAOMAP_BINDING, DescriptorType.SAMPLER_TEXTURE, 1, ShaderStageFlagBit.FRAGMENT);
const UNIFORM_SSAOMAP_LAYOUT = new UniformSamplerTexture(SetIndex.GLOBAL, UNIFORM_SSAOMAP_BINDING, UNIFORM_SSAOMAP_NAME, Type.SAMPLER2D, 1);
globalDescriptorSetLayout.layouts[UNIFORM_SSAOMAP_NAME] = UNIFORM_SSAOMAP_LAYOUT;
globalDescriptorSetLayout.bindings[UNIFORM_SSAOMAP_BINDING] = UNIFORM_SSAOMAP_DESCRIPTOR;

export class UBOSsao {
    public static readonly SAMPLES_SIZE = 64;

    public static readonly CAMERA_NEAR_FAR_LINEAR_INFO_OFFSET = 0;
    public static readonly SSAO_SAMPLES_OFFSET = UBOSsao.CAMERA_NEAR_FAR_LINEAR_INFO_OFFSET + 4;

    public static readonly COUNT = (UBOSsao.SAMPLES_SIZE + 1) * 4;
    public static readonly SIZE = UBOSsao.COUNT * 4;

    public static readonly NAME = 'CCSsao';
    public static readonly BINDING = GlobalBindingStart + GlobalBindingIndex++;
    public static readonly DESCRIPTOR = new gfx.DescriptorSetLayoutBinding(UBOSsao.BINDING, gfx.DescriptorType.UNIFORM_BUFFER, 1, gfx.ShaderStageFlagBit.ALL);
    public static readonly LAYOUT = new gfx.UniformBlock(SetIndex.GLOBAL, UBOSsao.BINDING, UBOSsao.NAME, [
        new gfx.Uniform('cc_cameraNFLSInfo', gfx.Type.FLOAT4, 1),
        new gfx.Uniform('ssao_samples', gfx.Type.FLOAT4, UBOSsao.SAMPLES_SIZE),
    ], 1);
}
globalDescriptorSetLayout.layouts[UBOSsao.NAME] = UBOSsao.LAYOUT;
globalDescriptorSetLayout.bindings[UBOSsao.BINDING] = UBOSsao.DESCRIPTOR;
