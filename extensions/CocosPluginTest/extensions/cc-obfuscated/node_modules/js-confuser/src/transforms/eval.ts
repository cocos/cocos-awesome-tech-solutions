import { compileJsSync } from "../compiler";
import { ObfuscateOrder } from "../order";
import { ComputeProbabilityMap } from "../probability";
import { isBlock } from "../traverse";
import {
  CallExpression,
  Identifier,
  Literal,
  Node,
  VariableDeclaration,
  VariableDeclarator,
} from "../util/gen";
import { isFunction, prepend } from "../util/insert";
import Transform from "./transform";

export default class Eval extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.Eval);
  }

  match(object, parents) {
    return (
      isFunction(object) &&
      object.type != "ArrowFunctionExpression" &&
      !object.$eval &&
      !object.$dispatcherSkip
    );
  }

  transform(object, parents) {
    if (
      !ComputeProbabilityMap(
        this.options.eval,
        (x) => x,
        object.id && object.id.name
      )
    ) {
      return;
    }

    object.$eval = (o, p) => {
      var name;
      var requiresMove = false;
      if (object.type == "FunctionDeclaration") {
        name = object.id.name;
        object.type = "FunctionExpression";
        object.id = null;
        requiresMove = Array.isArray(p[0]) && isBlock(p[1]);
      }

      var code = compileJsSync(object, this.options);
      if (object.type == "FunctionExpression") {
        code = "(" + code + ")";
      }

      var literal = Literal(code);

      var expr: Node = CallExpression(Identifier("eval"), [literal]);
      if (name) {
        expr = VariableDeclaration(VariableDeclarator(name, expr));
      }

      if (requiresMove) {
        prepend(p[1], expr);
        p[0].splice(p[0].indexOf(object), 1);
      } else {
        this.replace(object, expr);
      }
    };
  }
}
