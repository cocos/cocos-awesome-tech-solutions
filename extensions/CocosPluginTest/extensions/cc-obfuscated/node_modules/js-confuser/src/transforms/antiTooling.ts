import { ObfuscateOrder } from "../order";
import { isBlock } from "../traverse";
import {
  ExpressionStatement,
  SequenceExpression,
  UnaryExpression,
} from "../util/gen";
import { choice } from "../util/random";
import Transform from "./transform";

// JsNice.org tries to separate sequence expressions into multiple lines, this stops that.
export default class AntiTooling extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.AntiTooling);
  }

  match(object, parents) {
    return isBlock(object) || object.type == "SwitchCase";
  }

  transform(object, parents) {
    return () => {
      var exprs = [];
      var deleteExprs = [];

      var body = object.type == "SwitchCase" ? object.consequent : object.body;

      const end = () => {
        function flatten(expr) {
          if (expr.type == "ExpressionStatement") {
            flatten(expr.expression);
          } else if (expr.type == "SequenceExpression") {
            expr.expressions.forEach(flatten);
          } else {
            flattened.push(expr);
          }
        }

        var flattened = [];
        exprs.forEach(flatten);

        if (flattened.length > 1) {
          flattened[0] = { ...flattened[0] };
          this.replace(
            exprs[0],
            ExpressionStatement(
              UnaryExpression(
                choice(["typeof", "void", "~", "!", "+"]),
                SequenceExpression(flattened)
              )
            )
          );

          deleteExprs.push(...exprs.slice(1));
        }
        exprs = [];
      };

      body.forEach((stmt, i) => {
        if (stmt.hidden || stmt.directive) {
          return;
        }
        if (stmt.type == "ExpressionStatement") {
          exprs.push(stmt);
        } else {
          end();
        }
      });

      end();

      deleteExprs.forEach((expr) => {
        var index = body.indexOf(expr);
        if (index !== -1) {
          body.splice(index, 1);
        }
      });
    };
  }
}
