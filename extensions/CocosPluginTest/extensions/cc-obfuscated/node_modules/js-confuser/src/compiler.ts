import { ok } from "assert";
import { writeFileSync } from "fs";
import { ObfuscateOptions } from "./options";
import { Node } from "./util/gen";

const escodegen = require("escodegen");

export default async function compileJs(tree: any, options: ObfuscateOptions) {
  return compileJsSync(tree, options);
}

export function compileJsSync(tree: any, options: ObfuscateOptions): string {
  var api: any = {
    format: {
      ...escodegen.FORMAT_MINIFY,
    },
  };

  if (!options.compact) {
    api = {};

    if (options.indent && options.indent != 4) {
      api.format = {};
      api.format.indent = {
        style: { 2: "  ", tabs: "\t" }[options.indent] || "    ",
      };
    }
  }

  if (options.debugComments) {
    api.comment = true;
  }

  return escodegen.generate(tree, api);
}
