import { ok } from "assert";
import { stringify } from "querystring";
import { reservedIdentifiers } from "../constants";
import { ObfuscateOrder } from "../order";
import { ComputeProbabilityMap } from "../probability";
import Template from "../templates/template";
import { walk } from "../traverse";
import {
  AssignmentExpression,
  BinaryExpression,
  ExpressionStatement,
  Identifier,
  IfStatement,
  Literal,
  Location,
  MemberExpression,
  Node,
  RestElement,
  ReturnStatement,
  SequenceExpression,
} from "../util/gen";
import { getIdentifierInfo } from "../util/identifiers";
import {
  getDefiningContext,
  getReferencingContexts,
  getVarContext,
  isForInitialize,
  isFunction,
  isVarContext,
  prepend,
} from "../util/insert";
import { choice, getRandomInteger, getRandomString } from "../util/random";
import Transform from "./transform";

export default class Stack extends Transform {
  made: number;

  constructor(o) {
    super(o, ObfuscateOrder.Stack);

    this.made = 0;
  }

  match(object: Node, parents: Node[]) {
    return (
      isFunction(object) &&
      !object.params.find((x) => x.type !== "Identifier") &&
      object.body.type === "BlockStatement" &&
      !parents.find((x) => x.$dispatcherSkip) &&
      !object.$requiresEval
    );
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      // Uncaught SyntaxError: Getter must not have any formal parameters.
      // Uncaught SyntaxError: Setter must have exactly one formal parameter
      var propIndex = parents.findIndex((x) => x.type == "Property");
      if (propIndex !== -1) {
        if (parents[propIndex].value === (parents[propIndex - 1] || object)) {
          if (parents[propIndex].kind !== "init" || parents[propIndex].method) {
            return;
          }
        }
      }

      var defined = new Set<string>();
      var referenced = new Set<string>();
      var illegal = new Set<string>();

      var subscripts = new Map<string, string>();
      var deadValues = Object.create(null);

      function setSubscript(string, index) {
        subscripts.set(string, index + "");
      }

      object.params.forEach((param) => {
        ok(param.name);
        defined.add(param.name);

        setSubscript(param.name, subscripts.size);
      });

      var startingSize = subscripts.size;

      walk(object.body, [object, ...parents], (o, p) => {
        if (o.type == "Identifier") {
          var info = getIdentifierInfo(o, p);
          if (!info.spec.isReferenced) {
            return;
          }
          var c = info.spec.isDefined
            ? getDefiningContext(o, p)
            : getReferencingContexts(o, p).find((x) => isVarContext(x));

          if (c !== object) {
            this.log(o.name + " is illegal due to different context");
            illegal.add(o.name);
          }

          if (
            info.isClauseParameter ||
            info.isFunctionParameter ||
            isForInitialize(o, p)
          ) {
            this.log(
              o.name + " is illegal due to clause parameter/function parameter"
            );
            illegal.add(o.name);
          }
          if (o.hidden) {
            illegal.add(o.name);
          }

          if (info.spec.isDefined) {
            if (defined.has(o.name)) {
              illegal.add(o.name);
            }

            if (info.isFunctionDeclaration) {
              if (p[0] !== object.body.body[0]) {
                illegal.add(o.name);
              }
            }

            setSubscript(o.name, subscripts.size);
            defined.add(o.name);

            var varIndex = p.findIndex((x) => x.type == "VariableDeclaration");
            if (
              varIndex !== -1 &&
              (varIndex !== 2 || p[varIndex].declarations.length > 1)
            ) {
              illegal.add(o.name);
            }
          } else if (info.spec.isReferenced) {
            referenced.add(o.name);
          }
        }
      });

      illegal.forEach((name) => {
        defined.delete(name);
        referenced.delete(name);
        subscripts.delete(name);
      });

      referenced.forEach((name) => {
        if (!defined.has(name)) {
          subscripts.delete(name);
        }
      });

      if (object.params.find((x) => illegal.has(x.name))) {
        return;
      }

      if (!subscripts.size) {
        return;
      }

      function numberLiteral(number, depth = 0) {
        ok(number === number);
        if (
          typeof number !== "number" ||
          !Object.keys(deadValues).length ||
          depth > 5 ||
          Math.random() > (depth == 0 ? 0.9 : 0.8 / (depth * 2))
        ) {
          return Literal(number);
        }

        var opposingIndex = choice(Object.keys(deadValues));
        if (typeof opposingIndex === "undefined") {
          return Literal(number);
        }
        var actualValue = deadValues[opposingIndex];

        ok(typeof actualValue === "number");

        return BinaryExpression(
          "-",
          MemberExpression(
            Identifier(stackName),
            numberLiteral(
              isNaN(parseFloat(opposingIndex))
                ? opposingIndex
                : parseFloat(opposingIndex),
              depth + 1
            ),
            true
          ),
          numberLiteral(actualValue - number, depth + 1)
        );
      }

      function getMemberExpression(index) {
        ok(typeof index === "string", typeof index);
        return MemberExpression(
          Identifier(stackName),
          numberLiteral(isNaN(parseFloat(index)) ? index : parseFloat(index)),
          true
        );
      }

      var stackName = this.getPlaceholder();
      var made = 1;

      const scan = (o, p) => {
        if (o.type == "Identifier") {
          var index = subscripts.get(o.name);
          if (typeof index !== "undefined") {
            var info = getIdentifierInfo(o, p);
            if (!info.spec.isReferenced) {
              return;
            }

            var member = getMemberExpression(index);

            if (info.spec.isDefined) {
              if (info.isVariableDeclaration) {
                walk(p[2], p.slice(3), (oo, pp) => {
                  if (oo != o) {
                    return scan(oo, pp);
                  }
                });

                this.replace(
                  p[2],
                  ExpressionStatement(
                    AssignmentExpression(
                      "=",
                      member,
                      p[0].init || Identifier("undefined")
                    )
                  )
                );
                return;
              } else if (info.isFunctionDeclaration) {
                walk(p[0], p.slice(1), (oo, pp) => {
                  if (oo != o) {
                    return scan(oo, pp);
                  }
                });

                this.replace(
                  p[0],
                  ExpressionStatement(
                    AssignmentExpression("=", member, {
                      ...p[0],
                      type: "FunctionExpression",
                      id: null,
                      expression: false,
                    })
                  )
                );
                return;
              } else if (info.isClassDeclaration) {
                walk(p[0], p.slice(1), (oo, pp) => {
                  if (oo != o) {
                    return scan(oo, pp);
                  }
                });

                this.replace(
                  p[0],
                  ExpressionStatement(
                    AssignmentExpression("=", member, {
                      ...p[0],
                      type: "ClassExpression",
                    })
                  )
                );
                return;
              }
            }

            if (info.spec.isReferenced) {
              this.replace(o, member);
            }
          }
        }

        if (
          o.type == "Literal" &&
          typeof o.value === "number" &&
          Math.floor(o.value) === o.value &&
          Math.abs(o.value) < 100_000 &&
          Math.random() < 4 / made &&
          p.find((x) => isFunction(x)) === object
        ) {
          made++;
          return () => {
            this.replaceIdentifierOrLiteral(o, numberLiteral(o.value, 0), p);
          };
        }
      };

      var rotateNodes: { [index: number]: Node } = Object.create(null);

      object.body.body.forEach((stmt, index) => {
        var isFirst = index == 0;

        if (isFirst || Math.random() < 0.9 / index) {
          var exprs = [];

          var changes = getRandomInteger(isFirst ? 2 : 1, isFirst ? 3 : 2);

          for (var i = 0; i < changes; i++) {
            var expr;
            var type = choice(["set", "deadValue"]);

            var valueSet = new Set([
              ...Array.from(subscripts.values()),
              ...Object.keys(deadValues),
            ]);
            var newIndex;
            var i = 0;
            do {
              newIndex =
                getRandomInteger(0, 250 + subscripts.size + i * 1000) + "";
              i++;
            } while (valueSet.has(newIndex));

            switch (type) {
              case "set":
                var randomName = choice(Array.from(subscripts.keys()));
                var currentIndex = subscripts.get(randomName);

                expr = AssignmentExpression(
                  "=",
                  getMemberExpression(newIndex),
                  getMemberExpression(currentIndex)
                );

                ok(
                  typeof deadValues[newIndex] === "undefined",
                  deadValues[newIndex]
                );
                setSubscript(randomName, newIndex);
                break;

              case "deadValue":
                var rand = getRandomInteger(-250, 250);

                // modify an already existing dead value index
                if (Math.random() > 0.5) {
                  var alreadyExisting = choice(Object.keys(deadValues));

                  if (typeof alreadyExisting === "string") {
                    newIndex = alreadyExisting;
                  }
                }

                expr = AssignmentExpression(
                  "=",
                  getMemberExpression(newIndex),
                  numberLiteral(rand)
                );

                ok(!subscripts.has(newIndex));
                deadValues[newIndex] = rand;
                break;
            }

            exprs.push(expr);
          }
          rotateNodes[index] = ExpressionStatement(SequenceExpression(exprs));
        }

        walk(
          stmt,
          [object.body.body, object.body, object, ...parents],
          (o, p) => {
            return scan(o, p);
          }
        );

        if (stmt.type == "ReturnStatement") {
          var opposing = choice(Object.keys(deadValues));
          if (typeof opposing === "string") {
            this.replace(
              stmt,
              IfStatement(
                BinaryExpression(
                  ">",
                  getMemberExpression(opposing),
                  numberLiteral(
                    deadValues[opposing] + getRandomInteger(40, 140)
                  )
                ),
                [
                  ReturnStatement(
                    getMemberExpression(getRandomInteger(-250, 250) + "")
                  ),
                ],
                [ReturnStatement(stmt.argument)]
              )
            );
          }
        }
      });

      // Add in the rotation nodes
      Object.keys(rotateNodes).forEach((index, i) => {
        object.body.body.splice(parseInt(index) + i, 0, rotateNodes[index]);
      });

      // Set the params for this function to be the stack array
      object.params = [RestElement(Identifier(stackName))];

      // Ensure the array is correct length
      prepend(
        object.body,
        Template(`${stackName}.length = ${startingSize}`).single()
      );
    };
  }
}
