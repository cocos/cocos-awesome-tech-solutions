import Transform from "../transform";
import { walk } from "../../traverse";
import {
  Node,
  Location,
  Identifier,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import {
  clone,
  deleteDeclaration,
  getVarContext,
  isVarContext,
  prepend,
} from "../../util/insert";
import { ObfuscateOrder } from "../../order";
import { getIdentifierInfo } from "../../util/identifiers";
import { isValidIdentifier } from "../../util/compare";
import { ComputeProbabilityMap } from "../../probability";
import { ok } from "assert";
import { isStringLiteral } from "../../util/guard";

/**
 * Extracts keys out of an object if possible.
 * ```js
 * // Input
 * var utils = {
 *   isString: x=>typeof x === "string",
 *   isBoolean: x=>typeof x === "boolean"
 * }
 * if ( utils.isString("Hello") ) {
 *   ...
 * }
 *
 * // Output
 * var utils_isString = x=>typeof x === "string";
 * var utils_isBoolean = x=>typeof x === "boolean"
 *
 * if ( utils_isString("Hello") ) {
 *   ...
 * }
 * ```
 */
export default class ObjectExtraction extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.ObjectExtraction);
  }

  match(object: Node, parents: Node[]) {
    return isVarContext(object);
  }

  transform(context: Node, contextParents: Node[]) {
    // ObjectExpression Extractor

    return () => {
      // First pass through to find the maps
      var objectDefs: { [name: string]: Location } = Object.create(null);
      var objectDefiningIdentifiers: { [name: string]: Location } =
        Object.create(null);

      var illegal = new Set<string>();

      walk(context, contextParents, (object: Node, parents: Node[]) => {
        if (object.type == "ObjectExpression") {
          // this.log(object, parents);
          if (
            parents[0].type == "VariableDeclarator" &&
            parents[0].init == object &&
            parents[0].id.type == "Identifier"
          ) {
            var name = parents[0].id.name;
            if (name) {
              if (getVarContext(object, parents) != context) {
                illegal.add(name);
                return;
              }
              if (!object.properties.length) {
                illegal.add(name);
                return;
              }

              // duplicate name
              if (objectDefiningIdentifiers[name]) {
                illegal.add(name);
                return;
              }

              // check for computed properties
              // Change String literals to non-computed
              object.properties.forEach((prop) => {
                if (prop.computed && isStringLiteral(prop.key)) {
                  prop.computed = false;
                }
              });

              var nonInitOrComputed = object.properties.find(
                (x) => x.kind !== "init" || x.computed
              );

              if (nonInitOrComputed) {
                this.log(
                  name +
                    " has non-init/computed property: " +
                    nonInitOrComputed.key.name || nonInitOrComputed.key.value
                );
                illegal.add(name);
                return;
              } else {
                var illegalName = object.properties
                  .map((x) =>
                    x.computed ? x.key.value : x.key.name || x.key.value
                  )
                  .find((x) => !x || !isValidIdentifier(x));

                if (illegalName) {
                  this.log(
                    name + " has an illegal property '" + illegalName + "'"
                  );
                  illegal.add(name);
                  return;
                } else {
                  var isIllegal = false;
                  walk(object, parents, (o, p) => {
                    if (o.type == "ThisExpression" || o.type == "Super") {
                      isIllegal = true;
                      return "EXIT";
                    }
                  });
                  if (isIllegal) {
                    illegal.add(name);
                    return;
                  }

                  objectDefs[name] = [object, parents];
                  objectDefiningIdentifiers[name] = [
                    parents[0].id,
                    [...parents],
                  ];
                }
              }
            }
          }
        }
      });

      illegal.forEach((name) => {
        delete objectDefs[name];
        delete objectDefiningIdentifiers[name];
      });

      // this.log("object defs", objectDefs);
      // huge map of changes
      var objectDefChanges: {
        [name: string]: { key: string; object: Node; parents: Node[] }[];
      } = {};

      if (Object.keys(objectDefs).length) {
        // A second pass through is only required when extracting object keys

        // Second pass through the exclude the dynamic map (counting keys, re-assigning)
        walk(context, contextParents, (object: any, parents: Node[]) => {
          if (object.type == "Identifier") {
            var info = getIdentifierInfo(object, parents);
            if (!info.spec.isReferenced) {
              return;
            }
            var def = objectDefs[object.name];
            if (def) {
              var isIllegal = false;

              if (info.spec.isDefined) {
                if (objectDefiningIdentifiers[object.name][0] !== object) {
                  this.log(object.name, "you can't redefine the object");
                  isIllegal = true;
                }
              } else {
                var isMemberExpression =
                  parents[0].type == "MemberExpression" &&
                  parents[0].object == object;

                if (
                  (parents.find((x) => x.type == "AssignmentExpression") &&
                    !isMemberExpression) ||
                  parents.find(
                    (x) => x.type == "UnaryExpression" && x.operator == "delete"
                  )
                ) {
                  this.log(object.name, "you can't re-assign the object");

                  isIllegal = true;
                } else if (isMemberExpression) {
                  var key =
                    parents[0].property.value || parents[0].property.name;

                  if (
                    parents[0].computed &&
                    parents[0].property.type !== "Literal"
                  ) {
                    this.log(
                      object.name,
                      "object[expr] detected, only object['key'] is allowed"
                    );

                    isIllegal = true;
                  } else if (
                    !parents[0].computed &&
                    parents[0].property.type !== "Identifier"
                  ) {
                    this.log(
                      object.name,
                      "object.<expr> detected, only object.key is allowed"
                    );

                    isIllegal = true;
                  } else if (
                    !key ||
                    !def[0].properties.some(
                      (x) => (x.key.value || x.key.name) == key
                    )
                  ) {
                    // check if initialized property
                    // not in initialized object.
                    this.log(
                      object.name,
                      "not in initialized object.",
                      def[0].properties,
                      key
                    );
                    isIllegal = true;
                  }

                  if (!isIllegal && key) {
                    // allowed.
                    // start the array if first time
                    if (!objectDefChanges[object.name]) {
                      objectDefChanges[object.name] = [];
                    }
                    // add to array
                    objectDefChanges[object.name].push({
                      key: key,
                      object: object,
                      parents: parents,
                    });
                  }
                } else {
                  this.log(
                    object.name,
                    "you must access a property on the when referring to the identifier (accessors must be hard-coded literals), parent is " +
                      parents[0].type
                  );

                  isIllegal = true;
                }
              }

              if (isIllegal) {
                // this is illegal, delete it from being moved and delete accessor changes from happening
                this.log(object.name + " is illegal");
                delete objectDefs[object.name];
                delete objectDefChanges[object.name];
              }
            }
          }
        });

        Object.keys(objectDefs).forEach((name) => {
          if (
            !ComputeProbabilityMap(
              this.options.objectExtraction,
              (x) => x,
              name
            )
          ) {
            //continue;
            return;
          }

          var [object, parents] = objectDefs[name];
          var declarator = parents[0];
          var declaration = parents[2];

          ok(declarator.type === "VariableDeclarator");
          ok(declaration.type === "VariableDeclaration");

          var properties = object.properties;
          // change the prop names while extracting
          var newPropNames: { [key: string]: string } = {};

          var variableDeclarators = [];

          properties.forEach((property: Node) => {
            var keyName = property.key.name || property.key.value;

            var nn = name + "_" + keyName;
            newPropNames[keyName] = nn;

            var v = property.value;

            variableDeclarators.push(
              VariableDeclarator(nn, this.addComment(v, `${name}.${keyName}`))
            );
          });

          declaration.declarations.splice(
            declaration.declarations.indexOf(declarator),
            1,
            ...variableDeclarators
          );

          // update all identifiers that pointed to the old object
          objectDefChanges[name] &&
            objectDefChanges[name].forEach((change) => {
              if (!change.key) {
                this.error(new Error("key is undefined"));
              }
              if (newPropNames[change.key]) {
                var memberExpression = change.parents[0];
                if (memberExpression.type == "MemberExpression") {
                  this.replace(
                    memberExpression,
                    this.addComment(
                      Identifier(newPropNames[change.key]),
                      `Original Accessor: ${name}.${change.key}`
                    )
                  );
                } else {
                  // Provide error with more information:
                  console.log(memberExpression);
                  this.error(
                    new Error(
                      `should be MemberExpression, found type=${memberExpression.type}`
                    )
                  );
                }
              } else {
                console.log(objectDefChanges[name], newPropNames);
                this.error(
                  new Error(
                    `"${change.key}" not found in [${Object.keys(
                      newPropNames
                    ).join(", ")}] while flattening ${name}.`
                  )
                );
              }
            });

          this.log(
            `Extracted ${
              Object.keys(newPropNames).length
            } properties from ${name}, affecting ${
              Object.keys(objectDefChanges[name] || {}).length
            } line(s) of code.`
          );
        });
      }
    };
  }
}
