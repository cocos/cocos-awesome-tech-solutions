import Template from "../../templates/template";
import Transform from "../transform";
import { ObfuscateOrder } from "../../order";
import {
  Node,
  Location,
  CallExpression,
  Identifier,
  Literal,
  FunctionDeclaration,
  ReturnStatement,
  MemberExpression,
  SwitchStatement,
  SwitchCase,
  LogicalExpression,
  VariableDeclarator,
  FunctionExpression,
  ExpressionStatement,
  SequenceExpression,
  AssignmentExpression,
  VariableDeclaration,
  BreakStatement,
} from "../../util/gen";
import { append, prepend } from "../../util/insert";
import { getIdentifierInfo } from "../../util/identifiers";
import { getRandomInteger } from "../../util/random";
import { reservedIdentifiers, reservedKeywords } from "../../constants";
import { ComputeProbabilityMap } from "../../probability";

class GlobalAnalysis extends Transform {
  notGlobals: Set<string>;
  globals: { [name: string]: Location[] };

  constructor(o) {
    super(o);

    this.globals = Object.create(null);
    this.notGlobals = new Set();
  }

  match(object: Node, parents: Node[]) {
    return object.type == "Identifier" && !reservedKeywords.has(object.name);
  }

  transform(object: Node, parents: Node[]) {
    // no touching `import()` or `import x from ...`
    var importIndex = parents.findIndex(
      (x) => x.type == "ImportExpression" || x.type == "ImportDeclaration"
    );
    if (importIndex !== -1) {
      if (
        parents[importIndex].source === (parents[importIndex - 1] || object)
      ) {
        return;
      }
    }

    var info = getIdentifierInfo(object, parents);
    if (!info.spec.isReferenced) {
      return;
    }

    // Add to globals
    if (!this.notGlobals.has(object.name)) {
      if (!this.globals[object.name]) {
        this.globals[object.name] = [];
      }

      this.globals[object.name].push([object, parents]);
    }

    if (info.spec.isDefined || info.spec.isModified) {
      delete this.globals[object.name];

      this.notGlobals.add(object.name);
    }

    var assignmentIndex = parents.findIndex(
      (x) => x.type == "AssignmentExpression"
    );
    var updateIndex = parents.findIndex((x) => x.type == "UpdateExpression");

    if (
      (assignmentIndex != -1 &&
        parents[assignmentIndex].left ===
          (parents[assignmentIndex - 1] || object)) ||
      updateIndex != -1
    ) {
      var memberIndex = parents.findIndex((x) => x.type == "MemberExpression");
      if (
        memberIndex == -1 ||
        memberIndex > (assignmentIndex == -1 ? assignmentIndex : updateIndex)
      ) {
        delete this.globals[object.name];

        this.notGlobals.add(object.name);
      }
    }
  }
}

/**
 * Global Concealing hides global variables being accessed.
 *
 * - Any variable that is not defined is considered "global"
 */
export default class GlobalConcealing extends Transform {
  globalAnalysis: GlobalAnalysis;

  constructor(o) {
    super(o, ObfuscateOrder.GlobalConcealing);

    this.globalAnalysis = new GlobalAnalysis(o);
    this.before.push(this.globalAnalysis);
  }

