import TransformClass from "./src/transforms/transform";
import ObfuscatorClass from "./src/obfuscator";
import {
  IJsConfuser as JsConfuser,
  IJsConfuserDebugObfuscation,
  IJsConfuserDebugTransformations,
  IJsConfuserObfuscate,
  IJsConfuserObfuscateAST,
  IJsConfuserPresets,
} from "./src/types";

export default JsConfuser;
export const obfuscate: IJsConfuserObfuscate;
export const obfuscateAST: IJsConfuserObfuscateAST;
export const presets: IJsConfuserPresets;
export const debugTransformations: IJsConfuserDebugTransformations;
export const debugObfuscation: IJsConfuserDebugObfuscation;
export const Obfuscator: typeof ObfuscatorClass;
export const Transform: typeof TransformClass;
