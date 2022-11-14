"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compileJsSync = compileJsSync;
exports.default = compileJs;

const escodegen = require("escodegen");

async function compileJs(tree, options) {
  return compileJsSync(tree, options);
}

function compileJsSync(tree, options) {
  var api = {
    format: { ...escodegen.FORMAT_MINIFY
    }
  };

  if (!options.compact) {
    api = {};

    if (options.indent && options.indent != 4) {
      api.format = {};
      api.format.indent = {
        style: {
          2: "  ",
          tabs: "\t"
        }[options.indent] || "    "
      };
    }
  }

  if (options.debugComments) {
    api.comment = true;
  }

  return escodegen.generate(tree, api);
}