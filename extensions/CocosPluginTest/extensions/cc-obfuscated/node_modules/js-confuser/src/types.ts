import Obfuscator from "./obfuscator";
import { ObfuscateOptions } from "./options";
import Transform from "./transforms/transform";

/**
 * **JsConfuser**: Obfuscates JavaScript.
 * @param code - The code to be obfuscated.
 * @param options - An object of obfuscation options: `{preset: "medium", target: "browser"}`.
 *
 * [See all settings here](https://github.com/MichaelXF/js-confuser#options)
 */
export interface IJsConfuser {
  obfuscate: IJsConfuserObfuscate;
  obfuscateAST: IJsConfuserObfuscateAST;

  presets: IJsConfuserPresets;
  debugTransformations: IJsConfuserDebugTransformations;
  debugObfuscation: IJsConfuserDebugObfuscation;

  (code: string, options: ObfuscateOptions): Promise<string>;

  Transform: typeof Transform;
  Obfuscator: typeof Obfuscator;
}

/**
 * **JsConfuser**: Obfuscates JavaScript.
 * @param code - The code to be obfuscated.
 * @param options - An object of obfuscation options: `{preset: "medium", target: "browser"}`.
 *
 * [See all settings here](https://github.com/MichaelXF/js-confuser#options)
 */
export interface IJsConfuserObfuscate {
  (code: string, options: ObfuscateOptions): Promise<string>;
}

/**
 * Obfuscates an [ESTree](https://github.com/estree/estree) compliant AST.
 *
 * **Note:** Mutates the object.
 *
 * @param AST - The [ESTree](https://github.com/estree/estree) compliant AST. This object will be mutated.
 * @param options - The obfuscation options.
 *
 * [See all settings here](https://github.com/MichaelXF/js-confuser#options)
 */
export interface IJsConfuserObfuscateAST {
  (AST: any, options: ObfuscateOptions): Promise<void>;
}

export interface IJsConfuserPresets {
  high: ObfuscateOptions;
  medium: ObfuscateOptions;
  low: ObfuscateOptions;
}

/**
 * Obfuscates code but returns an array of `frames`
 *
 * ```js
 * [
 *  {
 *    name: "Preparation",
 *    code: "console['log']('Hello World')",
 *    ms: 4
 *  }, {
 *    name: "ControlFlowFlattening",
 *    code: "var....",
 *    ms: 400
 *  },
 *  // ....
 * ]
 * ```
 */
export type IJsConfuserDebugTransformations = (
  code: string,
  options: ObfuscateOptions
) => Promise<{ name: string; code: string; ms: number }[]>;

/**
 * Obfuscates code but calls the callback function after each transform.
 *
 * This is used to display a progress bar to the user on the official website.
 *
 * `callback(name: string, complete: number, totalTransforms: number)`
 *
 * ```js
 * var callback = (name, complete, totalTransforms) => {
 *   console.log(name, complete, totalTransforms)
 * };
 * ```
 *
 * ```js
 * // Preparation 1 22
 * // ObjectExtraction 2 22
 * // Flatten 3 22
 * // Dispatcher 4 22
 * // DeadCode 5 22
 * // Calculator 6 22
 * // ControlFlowFlattening 7 22
 * // GlobalConcealing 8 22
 * // OpaquePredicates 9 22
 * // StringSplitting 10 22
 * // StringConcealing 11 22
 * // StringCompression 12 22
 * // HideInitializingCode 13 22
 * // Stack 14 22
 * // DuplicateLiteralsRemoval 15 22
 * // Shuffle 16 22
 * // MovedDeclarations 17 22
 * // RenameVariables 18 22
 * // RenameLabels 19 22
 * // Minify 20 22
 * // StringEncoding 21 22
 * // AntiTooling 22 22
 * ```
 */
export type IJsConfuserDebugObfuscation = (
  code: string,
  options: ObfuscateOptions,
  callback: (name: string, complete: number, totalTransforms: number) => void
) => Promise<string>;
