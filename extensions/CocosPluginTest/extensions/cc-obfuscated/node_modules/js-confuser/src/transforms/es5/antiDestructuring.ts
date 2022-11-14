import { ok } from "assert";
import Template from "../../templates/template";
import { getBlock, walk } from "../../traverse";
import {
  ArrayExpression,
  ArrayPattern,
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  ConditionalExpression,
  Identifier,
  Literal,
  MemberExpression,
  Node,
  ReturnStatement,
  SequenceExpression,
  ThisExpression,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import {
  getBlockBody,
  prepend,
  clone,
  getIndexDirect,
} from "../../util/insert";
import Transform from "../transform";

/**
 * Removes destructuring from function parameters.
 *
 * ```
 * // input
 * function({property}){
 * }
 *
 * // output
 * function(){
 *  var [{property}] = arguments;
 * }
 *
 * // input
 * var fn = ({property})=>{};
 *
 * // output
 * var fn = (_)=>{
 *  var [{property}] = [_];
 * }
 * ```
 */
class AntiDestructuringParameters extends Transform {
  constructor(o) {
    super(o);
  }

  match(object: Node, parents: Node[]) {
    return (object.param || object.params) && object.body;
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      if (object.param) {
        // Catch clause
        if (object.param.type != "Identifier") {
          var catchName = this.getPlaceholder();
          var cloned = { ...object.param };

          object.param = Identifier(catchName);

          getBlockBody(object.body).unshift(
            VariableDeclaration([
              VariableDeclarator(cloned, Identifier(catchName)),
            ])
          );
        }

        return;
      }

      // For function parameters
      var isDestructed = false;
      var parameters = object.params;

      walk(parameters, [object, ...parents], (o, p) => {
        if (
          o.type == "ArrayPattern" ||
          o.type == "ObjectPattern" ||
          o.type == "AssignmentPattern" ||
          o.type == "RestElement"
        ) {
          isDestructed = true;
          return "EXIT";
        }
      });

      if (isDestructed) {
        if (object.expression) {
          object.body = BlockStatement([ReturnStatement({ ...object.body })]);
        } else if (object.body.type != "BlockStatement") {
          object.body = BlockStatement([{ ...object.body }]);
        }

        var arrayPattern = ArrayPattern(parameters);

        // `arguments` is not allowed in arrow functions
        if (
          object.type == "ArrowFunctionExpression" &&
          !object.params.find((x) => x.type == "RestElement")
        ) {
          // new names

          object.params = Array(object.params.length)
            .fill(0)
            .map(() => Identifier(this.getPlaceholder()));

          getBlockBody(object.body).unshift(
            VariableDeclaration(
              VariableDeclarator(arrayPattern, ArrayExpression(object.params))
            )
          );
        } else {
          object.params = [];

          getBlockBody(object.body).unshift(
            VariableDeclaration(
              VariableDeclarator(
                arrayPattern,
                Template(`Array.prototype.slice.call(arguments)`).single()
                  .expression
              )
            )
          );

          if (object.type == "ArrowFunctionExpression") {
            object.type = "FunctionExpression";
            object.expression = false;

            this.replace(
              object,
              CallExpression(
                MemberExpression(clone(object), Identifier("bind"), false),
                [ThisExpression()]
              )
            );
          }
        }
      }
    };
  }
}

/**
 * Removes destructuring so the script can work in ES5 environments.
 */
export default class AntiDestructuring extends Transform {
  constructor(o) {
    super(o);

    this.before.push(new AntiDestructuringParameters(o));
  }

  match(object: Node, parents: Node[]) {
    return (
      object.type == "AssignmentExpression" ||
      object.type == "VariableDeclarator"
    );
  }

  transform(object: Node, parents: Node[]) {
    var block = getBlock(object, parents);

    var body = getBlockBody(block);

    var temp = this.getPlaceholder();

    var exprs = [];
    var names: Set<string> = new Set();
    var operator = "=";

    var id = null; // The object being set
    var extracting = null; // The object being extracted from
    if (object.type == "AssignmentExpression") {
      id = object.left;
      extracting = object.right;
      operator = object.operator;
    } else if (object.type == "VariableDeclarator") {
      id = object.id;
      extracting = object.init;
    } else {
      ok(false);
    }

    var should = false;
    walk(id, [], (o, p) => {
      if (o.type && o.type.includes("Pattern")) {
        should = true;
      }
    });

    if (should) {
      prepend(
        block,
        VariableDeclaration([VariableDeclarator(Identifier(temp))])
      );

      const recursive = (x: Node, realm: Node) => {
        realm = clone(realm);

        if (x.type == "Identifier") {
          exprs.push(AssignmentExpression(operator, clone(x), realm));

          names.add(x.name);
        } else if (x.type == "ObjectPattern") {
          x.properties.forEach((property) => {
            recursive(
              property.value,
              MemberExpression(realm, property.key, property.computed)
            );
          });
        } else if (x.type == "ArrayPattern") {
          x.elements.forEach((element, i) => {
            if (element) {
              if (element.type == "RestElement") {
                if (i != x.elements.length - 1) {
                  this.error(
                    new Error(
                      "Uncaught SyntaxError: Rest element must be last element"
                    )
                  );
                }
                recursive(
                  element.argument,
                  CallExpression(
                    MemberExpression(realm, Identifier("slice"), false),
                    [Literal(i)]
                  )
                );
              } else {
                recursive(element, MemberExpression(realm, Literal(i), true));
              }
            }
          });
        } else if (x.type == "AssignmentPattern") {
          var condition = ConditionalExpression(
            BinaryExpression("===", realm, Identifier("undefined")),
            x.right,
            realm
          );
          recursive(x.left, condition);
        } else {
          throw new Error("unknown type: " + x.type);
        }
      };

      recursive(id, Identifier(temp));

      return () => {
        var seq = SequenceExpression([
          AssignmentExpression(
            "=",
            Identifier(temp),
            clone(extracting) || Identifier("undefined")
          ),
          ...exprs,
        ]);

        if (object.type == "VariableDeclarator") {
          var i = getIndexDirect(object, parents);

          var extra = Array.from(names).map((x) => {
            return {
              type: "VariableDeclarator",
              id: Identifier(x),
              init: null,
            };
          });

          extra.push({
            type: "VariableDeclarator",
            id: Identifier(this.getPlaceholder()),
            init: seq,
          });

          parents[0].splice(i, 1, ...extra);
        } else {
          this.replace(object, seq);
        }
      };
    }
  }
}
