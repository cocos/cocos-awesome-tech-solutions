import { reservedIdentifiers } from "../constants";
import { ObfuscateOrder } from "../order";
import { walk } from "../traverse";
import {
  AssignmentExpression,
  BinaryExpression,
  BreakStatement,
  CallExpression,
  ConditionalExpression,
  ExpressionStatement,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  Literal,
  MemberExpression,
  ReturnStatement,
  SequenceExpression,
  SwitchCase,
  SwitchStatement,
  ThisExpression,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
} from "../util/gen";
import { getIdentifierInfo, validateChain } from "../util/identifiers";
import { getVarContext, isForInitialize, isFunction } from "../util/insert";
import { choice, getRandomInteger, shuffle } from "../util/random";
import Transform from "./transform";

export default class HideInitializingCode extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.HideInitializingCode);
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
      var exportTypes = new Set([
        "ExportNamedDeclaration",
        "ExportSpecifier",
        "ExportDefaultDeclaration",
        "ExportAllDeclaration",
      ]);

      var sampledNames = new Set<string>();

      body.forEach((stmt) => {
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

      var definedNames = new Set<string>();

      const findNames = (o, p) => {
        validateChain(o, p);
        var context = getVarContext(o, p);
        walk(o, p, (oo, pp) => {
          if (
            oo.type == "Identifier" &&
            !reservedIdentifiers.has(oo.name) &&
            !this.options.globalVariables.has(oo.name)
          ) {
            var info = getIdentifierInfo(oo, pp);
            if (
              info.spec.isReferenced &&
              info.spec.isDefined &&
              getVarContext(oo, pp) === context
            ) {
              definedNames.add(oo.name);
            }
          }
        });
      };

      walk(object, [], (o, p) => {
        if (o.type == "VariableDeclaration" || o.type == "ClassDeclaration") {
          if (p.find((x) => isFunction(x))) {
            return;
          }
          if (o.type == "VariableDeclaration") {
            return () => {
              var exprs = [];
              var fi = isForInitialize(o, p);
              o.declarations.forEach((declarator) => {
                findNames(declarator.id, [declarator, o.declarations, o, ...p]);
                if (fi === "left-hand") {
                  exprs.push({ ...declarator.id });
                } else {
                  exprs.push(
                    AssignmentExpression(
                      "=",
                      declarator.id,
                      declarator.init || Identifier("undefined")
                    )
                  );
                }
              });

              if (fi) {
                this.replace(
                  o,
                  exprs.length > 1 ? SequenceExpression(exprs) : exprs[0]
                );
              } else {
                this.replace(o, ExpressionStatement(SequenceExpression(exprs)));
              }
            };
          } else if (o.type == "ClassDeclaration") {
            if (o.id.name) {
              definedNames.add(o.id.name);

              this.replace(
                o,
                ExpressionStatement(
                  AssignmentExpression("=", Identifier(o.id.name), {
                    ...o,
                    type: "ClassExpression",
                  })
                )
              );
            }
          }
        }
      });

      var addNodes = [];
      if (definedNames.size) {
        addNodes.push(
          VariableDeclaration(
            Array.from(definedNames).map((name) => {
              return VariableDeclarator(name);
            })
          )
        );
      }

      var deadValues: { [name: string]: number } = Object.create(null);
      Array(getRandomInteger(1, 20))
        .fill(0)
        .forEach(() => {
          var name = this.getPlaceholder();
          var value = getRandomInteger(-250, 250);
          addNodes.push(
            VariableDeclaration(VariableDeclarator(name, Literal(value)))
          );

          deadValues[name] = value;
          sampledNames.add(name);
        });

      var map = new Map<string, { [input: number]: number }>();
      var fnsToMake = getRandomInteger(1, 5);

      var numberLiteralsMade = 1;
      function numberLiteral(num: number, depth = 1) {
        if (
          depth > 6 ||
          Math.random() > 0.8 / depth ||
          Math.random() > 80 / numberLiteralsMade
        ) {
          return Literal(num);
        }

        numberLiteralsMade++;

        function ternaryCall(
          name: string,
          param: number = getRandomInteger(-250, 250)
        ) {
          return ConditionalExpression(
            BinaryExpression(
              "==",
              UnaryExpression("typeof", Identifier(name)),
              Literal("function")
            ),
            CallExpression(Identifier(name), [numberLiteral(param, depth + 1)]),
            Identifier(name)
          );
        }

        if (Math.random() > 0.5) {
          var fnName = choice(Array.from(map.keys()));
          if (fnName) {
            var inputOutputs = map.get(fnName);
            var randomInput = choice(Object.keys(inputOutputs));
            var outputValue = inputOutputs[randomInput];
            var parsed = parseFloat(randomInput);

            return BinaryExpression(
              "-",

              ternaryCall(fnName, parsed),
              numberLiteral(outputValue - num, depth + 1)
            );
          }
        }

        var deadValueName = choice(Object.keys(deadValues));
        var actualValue = deadValues[deadValueName];

        if (Math.random() > 0.5) {
          return BinaryExpression(
            "+",
            numberLiteral(num - actualValue, depth + 1),
            ternaryCall(deadValueName)
          );
        }

        return BinaryExpression(
          "-",
          ternaryCall(deadValueName),
          numberLiteral(actualValue - num, depth + 1)
        );
      }

      for (var i = 0; i < fnsToMake; i++) {
        var name = this.getPlaceholder();
        var testShift = getRandomInteger(-250, 250);
        var returnShift = getRandomInteger(-250, 250);

        var inputs = getRandomInteger(2, 5);
        var used = new Set<number>();
        var uniqueNumbersNeeded = inputs * 2;
        for (var j = 0; j < uniqueNumbersNeeded; j++) {
          var num;
          var k = 0;
          do {
            num = getRandomInteger(-250, 250 + k * 100);
            k++;
          } while (used.has(num));

          used.add(num);
        }

        var inputOutput = Object.create(null);
        var array: number[] = Array.from(used);
        for (var j = 0; j < array.length; j += 2) {
          inputOutput[array[j]] = array[j + 1];
        }

        var cases = Object.keys(inputOutput).map((input) => {
          var parsed = parseFloat(input);

          return SwitchCase(numberLiteral(parsed + testShift), [
            ExpressionStatement(
              AssignmentExpression(
                "=",
                Identifier("input"),
                numberLiteral(inputOutput[input] - returnShift)
              )
            ),
            BreakStatement(),
          ]);
        });

        var functionExpression = FunctionExpression(
          [Identifier("testShift"), Identifier("returnShift")],
          [
            ReturnStatement(
              FunctionExpression(
                [Identifier("input")],
                [
                  SwitchStatement(
                    BinaryExpression(
                      "+",
                      Identifier("input"),
                      Identifier("testShift")
                    ),
                    cases
                  ),

                  ReturnStatement(
                    BinaryExpression(
                      "+",
                      Identifier("input"),
                      Identifier("returnShift")
                    )
                  ),
                ]
              )
            ),
          ]
        );

        var variableDeclaration = VariableDeclaration(
          VariableDeclarator(
            name,
            CallExpression(functionExpression, [
              numberLiteral(testShift),
              numberLiteral(returnShift),
            ])
          )
        );
        addNodes.push(variableDeclaration);

        map.set(name, inputOutput);
        sampledNames.add(name);
      }

      var deadNameArray = Object.keys(deadValues);
      var sampledArray = Array.from(sampledNames);

      var check = getRandomInteger(-250, 250);

      var initName = "init" + this.getPlaceholder();

      // Entangle number literals
      var made = 1; // Limit frequency
      walk(stmts, [], (o, p) => {
        if (
          o.type == "Literal" &&
          typeof o.value === "number" &&
          Math.floor(o.value) === o.value &&
          Math.abs(o.value) < 100_000 &&
          Math.random() < 4 / made
        ) {
          made++;
          return () => {
            this.replaceIdentifierOrLiteral(o, numberLiteral(o.value), p);
          };
        }
      });

      // Create the new function
      addNodes.push(FunctionDeclaration(initName, [], [...stmts]));

      function truePredicate() {
        return BinaryExpression(
          ">",
          Literal(600 + getRandomInteger(200, 800)),
          Literal(400 - getRandomInteger(0, 600))
        );
      }
      function falsePredicate() {
        return BinaryExpression(
          ">",
          Literal(400 - getRandomInteger(0, 600)),
          Literal(600 + getRandomInteger(200, 800))
        );
      }

      function safeCallExpression(name, param: number) {
        return ConditionalExpression(
          BinaryExpression(
            "==",
            UnaryExpression("typeof", Identifier(name)),
            Literal("function")
          ),
          CallExpression(
            MemberExpression(Identifier(name), Identifier("call"), false),
            [ThisExpression(), numberLiteral(param)]
          ),
          Identifier(name)
        );
      }

      function ternaryHell(expr, depth = 1) {
        if (!depth || depth > 5 || Math.random() > 0.99 / (depth / 2)) {
          return expr;
        }

        var deadCode = safeCallExpression(
          choice(sampledArray),
          getRandomInteger(-250, 250)
        );

        if (Math.random() > 0.5) {
          return ConditionalExpression(
            truePredicate(),
            ternaryHell(expr, depth + 1),
            ternaryHell(deadCode, depth + 1)
          );
        }

        return ConditionalExpression(
          falsePredicate(),
          ternaryHell(deadCode, depth + 1),
          ternaryHell(expr, depth + 1)
        );
      }

      // Array of random ternary expressions
      var concealedCall = [];

      // Add 'dead calls', these expression don't call anything
      Array(getRandomInteger(2, 8))
        .fill(0)
        .forEach(() => {
          concealedCall.push(
            ExpressionStatement(
              ternaryHell(
                safeCallExpression(
                  choice(deadNameArray),
                  getRandomInteger(-250, 250)
                )
              )
            )
          );
        });

      // The real call to the 'init' function
      concealedCall.push(
        ExpressionStatement(ternaryHell(safeCallExpression(initName, check)))
      );

      shuffle(concealedCall);
      shuffle(functions);

      object.body = [...addNodes, ...functions, ...concealedCall];
    };
  }
}
