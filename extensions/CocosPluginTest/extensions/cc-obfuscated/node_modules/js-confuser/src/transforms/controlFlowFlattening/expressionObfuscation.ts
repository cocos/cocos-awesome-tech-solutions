import { isBlock } from "../../traverse";
import { Identifier, SequenceExpression } from "../../util/gen";
import Transform from "../transform";

export default class ExpressionObfuscation extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return isBlock(object);
  }

  transform(object, parents) {
    return () => {
      var exprs = [];
      var deleteExprs = [];

      object.body.forEach((stmt, i) => {
        if (stmt.type == "ExpressionStatement") {
          var expr = stmt.expression;

          if (expr.type == "UnaryExpression" && exprs.length) {
            expr.argument = SequenceExpression([
              ...exprs,
              { ...expr.argument },
            ]);
            deleteExprs.push(...exprs);

            exprs = [];
          } else {
            exprs.push(expr);
          }
        } else {
          if (exprs.length) {
            if (stmt.type == "IfStatement") {
              if (
                stmt.test.type == "BinaryExpression" &&
                stmt.test.operator !== "**"
              ) {
                if (stmt.test.left.type == "UnaryExpression") {
                  stmt.test.left.argument = SequenceExpression([
                    ...exprs,
                    { ...stmt.test.left.argument },
                  ]);
                } else {
                  stmt.test.left = SequenceExpression([
                    ...exprs,
                    { ...stmt.test.left },
                  ]);
                }
              } else if (
                stmt.test.type == "LogicalExpression" &&
                stmt.test.left.type == "BinaryExpression" &&
                stmt.test.operator !== "**" &&
                stmt.test.left.left.type == "UnaryExpression"
              ) {
                stmt.test.left.left.argument = SequenceExpression([
                  ...exprs,
                  { ...stmt.test.left.left.argument },
                ]);
              } else {
                stmt.test = SequenceExpression([...exprs, { ...stmt.test }]);
              }
              deleteExprs.push(...exprs);
            } else if (
              stmt.type == "ForStatement" ||
              (stmt.type == "LabeledStatement" &&
                stmt.body.type == "ForStatement")
            ) {
              var init = (stmt.type == "LabeledStatement" ? stmt.body : stmt)
                .init;

              if (init) {
                if (init.type == "VariableDeclaration") {
                  init.declarations[0].init = SequenceExpression([
                    ...exprs,
                    {
                      ...(init.declarations[0].init || Identifier("undefined")),
                    },
                  ]);
                  deleteExprs.push(...exprs);
                } else if (init.type == "AssignmentExpression") {
                  init.right = SequenceExpression([
                    ...exprs,
                    {
                      ...(init.right || Identifier("undefined")),
                    },
                  ]);
                  deleteExprs.push(...exprs);
                }
              }
            } else if (stmt.type == "VariableDeclaration") {
              stmt.declarations[0].init = SequenceExpression([
                ...exprs,
                {
                  ...(stmt.declarations[0].init || Identifier("undefined")),
                },
              ]);
              deleteExprs.push(...exprs);
            } else if (stmt.type == "ThrowStatement") {
              stmt.argument = SequenceExpression([
                ...exprs,
                { ...stmt.argument },
              ]);
              deleteExprs.push(...exprs);
            } else if (stmt.type == "ReturnStatement") {
              stmt.argument = SequenceExpression([
                ...exprs,
                { ...(stmt.argument || Identifier("undefined")) },
              ]);
              deleteExprs.push(...exprs);
            }
          }

          exprs = [];
        }
      });

      deleteExprs.forEach((expr) => {
        var index = object.body.findIndex((x) => x.expression === expr);
        if (index !== -1) {
          object.body.splice(index, 1);
        }
      });
    };
  }
}
