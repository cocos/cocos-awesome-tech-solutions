import { ok } from "assert";
import { ObfuscateOrder } from "../../order";
import Template from "../../templates/template";
import { isBlock } from "../../traverse";
import { isDirective } from "../../util/compare";
import {
  ArrayExpression,
  CallExpression,
  ConditionalExpression,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  IfStatement,
  Literal,
  MemberExpression,
  Node,
  ReturnStatement,
  SequenceExpression,
  ThisExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import { append, isLexContext, isVarContext, prepend } from "../../util/insert";
import { choice, getRandomInteger, getRandomString } from "../../util/random";
import Transform from "../transform";
import Encoding from "./encoding";

export function isModuleSource(object: Node, parents: Node[]) {
  if (!parents[0]) {
    return false;
  }

  if (parents[0].type == "ImportDeclaration" && parents[0].source == object) {
    return true;
  }

  if (parents[0].type == "ImportExpression" && parents[0].source == object) {
    return true;
  }

  if (
    parents[1] &&
    parents[1].type == "CallExpression" &&
    parents[1].arguments[0] === object &&
    parents[1].callee.type == "Identifier"
  ) {
    if (
      parents[1].callee.name == "require" ||
      parents[1].callee.name == "import"
    ) {
      return true;
    }
  }

  return false;
}

export default class StringConcealing extends Transform {
  arrayExpression: Node;
  set: Set<string>;
  index: { [str: string]: [number, string] };

  arrayName = this.getPlaceholder();
  ignore = new Set<string>();
  variablesMade = 1;
  encoding: { [type: string]: string } = Object.create(null);

  hasAllEncodings: boolean;

  constructor(o) {
    super(o, ObfuscateOrder.StringConcealing);

    this.set = new Set();
    this.index = Object.create(null);
    this.arrayExpression = ArrayExpression([]);
    this.hasAllEncodings = false;

    // Pad array with useless strings
    var dead = getRandomInteger(4, 10);
    for (var i = 0; i < dead; i++) {
      var str = getRandomString(getRandomInteger(4, 20));
      var fn = this.transform(Literal(str), []);
      if (fn) {
        fn();
      }
    }
  }

  apply(tree) {
    super.apply(tree);

    var cacheName = this.getPlaceholder();

    Object.keys(this.encoding).forEach((type) => {
      var { template } = Encoding[type];
      var decodeFn = this.getPlaceholder();
      var getterFn = this.encoding[type];

      append(tree, template.single({ name: decodeFn }));

      append(
        tree,
        Template(`
            
            function ${getterFn}(x, y, z, a = ${decodeFn}, b = ${cacheName}){
              if ( z ) {
                return y[${cacheName}[z]] = ${getterFn}(x, y);
              } else if ( y ) {
                [b, y] = [a(b), x || z]
              }
            
              return y ? x[b[y]] : ${cacheName}[x] || (z=(b[x], a), ${cacheName}[x] = z(${this.arrayName}[x]))
            }
  
            `).single()
      );
    });

    var flowIntegrity = this.getPlaceholder();

    prepend(
      tree,
      VariableDeclaration([
        VariableDeclarator(cacheName, ArrayExpression([])),
        VariableDeclarator(flowIntegrity, Literal(0)),
        VariableDeclarator(
          this.arrayName,
          CallExpression(
            FunctionExpression(
              [],
              [
                VariableDeclaration(
                  VariableDeclarator("a", this.arrayExpression)
                ),
                Template(
                  `return (${flowIntegrity} ? a.pop() : ${flowIntegrity}++, a)`
                ).single(),
              ]
            ),
            []
          )
        ),
      ])
    );
  }

  match(object, parents) {
    return (
      object.type == "Literal" &&
      typeof object.value === "string" &&
      object.value.length >= 3 &&
      !isModuleSource(object, parents) &&
      !isDirective(object, parents) //&&
      /*!parents.find((x) => x.$dispatcherSkip)*/
    );
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      // Empty strings are discarded
      if (!object.value || this.ignore.has(object.value)) {
        return;
      }

      var types = Object.keys(this.encoding);

      var type = choice(types);
      if (!type || (!this.hasAllEncodings && Math.random() > 0.9)) {
        var allowed = Object.keys(Encoding).filter(
          (type) => !this.encoding[type]
        );

        if (!allowed.length) {
          this.hasAllEncodings = true;
        } else {
          var random = choice(allowed);
          type = random;

          this.encoding[random] = this.getPlaceholder();
        }
      }

      var fnName = this.encoding[type];
      var encoder = Encoding[type];

      // The decode function must return correct result
      var encoded = encoder.encode(object.value);
      if (encoder.decode(encoded) != object.value) {
        this.ignore.add(object.value);
        this.warn(object.value.slice(0, 100));
        return;
      }

      // Fix 1. weird undefined error
      if (object.value && object.value.length > 0) {
        var index = -1;
        if (!this.set.has(object.value)) {
          this.arrayExpression.elements.push(Literal(encoded));
          index = this.arrayExpression.elements.length - 1;
          this.index[object.value] = [index, fnName];

          this.set.add(object.value);
        } else {
          [index, fnName] = this.index[object.value];
          ok(typeof index === "number");
        }

        ok(index != -1, "index == -1");

        var callExpr = CallExpression(Identifier(fnName), [Literal(index)]);

        // use `.apply` to fool automated de-obfuscators
        if (Math.random() > 0.5) {
          callExpr = CallExpression(
            MemberExpression(Identifier(fnName), Identifier("apply"), false),
            [ThisExpression(), ArrayExpression([Literal(index)])]
          );
        }

        // use `.call`
        else if (Math.random() > 0.5) {
          callExpr = CallExpression(
            MemberExpression(Identifier(fnName), Identifier("call"), false),
            [ThisExpression(), Literal(index)]
          );
        }

        var constantReference =
          parents.length && Math.random() > 0.5 / this.variablesMade;

        if (constantReference) {
          // Define the string earlier, reference the name here

          var name = this.getPlaceholder();

          var place = choice(parents.filter((node) => isBlock(node)));
          if (!place) {
            this.error(Error("No lexical block to insert code"));
          }

          place.body.unshift(
            VariableDeclaration(VariableDeclarator(name, callExpr))
          );

          this.replaceIdentifierOrLiteral(object, Identifier(name), parents);

          this.variablesMade++;
        } else {
          // Direct call to the getter function
          this.replaceIdentifierOrLiteral(object, callExpr, parents);
        }
      }
    };
  }
}
