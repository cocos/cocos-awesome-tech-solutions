"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _constants = require("../constants");

var _order = require("../order");

var _traverse = require("../traverse");

var _gen = require("../util/gen");

var _identifiers = require("../util/identifiers");

var _insert = require("../util/insert");

var _random = require("../util/random");

var _transform = _interopRequireDefault(require("./transform"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HideInitializingCode extends _transform.default {
  constructor(o) {
    super(o, _order.ObfuscateOrder.HideInitializingCode);
  }

  match(object, parents) {
    return object.type == "Program";
  }

  transform(object, parents) {
    return () => {
      var body = object.body;
      var hasExport = false;
      var stmts = [];
      var functions = [];
      var exportTypes = new Set(["ExportNamedDeclaration", "ExportSpecifier", "ExportDefaultDeclaration", "ExportAllDeclaration"]);
      var sampledNames = new Set();
      body.forEach(stmt => {
        if (stmt.type == "FunctionDeclaration") {
          functions.push(stmt);

          if (stmt.id) {
            sampledNames.add(stmt.id.name);
          }
        } else if (exportTypes.has(stmt.type)) {
          hasExport = true;
        } else {
          stmts.push(stmt);
        }
      });

      if (hasExport) {
        return;
      }

      var definedNames = new Set();

      const findNames = (o, p) => {
        (0, _identifiers.validateChain)(o, p);
        var context = (0, _insert.getVarContext)(o, p);
        (0, _traverse.walk)(o, p, (oo, pp) => {
          if (oo.type == "Identifier" && !_constants.reservedIdentifiers.has(oo.name) && !this.options.globalVariables.has(oo.name)) {
            var info = (0, _identifiers.getIdentifierInfo)(oo, pp);

            if (info.spec.isReferenced && info.spec.isDefined && (0, _insert.getVarContext)(oo, pp) === context) {
              definedNames.add(oo.name);
            }
          }
        });
      };

      (0, _traverse.walk)(object, [], (o, p) => {
        if (o.type == "VariableDeclaration" || o.type == "ClassDeclaration") {
          if (p.find(x => (0, _insert.isFunction)(x))) {
            return;
          }

          if (o.type == "VariableDeclaration") {
            return () => {
              var exprs = [];
              var fi = (0, _insert.isForInitialize)(o, p);
              o.declarations.forEach(declarator => {
                findNames(declarator.id, [declarator, o.declarations, o, ...p]);

                if (fi === "left-hand") {
                  exprs.push({ ...declarator.id
                  });
                } else {
                  exprs.push((0, _gen.AssignmentExpression)("=", declarator.id, declarator.init || (0, _gen.Identifier)("undefined")));
                }
              });

              if (fi) {
                this.replace(o, exprs.length > 1 ? (0, _gen.SequenceExpression)(exprs) : exprs[0]);
              } else {
                this.replace(o, (0, _gen.ExpressionStatement)((0, _gen.SequenceExpression)(exprs)));
              }
            };
          } else if (o.type == "ClassDeclaration") {
            if (o.id.name) {
              definedNames.add(o.id.name);
              this.replace(o, (0, _gen.ExpressionStatement)((0, _gen.AssignmentExpression)("=", (0, _gen.Identifier)(o.id.name), { ...o,
                type: "ClassExpression"
              })));
            }
          }
        }
      });
      var addNodes = [];

      if (definedNames.size) {
        addNodes.push((0, _gen.VariableDeclaration)(Array.from(definedNames).map(name => {
          return (0, _gen.VariableDeclarator)(name);
        })));
      }

      var deadValues = Object.create(null);
      Array((0, _random.getRandomInteger)(1, 20)).fill(0).forEach(() => {
        var name = this.getPlaceholder();
        var value = (0, _random.getRandomInteger)(-250, 250);
        addNodes.push((0, _gen.VariableDeclaration)((0, _gen.VariableDeclarator)(name, (0, _gen.Literal)(value))));
        deadValues[name] = value;
        sampledNames.add(name);
      });
      var map = new Map();
      var fnsToMake = (0, _random.getRandomInteger)(1, 5);
      var numberLiteralsMade = 1;

      function numberLiteral(num) {
        let depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        if (depth > 6 || Math.random() > 0.8 / depth || Math.random() > 80 / numberLiteralsMade) {
          return (0, _gen.Literal)(num);
        }

        numberLiteralsMade++;

        function ternaryCall(name) {
          let param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _random.getRandomInteger)(-250, 250);
          return (0, _gen.ConditionalExpression)((0, _gen.BinaryExpression)("==", (0, _gen.UnaryExpression)("typeof", (0, _gen.Identifier)(name)), (0, _gen.Literal)("function")), (0, _gen.CallExpression)((0, _gen.Identifier)(name), [numberLiteral(param, depth + 1)]), (0, _gen.Identifier)(name));
        }

        if (Math.random() > 0.5) {
          var fnName = (0, _random.choice)(Array.from(map.keys()));

          if (fnName) {
            var inputOutputs = map.get(fnName);
            var randomInput = (0, _random.choice)(Object.keys(inputOutputs));
            var outputValue = inputOutputs[randomInput];
            var parsed = parseFloat(randomInput);
            return (0, _gen.BinaryExpression)("-", ternaryCall(fnName, parsed), numberLiteral(outputValue - num, depth + 1));
          }
        }

        var deadValueName = (0, _random.choice)(Object.keys(deadValues));
        var actualValue = deadValues[deadValueName];

        if (Math.random() > 0.5) {
          return (0, _gen.BinaryExpression)("+", numberLiteral(num - actualValue, depth + 1), ternaryCall(deadValueName));
        }

        return (0, _gen.BinaryExpression)("-", ternaryCall(deadValueName), numberLiteral(actualValue - num, depth + 1));
      }

      for (var i = 0; i < fnsToMake; i++) {
        var name = this.getPlaceholder();
        var testShift = (0, _random.getRandomInteger)(-250, 250);
        var returnShift = (0, _random.getRandomInteger)(-250, 250);
        var inputs = (0, _random.getRandomInteger)(2, 5);
        var used = new Set();
        var uniqueNumbersNeeded = inputs * 2;

        for (var j = 0; j < uniqueNumbersNeeded; j++) {
          var num;
          var k = 0;

          do {
            num = (0, _random.getRandomInteger)(-250, 250 + k * 100);
            k++;
          } while (used.has(num));

          used.add(num);
        }

        var inputOutput = Object.create(null);
        var array = Array.from(used);

        for (var j = 0; j < array.length; j += 2) {
          inputOutput[array[j]] = array[j + 1];
        }

        var cases = Object.keys(inputOutput).map(input => {
          var parsed = parseFloat(input);
          return (0, _gen.SwitchCase)(numberLiteral(parsed + testShift), [(0, _gen.ExpressionStatement)((0, _gen.AssignmentExpression)("=", (0, _gen.Identifier)("input"), numberLiteral(inputOutput[input] - returnShift))), (0, _gen.BreakStatement)()]);
        });
        var functionExpression = (0, _gen.FunctionExpression)([(0, _gen.Identifier)("testShift"), (0, _gen.Identifier)("returnShift")], [(0, _gen.ReturnStatement)((0, _gen.FunctionExpression)([(0, _gen.Identifier)("input")], [(0, _gen.SwitchStatement)((0, _gen.BinaryExpression)("+", (0, _gen.Identifier)("input"), (0, _gen.Identifier)("testShift")), cases), (0, _gen.ReturnStatement)((0, _gen.BinaryExpression)("+", (0, _gen.Identifier)("input"), (0, _gen.Identifier)("returnShift")))]))]);
        var variableDeclaration = (0, _gen.VariableDeclaration)((0, _gen.VariableDeclarator)(name, (0, _gen.CallExpression)(functionExpression, [numberLiteral(testShift), numberLiteral(returnShift)])));
        addNodes.push(variableDeclaration);
        map.set(name, inputOutput);
        sampledNames.add(name);
      }

      var deadNameArray = Object.keys(deadValues);
      var sampledArray = Array.from(sampledNames);
      var check = (0, _random.getRandomInteger)(-250, 250);
      var initName = "init" + this.getPlaceholder(); // Entangle number literals

      var made = 1; // Limit frequency

      (0, _traverse.walk)(stmts, [], (o, p) => {
        if (o.type == "Literal" && typeof o.value === "number" && Math.floor(o.value) === o.value && Math.abs(o.value) < 100000 && Math.random() < 4 / made) {
          made++;
          return () => {
            this.replaceIdentifierOrLiteral(o, numberLiteral(o.value), p);
          };
        }
      }); // Create the new function

      addNodes.push((0, _gen.FunctionDeclaration)(initName, [], [...stmts]));

      function truePredicate() {
        return (0, _gen.BinaryExpression)(">", (0, _gen.Literal)(600 + (0, _random.getRandomInteger)(200, 800)), (0, _gen.Literal)(400 - (0, _random.getRandomInteger)(0, 600)));
      }

      function falsePredicate() {
        return (0, _gen.BinaryExpression)(">", (0, _gen.Literal)(400 - (0, _random.getRandomInteger)(0, 600)), (0, _gen.Literal)(600 + (0, _random.getRandomInteger)(200, 800)));
      }

      function safeCallExpression(name, param) {
        return (0, _gen.ConditionalExpression)((0, _gen.BinaryExpression)("==", (0, _gen.UnaryExpression)("typeof", (0, _gen.Identifier)(name)), (0, _gen.Literal)("function")), (0, _gen.CallExpression)((0, _gen.MemberExpression)((0, _gen.Identifier)(name), (0, _gen.Identifier)("call"), false), [(0, _gen.ThisExpression)(), numberLiteral(param)]), (0, _gen.Identifier)(name));
      }

      function ternaryHell(expr) {
        let depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        if (!depth || depth > 5 || Math.random() > 0.99 / (depth / 2)) {
          return expr;
        }

        var deadCode = safeCallExpression((0, _random.choice)(sampledArray), (0, _random.getRandomInteger)(-250, 250));

        if (Math.random() > 0.5) {
          return (0, _gen.ConditionalExpression)(truePredicate(), ternaryHell(expr, depth + 1), ternaryHell(deadCode, depth + 1));
        }

        return (0, _gen.ConditionalExpression)(falsePredicate(), ternaryHell(deadCode, depth + 1), ternaryHell(expr, depth + 1));
      } // Array of random ternary expressions


      var concealedCall = []; // Add 'dead calls', these expression don't call anything

      Array((0, _random.getRandomInteger)(2, 8)).fill(0).forEach(() => {
        concealedCall.push((0, _gen.ExpressionStatement)(ternaryHell(safeCallExpression((0, _random.choice)(deadNameArray), (0, _random.getRandomInteger)(-250, 250)))));
      }); // The real call to the 'init' function

      concealedCall.push((0, _gen.ExpressionStatement)(ternaryHell(safeCallExpression(initName, check))));
      (0, _random.shuffle)(concealedCall);
      (0, _random.shuffle)(functions);
      object.body = [...addNodes, ...functions, ...concealedCall];
    };
  }

}

exports.default = HideInitializingCode;