  match(object: Node, parents: Node[]) {
    return object.type == "Program";
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      var globals: { [name: string]: Location[] } = this.globalAnalysis.globals;
      this.globalAnalysis.notGlobals.forEach((del) => {
        delete globals[del];
      });

      delete globals["require"];

      reservedIdentifiers.forEach((x) => {
        delete globals[x];
      });

      Object.keys(globals).forEach((x) => {
        if (this.globalAnalysis.globals[x].length < 1) {
          delete globals[x];
        } else if (
          !ComputeProbabilityMap(this.options.globalConcealing, (x) => x, x)
        ) {
          delete globals[x];
        }
      });

      // this.log(Object.keys(globals).join(', '))

      if (Object.keys(globals).length > 0) {
        var used = new Set();

        // 1. Make getter function

        // holds "window" or "global"
        var globalVar = this.getPlaceholder();

        // holds outermost "this"
        var thisVar = this.getPlaceholder();

        // "window" or "global" in node
        var global =
          this.options.globalVariables.values().next().value || "window";
        var getGlobalVariableFnName = this.getPlaceholder();
        var getThisVariableFnName = this.getPlaceholder();

        // Returns global variable or fall backs to `this`
        var getGlobalVariableFn = Template(`
        var ${getGlobalVariableFnName} = function(){
          try {
            return ${global};
          } catch (e){
            return ${getThisVariableFnName}["call"](this);
          }
        }`).single();

        var getThisVariableFn = Template(`
        var ${getThisVariableFnName} = function(){
          try {
            return this;
          } catch (e){
            return null;
          }
        }`).single();

        // 2. Replace old accessors
        var globalFn = this.getPlaceholder();

        var newNames = Object.create(null);

        Object.keys(globals).forEach((name) => {
          var locations: Location[] = globals[name];
          var state;
          do {
            state = getRandomInteger(-1000, 1000 + used.size);
          } while (used.has(state));
          used.add(state);

          newNames[name] = state;

          locations.forEach(([node, parents]) => {
            if (!parents.find((x) => x.$dispatcherSkip)) {
              // Do not replace
              if (parents[0]) {
                if (
                  parents[0].type == "ClassDeclaration" ||
                  parents[0].type == "ClassExpression" ||
                  parents[0].type == "FunctionExpression" ||
                  parents[0].type == "FunctionDeclaration"
                ) {
                  if (parents[0].id === node) {
                    return;
                  }
                }
              }

              this.replace(
                node,
                CallExpression(Identifier(globalFn), [Literal(state)])
              );
            }
          });
        });

        // Adds all global variables to the switch statement
        this.options.globalVariables.forEach((name) => {
          if (!newNames[name]) {
            var state;
            do {
              state = getRandomInteger(
                -1000,
                1000 + used.size + this.options.globalVariables.size * 100
              );
            } while (used.has(state));
            used.add(state);

            newNames[name] = state;
          }
        });

        var indexParamName = this.getPlaceholder();
        var returnName = this.getPlaceholder();

        var functionDeclaration = FunctionDeclaration(
          globalFn,
          [Identifier(indexParamName)],
          [
            VariableDeclaration(VariableDeclarator(returnName)),
            SwitchStatement(
              Identifier(indexParamName),
              Object.keys(newNames).map((name) => {
                var code = newNames[name];
                var body: Node[] = [
                  ReturnStatement(
                    LogicalExpression(
                      "||",
                      MemberExpression(
                        Identifier(globalVar),
                        Literal(name),
                        true
                      ),
                      MemberExpression(Identifier(thisVar), Literal(name), true)
                    )
                  ),
                ];
                if (Math.random() > 0.5 && name) {
                  body = [
                    ExpressionStatement(
                      AssignmentExpression(
                        "=",
                        Identifier(returnName),
                        LogicalExpression(
                          "||",
                          Literal(name),
                          MemberExpression(
                            Identifier(thisVar),
                            Literal(name),
                            true
                          )
                        )
                      )
                    ),
                    BreakStatement(),
                  ];
                }

                return SwitchCase(Literal(code), body);
              })
            ),
            ReturnStatement(
              LogicalExpression(
                "||",
                MemberExpression(
                  Identifier(globalVar),
                  Identifier(returnName),
                  true
                ),
                MemberExpression(
                  Identifier(thisVar),
                  Identifier(returnName),
                  true
                )
              )
            ),
          ]
        );

        var tempVar = this.getPlaceholder();

        var variableDeclaration = Template(`
        var ${globalVar}, ${thisVar};
        `).single();

        variableDeclaration.declarations.push(
          VariableDeclarator(
            tempVar,
            CallExpression(
              MemberExpression(
                FunctionExpression(
                  [],
                  [
                    getGlobalVariableFn,
                    getThisVariableFn,

                    Template(
                      `return ${thisVar} = ${getThisVariableFnName}["call"](this, ${globalFn}), ${globalVar} = ${getGlobalVariableFnName}["call"](this)`
                    ).single(),
                  ]
                ),
                Literal("call"),
                true
              ),
              []
            )
          )
        );

        prepend(object, variableDeclaration);
        append(object, functionDeclaration);
      }
    };
  }
}
