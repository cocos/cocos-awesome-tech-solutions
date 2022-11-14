import compileJs, { compileJsSync } from "./compiler";
import parseJS, { parseSync } from "./parser";
import Obfuscator from "./obfuscator";
import Transform from "./transforms/transform";
import { remove$Properties } from "./util/object";
import presets from "./presets";

import * as assert from "assert";
import { correctOptions, ObfuscateOptions, validateOptions } from "./options";
import {
  IJsConfuser,
  IJsConfuserDebugObfuscation,
  IJsConfuserDebugTransformations,
} from "./types";

/**
 * **JsConfuser**: Obfuscates JavaScript.
 * @param code - The code to be obfuscated.
 * @param options - An object of obfuscation options: `{preset: "medium", target: "browser"}`.
 */
export async function obfuscate(code: string, options: ObfuscateOptions) {
  return await JsConfuser(code, options);
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
export async function obfuscateAST(AST, options: ObfuscateOptions) {
  assert.ok(typeof AST === "object", "AST must be type object");
  assert.ok(AST.type == "Program", "AST.type must be equal to 'Program'");
  validateOptions(options);

  options = await correctOptions(options);

  var obfuscator = new Obfuscator(options);

  await obfuscator.apply(AST);

  options.verbose && console.log("* Removing $ properties");

  remove$Properties(AST);
}

/**
 * **JsConfuser**: Obfuscates JavaScript.
 * @param code - The code to be obfuscated.
 * @param options - An object of obfuscation options: `{preset: "medium", target: "browser"}`.
 */
var JsConfuser: IJsConfuser = async function (
  code: string,
  options: ObfuscateOptions
): Promise<string> {
  if (typeof code !== "string") {
    throw new TypeError("code must be type string");
  }
  validateOptions(options);

  options = await correctOptions(options);

  options.verbose && console.log("* Parsing source code");

  var tree = await parseJS(code);

  options.verbose && console.log("* Obfuscating...");

  var obfuscator = new Obfuscator(options);

  await obfuscator.apply(tree);

  options.verbose && console.log("* Removing $ properties");

  remove$Properties(tree);

  options.verbose && console.log("* Generating code");

  var result = await compileJs(tree, options);

  return result;
} as any;

export var debugTransformations: IJsConfuserDebugTransformations =
  async function debugTransformations(
    code: string,
    options: ObfuscateOptions
  ): Promise<{ name: string; code: string; ms: number }[]> {
    validateOptions(options);
    options = await correctOptions(options);

    var frames = [];

    var tree = parseSync(code);
    var obfuscator = new Obfuscator(options);

    var time = Date.now();

    obfuscator.on("debug", (name: string, tree: Node) => {
      frames.push({
        name: name,
        code: compileJsSync(tree, options),
        ms: Date.now() - time,
      });

      time = Date.now();
    });

    await obfuscator.apply(tree, true);

    return frames;
  };

export var debugObfuscation: IJsConfuserDebugObfuscation =
  async function debugTransformations(
    code: string,
    options: ObfuscateOptions,
    callback: (name: string, complete: number, totalTransforms: number) => void
  ): Promise<string> {
    validateOptions(options);
    options = await correctOptions(options);

    var tree = parseSync(code);
    var obfuscator = new Obfuscator(options);
    var totalTransforms = obfuscator.array.length;

    obfuscator.on("debug", (name: string, tree: Node, i: number) => {
      callback(name, i, totalTransforms);
    });

    await obfuscator.apply(tree, true);

    var output = compileJs(tree, options);
    return output;
  };

JsConfuser.obfuscate = obfuscate;
JsConfuser.obfuscateAST = obfuscateAST;
JsConfuser.presets = presets;
JsConfuser.debugTransformations = debugTransformations;
JsConfuser.debugObfuscation = debugObfuscation;
JsConfuser.Obfuscator = Obfuscator;
JsConfuser.Transform = Transform;

if (typeof window !== "undefined") {
  window["JsConfuser"] = JsConfuser;
}
if (typeof global !== "undefined") {
  global["JsConfuser"] = JsConfuser;
}

export default JsConfuser;

export { presets, Obfuscator, Transform };
