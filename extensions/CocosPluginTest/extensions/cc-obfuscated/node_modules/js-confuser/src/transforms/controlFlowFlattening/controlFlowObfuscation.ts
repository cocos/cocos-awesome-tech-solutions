import { ok } from "assert";
import { ComputeProbabilityMap } from "../../probability";
import { walk } from "../../traverse";
import {
  AssignmentExpression,
  BinaryExpression,
  BreakStatement,
  ExpressionStatement,
  Identifier,
  IfStatement,
  Literal,
  Node,
  SwitchCase,
  SwitchStatement,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
} from "../../util/gen";
import { containsLexicallyBoundVariables } from "../../util/identifiers";
import { clone, getBlockBody } from "../../util/insert";
import { getRandomInteger, shuffle } from "../../util/random";
import Transform from "../transform";

/**
 * Obfuscates For and While statements.
 */
export default class ControlFlowObfuscation extends Transform {
  constructor(o) {
    super(o);
  }

  match(object: Node, parents: Node[]) {
    return object.type === "ForStatement" || object.type === "WhileStatement";
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      if (object.$controlFlowObfuscation) {
        // avoid infinite loop
        return;
      }

      if (containsLexicallyBoundVariables(object, parents)) {
        return;
      }

      var illegal = false;
      walk(object, parents, (o, p) => {
        if (o.type == "FunctionDeclaration" || o.type == "BreakStatement") {
          illegal = true;
          return "EXIT";
        }
      });

      if (illegal) {
        return;
      }

      var body =
        parents[0].type == "LabeledStatement" ? parents[1] : parents[0];
      var element = parents[0].type == "LabeledStatement" ? parents[0] : object;

      // No place to insert more statements
      if (!Array.isArray(body)) {
        return;
      }

      // No place to insert variable declaration
      if (body.indexOf(element) === -1) {
        return;
      }

      if (
        !ComputeProbabilityMap(this.options.controlFlowFlattening, (x) => x)
      ) {
        return;
      }

      var init = [];
      var update = [];
      var test: Node = null;
      var consequent = [];

      if (object.type === "ForStatement") {
        if (object.init) {
          init.push(object.init);
        }
        if (object.update) {
          update.push(ExpressionStatement(object.update));
        }
        if (object.test) {
          test = object.test || Literal(true);
        }
      } else if (object.type === "WhileStatement") {
        if (object.test) {
          test = object.test;
        }
      } else {
        throw new Error("Unknown type: " + object.type);
      }

      if (object.body.type == "BlockStatement") {
        consequent.push(...getBlockBody(object.body));
      } else {
        consequent.push(object.body);
      }

      if (!test) {
        test = Literal(true);
      }

      ok(test);

      init.forEach((o) => {
        if (
          o.type !== "VariableDeclaration" &&
          o.type !== "ExpressionStatement"
        ) {
          this.replace(o, ExpressionStatement(clone(o)));
        }
      });

      var stateVar = this.getPlaceholder();

      var selection = new Set();

      //            init 0  test 1  run 2  update 3  end 4
      var states: number[] = [];

      // Create 5 random unique number
      while (states.length < 5) {
        var newState;
        do {
          newState = getRandomInteger(0, 1000 + states.length);
        } while (selection.has(newState));

        ok(!isNaN(newState));

        states.push(newState);
        selection.add(newState);
      }
      ok(selection.size === states.length);
      ok(states.length === 5);

      var startState = states[0];
      var testState = states[1];
      var bodyState = states[2];
      var updateState = states[3];
      var endState = states[4];

      body.splice(
        body.indexOf(element),
        0,
        VariableDeclaration(VariableDeclarator(stateVar, Literal(startState)))
      );

      function goto(from: number, to: number) {
        var diff = to - from;
        ok(!isNaN(diff));
        return ExpressionStatement(
          AssignmentExpression("+=", Identifier(stateVar), Literal(diff))
        );
      }

      var cases = [
        SwitchCase(Literal(startState), [
          ...init,
          goto(startState, testState),
          BreakStatement(),
        ]),
        SwitchCase(Literal(testState), [
          IfStatement(
            test,
            [goto(testState, bodyState)],
            [goto(testState, endState)]
          ),
          BreakStatement(),
        ]),
        SwitchCase(Literal(bodyState), [
          ...consequent,
          goto(bodyState, updateState),
          BreakStatement(),
        ]),
        SwitchCase(Literal(updateState), [
          ...update,
          goto(updateState, testState),
          BreakStatement(),
        ]),
      ];

      this.replace(
        object,
        WhileStatement(
          BinaryExpression("!=", Identifier(stateVar), Literal(endState)),
          [SwitchStatement(Identifier(stateVar), cases)]
        )
      );

      // Marked to not be infinite
      object.$controlFlowObfuscation = 1;
    };
  }
}
