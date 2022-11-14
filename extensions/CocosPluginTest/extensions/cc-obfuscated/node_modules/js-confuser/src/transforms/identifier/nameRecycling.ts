import { ok } from "assert";
import { ObfuscateOrder } from "../../order";
import { ComputeProbabilityMap } from "../../probability";
import { getBlock, isBlock, walk } from "../../traverse";
import {
  AssignmentExpression,
  ExpressionStatement,
  Identifier,
  Location,
  VariableDeclarator,
} from "../../util/gen";
import {
  containsLexicallyBoundVariables,
  getFunctionParameters,
  getIdentifierInfo,
} from "../../util/identifiers";
import {
  getDefiningContext,
  getReferencingContexts,
  getVarContext,
  isForInitialize,
  isFunction,
  isVarContext,
} from "../../util/insert";
import Transform from "../transform";

/**
 * Statement-based variable recycling.
 *
 * ```js
 * // Input
 * function percentage(decimal) {
 *   var multiplied = x * 100;
 *   var floored = Math.floor(multiplied);
 *   var output = floored + "%"
 *   return output;
 * }
 *
 * // Output
 * function percentage(decimal) {
 *   var multiplied = x * 100;
 *   var floored = Math.floor(multiplied);
 *   multiplied = floored + "%";
 *   return multiplied;
 * }
 * ```
 */
export default class NameRecycling extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.NameRecycling);
  }

  match(object, parents) {
    return isBlock(object);
  }

  transform(object, parents) {
    return () => {
      if (containsLexicallyBoundVariables(object, parents)) {
        return;
      }

      var context = getVarContext(object, parents);

      var stmts = [...object.body];
      ok(Array.isArray(stmts));

      var definedMap = new Map<number, Set<string>>();
      var referencedMap = new Map<number, Set<string>>();
      var nodeMap = new Map<number, Map<string, Location[]>>();

      var lastReferenceMap = new Map<string, number>();

      var defined = new Set<string>();
      var illegal = new Set<string>();

      var fn = isFunction(parents[0]) ? parents[0] : null;
      if (fn) {
        definedMap.set(
          -1,
          new Set(
            getFunctionParameters(fn, parents.slice(1)).map((x) => x[0].name)
          )
        );
      }

      stmts.forEach((stmt, i) => {
        var definedHere = new Set<string>();
        var referencedHere = new Set<string>();
        var nodesHere = new Map<string, Location[]>();

        walk(stmt, [object.body, object, ...parents], (o, p) => {
          if (o.type == "Identifier") {
            return () => {
              var info = getIdentifierInfo(o, p);
              if (!info.spec.isReferenced) {
                return;
              }

              lastReferenceMap.set(o.name, i);

              var comparingContext = info.spec.isDefined
                ? getDefiningContext(o, p)
                : getReferencingContexts(o, p).find((x) => isVarContext(x));

              if (comparingContext !== context) {
                illegal.add(o.name);
                this.log(o.name, "is different context");
              } else {
                if (!nodesHere.has(o.name)) {
                  nodesHere.set(o.name, [[o, p]]);
                } else {
                  nodesHere.get(o.name).push([o, p]);
                }

                if (info.spec.isDefined) {
                  if (defined.has(o.name) || getBlock(o, p) !== object) {
                    illegal.add(o.name);
                  }
                  defined.add(o.name);
                  definedHere.add(o.name);
                } else {
                  referencedHere.add(o.name);
                }
              }
            };
          }
        });

        // console.log(i, definedHere);

        definedMap.set(i, definedHere);
        referencedMap.set(i, referencedHere);
        nodeMap.set(i, nodesHere);
      });

      this.log(illegal);

      illegal.forEach((name) => {
        nodeMap.forEach((value) => {
          value.delete(name);
        });
      });

      var available = new Set<string>();
      var newNames = Object.create(null);

      stmts.forEach((stmt, i) => {
        var nodes = nodeMap.get(i);

        nodes.forEach((locations, name) => {
          var newName = newNames[name];

          if (!newName) {
            var canChange = false;

            if (
              object.type == "Program" &&
              !ComputeProbabilityMap(this.options.renameGlobals, (x) => x, name)
            ) {
              return;
            }

            if (defined.has(name) && definedMap.get(i).has(name)) {
              canChange = true;
            }

            if (!canChange) {
              return;
            }

            if (available.size) {
              newName = available.keys().next().value;
              available.delete(newName);

              ok(name !== newName);
              newNames[name] = newName;

              defined.delete(name);

              this.log(name, "->", newName);
            }
          }
        });

        nodes.forEach((locations, name) => {
          var newName = newNames[name];

          if (newName) {
            locations.forEach(([object, parents]) => {
              object.name = newName;

              var declaratorIndex = parents.findIndex(
                (p) => p.type == "VariableDeclarator"
              );
              if (
                declaratorIndex !== -1 &&
                parents[declaratorIndex].id ===
                  (parents[declaratorIndex - 1] || object)
              ) {
                var value =
                  parents[declaratorIndex].init || Identifier("undefined");

                var expr = AssignmentExpression(
                  "=",
                  parents[declaratorIndex].id,
                  value
                );

                if (parents[declaratorIndex + 1].length === 1) {
                  if (
                    isForInitialize(
                      parents[declaratorIndex + 2],
                      parents.slice(3)
                    )
                  ) {
                    this.replace(parents[declaratorIndex + 2], expr);
                  } else {
                    this.replace(
                      parents[declaratorIndex + 2],
                      ExpressionStatement(expr)
                    );
                  }
                } else {
                  this.replace(
                    parents[declaratorIndex],
                    VariableDeclarator(this.getPlaceholder(), expr)
                  );
                }
              } else {
                if (parents[0].type == "FunctionDeclaration") {
                  this.replace(
                    parents[0],
                    ExpressionStatement(
                      AssignmentExpression("=", Identifier(newName), {
                        ...parents[0],
                        type: "FunctionExpression",
                        id: null,
                      })
                    )
                  );
                } else if (parents[0].type == "ClassDeclaration") {
                  this.replace(
                    parents[0],
                    ExpressionStatement(
                      AssignmentExpression("=", Identifier(newName), {
                        ...parents[0],
                        type: "ClassExpression",
                      })
                    )
                  );
                }
              }
            });
          }

          if (defined.has(name)) {
            var lastRef = lastReferenceMap.get(name);
            var isDecommissioned = lastRef === i;

            if (isDecommissioned) {
              available.add(name);
            }
          }
        });
      });
    };
  }
}
