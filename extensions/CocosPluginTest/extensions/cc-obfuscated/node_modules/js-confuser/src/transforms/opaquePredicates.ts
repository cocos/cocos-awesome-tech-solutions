import Transform from "./transform";
import {
  Node,
  BinaryExpression,
  MemberExpression,
  Identifier,
  CallExpression,
  Literal,
  VariableDeclaration,
  ObjectExpression,
  Property,
  FunctionExpression,
  ArrayExpression,
  LogicalExpression,
  VariableDeclarator,
  ConditionalExpression,
  UnaryExpression,
  ReturnStatement,
  AssignmentPattern,
} from "../util/gen";
import {
  choice,
  getRandomInteger,
  getRandomString,
  shuffle,
} from "../util/random";
import { ObfuscateOrder } from "../order";
import { clone, prepend } from "../util/insert";
import Template from "../templates/template";
import { ComputeProbabilityMap } from "../probability";
import { ok } from "assert";

const testTypes = new Set([
  "ForStatement",
  "WhileStatement",
  "DoWhileStatement",
  "IfStatement",
  "ConditionExpression",
]);

function isTestExpression(object: Node, parents: Node[]) {
  if (!object || !parents[0]) {
    return false;
  }

  if (testTypes.has(parents[0].type) && parents[0].test === object) {
    return true;
  }

  return false;
}

/**
 * Changes test expression (such as if statements, for loops) to add predicates.
 *
 * Predicates are computed at runtime.
 */
export default class OpaquePredicates extends Transform {
  undefinedVar: string;
  nullVar: string;
  numberVar: string;

  predicateName: string;
  predicate: Node;
  predicates: { [name: string]: Node };

  gen: any;
  made: number;

  constructor(o) {
    super(o, ObfuscateOrder.OpaquePredicates);

    this.predicates = Object.create(null);
    this.gen = this.getGenerator(getRandomInteger(0, 20));
    this.made = 0;
  }

  match(object: Node, parents: Node[]) {
    return (
      (isTestExpression(object, parents) || object.type == "SwitchCase") &&
      !parents.find((x) => x.$dispatcherSkip || x.type == "AwaitExpression")
    );
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      if (!ComputeProbabilityMap(this.options.opaquePredicates)) {
        return;
      }
      this.made++;
      if (this.made > 150) {
        return;
      }

      if (!this.predicate) {
        this.predicateName = this.getPlaceholder();
        this.predicate = ObjectExpression([]);

        var tempName = this.getPlaceholder();

        prepend(
          parents[parents.length - 1] || object,
          VariableDeclaration(
            VariableDeclarator(
              this.predicateName,
              CallExpression(
                FunctionExpression(
                  [],
                  [
                    VariableDeclaration(
                      VariableDeclarator(tempName, this.predicate)
                    ),
                    ReturnStatement(Identifier(tempName)),
                  ]
                ),
                []
              )
            )
          )
        );
      }

      var expr = choice(Object.values(this.predicates));

      if (
        !expr ||
        Math.random() < 0.5 / (Object.keys(this.predicates).length || 1)
      ) {
        var prop = this.gen.generate();
        var accessor = MemberExpression(
          Identifier(this.predicateName),
          Identifier(prop),
          false
        );
        switch (choice(["array", "number", "string"])) {
          case "array":
            var arrayProp = this.gen.generate();
            this.predicate.properties.push(
              Property(Identifier(arrayProp), ArrayExpression([]))
            );

            var paramName = this.getPlaceholder();

            this.predicate.properties.push(
              Property(
                Identifier(prop),
                FunctionExpression(
                  [AssignmentPattern(Identifier(paramName), Literal("length"))],
                  Template(`
                  if ( !${this.predicateName}.${arrayProp}[0] ) {
                    ${this.predicateName}.${arrayProp}.push(${getRandomInteger(
                    -100,
                    100
                  )});
                  }
                  return ${this.predicateName}.${arrayProp}[${paramName}];
                `).compile()
                )
              )
            );
            expr = CallExpression(accessor, []);
            break;

          case "number":
            this.predicate.properties.push(
              Property(Identifier(prop), Literal(getRandomInteger(15, 90)))
            );
            expr = BinaryExpression(
              ">",
              accessor,
              Literal(getRandomInteger(-90, 10))
            );
            break;

          case "string":
            var str = this.gen.generate();
            var index = getRandomInteger(0, str.length);
            var fn = Math.random() > 0.5 ? "charAt" : "charCodeAt";

            this.predicate.properties.push(
              Property(Identifier(prop), Literal(str))
            );
            expr = BinaryExpression(
              "==",
              CallExpression(MemberExpression(accessor, Literal(fn), true), [
                Literal(index),
              ]),
              Literal(str[fn](index))
            );
            break;
        }

        ok(expr);
        this.predicates[prop] = expr;

        if (Math.random() > 0.8) {
          shuffle(this.predicate.properties);
        }
      }

      var cloned = clone(expr);
      if (object.type == "SwitchCase") {
        var matching = Identifier(choice(["undefined", "null"]));

        var test = object.test;

        if (test.type == "Literal") {
          if (typeof test.value === "number") {
            matching = Literal(getRandomInteger(-250, 250));
          } else if (typeof test.value === "string") {
            matching = Literal(getRandomString(4));
          }
        }

        var conditionalExpression = ConditionalExpression(
          cloned,
          clone(test),
          matching
        );
        if (Math.random() > 0.5) {
          conditionalExpression = ConditionalExpression(
            UnaryExpression("!", cloned),
            matching,
            clone(test)
          );
        }

        this.replace(test, conditionalExpression);
      } else if (isTestExpression(object, parents)) {
        if (object.type == "Literal" && !object.regex) {
          if (object.value) {
            this.replace(object, cloned);
          } else {
            this.replace(object, UnaryExpression("!", cloned));
          }
        } else {
          this.replace(object, LogicalExpression("&&", clone(object), cloned));
        }
      }
    };
  }
}
