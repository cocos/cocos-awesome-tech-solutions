import Transform from "../transform";
import Template from "../../templates/template";
import {
  VariableDeclaration,
  IfStatement,
  Identifier,
  BinaryExpression,
  Literal,
  CallExpression,
  BlockStatement,
  ExpressionStatement,
  Node,
  FunctionExpression,
  VariableDeclarator,
} from "../../util/gen";
import { clone, isFunction } from "../../util/insert";
import { getRandomInteger } from "../../util/random";
import Lock from "./lock";
import { ok } from "assert";
import { compileJsSync } from "../../compiler";

/**
 * Hashing Algorithm for function integrity
 * @param str
 * @param seed
 */
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// In template form to be inserted into code
const HashTemplate = Template(`
function {name}(str, seed) {
  var h1 = 0xdeadbeef ^ seed;
  var h2 = 0x41c6ce57 ^ seed;
  for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = {imul}(h1 ^ ch, 2654435761);
      h2 = {imul}(h2 ^ ch, 1597334677);
  }
  h1 = {imul}(h1 ^ (h1>>>16), 2246822507) ^ {imul}(h2 ^ (h2>>>13), 3266489909);
  h2 = {imul}(h2 ^ (h2>>>16), 2246822507) ^ {imul}(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
};`);

// Math.imul polyfill for ES5
const ImulTemplate = Template(`
var {name} = Math.imul || function(opA, opB){
  opB |= 0; // ensure that opB is an integer. opA will automatically be coerced.
  // floating points give us 53 bits of precision to work with plus 1 sign bit
  // automatically handled for our convienence:
  // 1. 0x003fffff /*opA & 0x000fffff*/ * 0x7fffffff /*opB*/ = 0x1fffff7fc00001
  //    0x1fffff7fc00001 < Number.MAX_SAFE_INTEGER /*0x1fffffffffffff*/
  var result = (opA & 0x003fffff) * opB;
  // 2. We can remove an integer coersion from the statement above because:
  //    0x1fffff7fc00001 + 0xffc00000 = 0x1fffffff800001
  //    0x1fffffff800001 < Number.MAX_SAFE_INTEGER /*0x1fffffffffffff*/
  if (opA & 0xffc00000 /*!== 0*/) result += (opA & 0xffc00000) * opB |0;
  return result |0;
};`);

// Simple function that returns .toString() value with spaces replaced out
const StringTemplate = Template(`
  function {name}(x){
    return x.toString().replace(/ |\\n|;|,|\\{|\\}|\\(|\\)|\\.|\\[|\\]/g, "");
  }
`);

/**
 * Integrity protects functions by using checksum techniques to verify their code has not changed.
 *
 * If an attacker modifies a function, the modified function will not execute.
 *
 * How it works:
 *
 * - By using `.toString()` JavaScript will expose a function's source code.
 * - We can hash it and use an if statement in the code to ensure the function's code is unchanged.
 *
 * This is the most complicated Transformation for JSConfuser so here I'll explain:
 * - The Program is wrapped in an IIFE (Function Expression that is called instantly)
 * - Every function including ^ are generated out and evaluated for their .toString() value
 * - Hashed using cyrb53's hashing algorithm
 * - Check the checksum before running the code.
 *
 * - The hashing function is placed during this transformation,
 * - A hidden identifier is placed to keep track of the name.
 */
export default class Integrity extends Transform {
  hashFn: Node;
  imulFn: Node;
  stringFn: Node;
  seed: number;
  lock: Lock;

  constructor(o, lock) {
    super(o);
    this.lock = lock;

    this.seed = getRandomInteger(0, 1000);
  }

  match(object: Node, parents: Node[]) {
    // ArrowFunctions are excluded!
    return (
      object.type == "Program" ||
      (isFunction(object) && object.type !== "ArrowFunctionExpression")
    );
  }

  transform(object: Node, parents: Node[]) {
    if (object.type == "Program") {
      return () => {
        var hashingUtils: Node[] = [];

        var imulName = this.getPlaceholder();
        var imulVariableDeclaration = ImulTemplate.single({ name: imulName });

        imulVariableDeclaration.$dispatcherSkip = true;

        this.imulFn = imulVariableDeclaration._hiddenId = Identifier(imulName);
        hashingUtils.push(imulVariableDeclaration);

        var hashName = this.getPlaceholder();
        var hashFunctionDeclaration = HashTemplate.single({
          name: hashName,
          imul: imulName,
        });
        this.hashFn = hashFunctionDeclaration._hiddenId = Identifier(hashName);
        hashingUtils.push(hashFunctionDeclaration);

        hashFunctionDeclaration.$dispatcherSkip = true;

        var stringName = this.getPlaceholder();
        var stringFunctionDeclaration = StringTemplate.single({
          name: stringName,
        });
        this.stringFn = stringFunctionDeclaration._hiddenId =
          Identifier(stringName);
        hashingUtils.push(stringFunctionDeclaration);

        stringFunctionDeclaration.$dispatcherSkip = true;

        var functionExpression = FunctionExpression([], clone(object.body));

        object.body = [
          ExpressionStatement(CallExpression(functionExpression, [])),
        ];

        object.$dispatcherSkip = true;

        object._hiddenHashingUtils = hashingUtils;

        var ok = this.transform(functionExpression, [
          object.body[0],
          object.body,
          object,
        ]);
        if (ok) {
          ok();
        }

        object.$eval = () => {
          if (
            isFunction(functionExpression) &&
            functionExpression.body.type == "BlockStatement"
          ) {
            if (this.lock.counterMeasuresNode) {
              functionExpression.body.body.unshift(
                clone(this.lock.counterMeasuresNode[0])
              );
            }

            functionExpression.body.body.unshift(...hashingUtils);
          }
        };
      };
    }
    ok(isFunction(object));

    if (object.generator || object.async) {
      return;
    }

    return () => {
      object.__hiddenCountermeasures = this.lock.getCounterMeasuresCode();

      object.$eval = () => {
        var functionName = this.generateIdentifier();
        var hashName = this.generateIdentifier();

        var functionDeclaration = {
          ...clone(object),
          type: "FunctionDeclaration",
          id: Identifier(functionName),
          params: object.params || [],
          body: object.body || BlockStatement([]),
          expression: false,
          $dispatcherSkip: true,
        };

        var toString = compileJsSync(functionDeclaration, this.options);

        if (!toString) {
          return;
        }

        var minified = toString.replace(/ |\n|;|,|\{|\}|\(|\)|\.|\[|\]/g, "");
        var hash = cyrb53(minified, this.seed);

        this.log(
          (object.id ? object.id.name : "function") + " -> " + hash,
          minified
        );

        var ifStatement = IfStatement(
          BinaryExpression("==", Identifier(hashName), Literal(hash)),
          [
            Template(`return {functionName}.apply(this, arguments)`).single({
              functionName: functionName,
            }),
          ]
        );
        if (
          object.__hiddenCountermeasures &&
          object.__hiddenCountermeasures.length
        ) {
          ifStatement.alternate = BlockStatement(
            object.__hiddenCountermeasures
          );
        }

        object.body = BlockStatement([
          functionDeclaration,
          VariableDeclaration(
            VariableDeclarator(
              hashName,
              CallExpression(clone(this.hashFn), [
                CallExpression(clone(this.stringFn), [
                  Identifier(functionName),
                ]),
                Literal(this.seed),
              ])
            )
          ),
          ifStatement,
        ]);

        if (object.type == "ArrowFunctionExpression") {
          object.type = "FunctionExpression";
          object.expression = false;
        }
      };
    };
  }
}
