"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assert = require("assert");

var _probability = require("../../probability");

var _traverse = require("../../traverse");

var _gen = require("../../util/gen");

var _identifiers = require("../../util/identifiers");

var _insert = require("../../util/insert");

var _random = require("../../util/random");

var _transform = _interopRequireDefault(require("../transform"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Obfuscates For and While statements.
 */
class ControlFlowObfuscation extends _transform.default {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return object.type === "ForStatement" || object.type === "WhileStatement";
  }

  transform(object, parents) {
    return () => {
      if (object.$controlFlowObfuscation) {
        // avoid infinite loop
        return;
      }

      if ((0, _identifiers.containsLexicallyBoundVariables)(object, parents)) {
        return;
      }

      var illegal = false;
      (0, _traverse.walk)(object, parents, (o, p) => {
        if (o.type == "FunctionDeclaration" || o.type == "BreakStatement") {
          illegal = true;
          return "EXIT";
        }
      });

      if (illegal) {
        return;
      }

      var body = parents[0].type == "LabeledStatement" ? parents[1] : parents[0];
      var element = parents[0].type == "LabeledStatement" ? parents[0] : object; // No place to insert more statements

      if (!Array.isArray(body)) {
        return;
      } // No place to insert variable declaration


      if (body.indexOf(element) === -1) {
        return;
      }

      if (!(0, _probability.ComputeProbabilityMap)(this.options.controlFlowFlattening, x => x)) {
        return;
      }

      var init = [];
      var update = [];
      var test = null;
      var consequent = [];

      if (object.type === "ForStatement") {
        if (object.init) {
          init.push(object.init);
        }

        if (object.update) {
          update.push((0, _gen.ExpressionStatement)(object.update));
        }

        if (object.test) {
          test = object.test || (0, _gen.Literal)(true);
        }
      } else if (object.type === "WhileStatement") {
        if (object.test) {
          test = object.test;
        }
      } else {
        throw new Error("Unknown type: " + object.type);
      }

      if (object.body.type == "BlockStatement") {
        consequent.push(...(0, _insert.getBlockBody)(object.body));
      } else {
        consequent.push(object.body);
      }

      if (!test) {
        test = (0, _gen.Literal)(true);
      }

      (0, _assert.ok)(test);
      init.forEach(o => {
        if (o.type !== "VariableDeclaration" && o.type !== "ExpressionStatement") {
          this.replace(o, (0, _gen.ExpressionStatement)((0, _insert.clone)(o)));
        }
      });
      var stateVar = this.getPlaceholder();
      var selection = new Set(); //            init 0  test 1  run 2  update 3  end 4

      var states = []; // Create 5 random unique number

      while (states.length < 5) {
        var newState;

        do {
          newState = (0, _random.getRandomInteger)(0, 1000 + states.length);
        } while (selection.has(newState));

        (0, _assert.ok)(!isNaN(newState));
        states.push(newState);
        selection.add(newState);
      }

      (0, _assert.ok)(selection.size === states.length);
      (0, _assert.ok)(states.length === 5);
      var startState = states[0];
      var testState = states[1];
      var bodyState = states[2];
      var updateState = states[3];
      var endState = states[4];
      body.splice(body.indexOf(element), 0, (0, _gen.VariableDeclaration)((0, _gen.VariableDeclarator)(stateVar, (0, _gen.Literal)(startState))));

      function goto(from, to) {
        var diff = to - from;
        (0, _assert.ok)(!isNaN(diff));
        return (0, _gen.ExpressionStatement)((0, _gen.AssignmentExpression)("+=", (0, _gen.Identifier)(stateVar), (0, _gen.Literal)(diff)));
      }

      var cases = [(0, _gen.SwitchCase)((0, _gen.Literal)(startState), [...init, goto(startState, testState), (0, _gen.BreakStatement)()]), (0, _gen.SwitchCase)((0, _gen.Literal)(testState), [(0, _gen.IfStatement)(test, [goto(testState, bodyState)], [goto(testState, endState)]), (0, _gen.BreakStatement)()]), (0, _gen.SwitchCase)((0, _gen.Literal)(bodyState), [...consequent, goto(bodyState, updateState), (0, _gen.BreakStatement)()]), (0, _gen.SwitchCase)((0, _gen.Literal)(updateState), [...update, goto(updateState, testState), (0, _gen.BreakStatement)()])];
      this.replace(object, (0, _gen.WhileStatement)((0, _gen.BinaryExpression)("!=", (0, _gen.Identifier)(stateVar), (0, _gen.Literal)(endState)), [(0, _gen.SwitchStatement)((0, _gen.Identifier)(stateVar), cases)])); // Marked to not be infinite

      object.$controlFlowObfuscation = 1;
    };
  }

}

exports.default = ControlFlowObfuscation;