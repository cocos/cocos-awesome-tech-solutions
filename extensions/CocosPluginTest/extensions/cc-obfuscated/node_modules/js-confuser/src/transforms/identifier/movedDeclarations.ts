import Transform from "../transform";
import { isBlock, getBlock, walk } from "../../traverse";
import {
  Location,
  ExpressionStatement,
  SequenceExpression,
  AssignmentExpression,
  Identifier,
  Node,
  VariableDeclarator,
  VariableDeclaration,
} from "../../util/gen";
import { clone, isForInitialize, isFunction, prepend } from "../../util/insert";
import { ok } from "assert";
import { ObfuscateOrder } from "../../order";
import { getIdentifierInfo } from "../../util/identifiers";
import { isLoop } from "../../util/compare";
import { reservedIdentifiers } from "../../constants";
import { isLexicalScope, getLexicalScope } from "../../util/scope";

/**
 * Defines all the names at the top of every lexical block.
 */
export default class MovedDeclarations extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.MovedDeclarations);
  }

  match(object, parents) {
    return isLexicalScope(object);
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      var body = isBlock(object) ? object.body : object.consequent;
      ok(Array.isArray(body));

      var illegal = new Set<string>();
      var defined = new Set<string>();
      var variableDeclarations: {
        [name: string]: {
          location: Location;
          replace: Node;
        };
      } = Object.create(null);

      walk(object, parents, (o, p) => {
        if (o.type == "Identifier") {
          if (getLexicalScope(o, p) !== object) {
            illegal.add(o.name);
          } else {
            var info = getIdentifierInfo(o, p);
            if (!info.spec.isReferenced) {
              return;
            }

            if (info.spec.isDefined) {
              if (info.isFunctionDeclaration || info.isClassDeclaration) {
                illegal.add(o.name);
              } else {
                if (defined.has(o.name)) {
                  illegal.add(o.name);
                } else {
                  defined.add(o.name);
                }
              }
            }
          }
        }

        if (o.type == "VariableDeclaration") {
          return () => {
            if (
              o.declarations.length === 1 &&
              o.declarations[0].id.type === "Identifier"
            ) {
              var name = o.declarations[0].id.name;

              // Check if duplicate
              if (variableDeclarations[name] || o.kind !== "var") {
                illegal.add(name);
                return;
              }

              // Check if already at top
              if (body[0] === o) {
                illegal.add(name);
                return;
              }

              var replace: Node = AssignmentExpression(
                "=",
                Identifier(name),
                o.declarations[0].init || Identifier("undefined")
              );

              var forType = isForInitialize(o, p);
              if (forType === "left-hand") {
                replace = Identifier(name);
              } else if (!forType) {
                replace = ExpressionStatement(replace);
              }
              variableDeclarations[name] = {
                location: [o, p],
                replace: replace,
              };
            }
          };
        }
      });

      illegal.forEach((name) => {
        delete variableDeclarations[name];
      });

      var movingNames = Object.keys(variableDeclarations);

      if (movingNames.length === 0) {
        return;
      }

      var variableDeclaration = VariableDeclaration(
        movingNames.map((name) => {
          return VariableDeclarator(name);
        })
      );

      if (object.type == "Program") {
        prepend(object, variableDeclaration);
      } else {
        body.unshift(variableDeclaration);
      }

      movingNames.forEach((name) => {
        var { location, replace } = variableDeclarations[name];
        this.replace(location[0], replace);
      });
    };
  }
}
