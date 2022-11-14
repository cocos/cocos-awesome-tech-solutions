import Transform from "../transform";
import {
  Identifier,
  Literal,
  VariableDeclaration,
  Node,
  ArrayExpression,
  MemberExpression,
  VariableDeclarator,
  Location,
  ReturnStatement,
  CallExpression,
  BinaryExpression,
  FunctionDeclaration,
  ThisExpression,
  FunctionExpression,
} from "../../util/gen";
import {
  append,
  clone,
  getLexContext,
  isLexContext,
  prepend,
} from "../../util/insert";
import { isDirective, isPrimitive } from "../../util/compare";

import { ObfuscateOrder } from "../../order";
import { isModuleSource } from "../string/stringConcealing";
import { ComputeProbabilityMap } from "../../probability";
import { ok } from "assert";
import { choice, getRandomInteger } from "../../util/random";

/**
 * [Duplicate Literals Removal](https://docs.jscrambler.com/code-integrity/documentation/transformations/duplicate-literals-removal) replaces duplicate literals with a variable name.
 *
 * - Potency Medium
 * - Resilience Medium
 * - Cost Medium
 *
 * ```js
 * // Input
 * var foo = "http://www.example.xyz";
 * bar("http://www.example.xyz");
 *
 * // Output
 * var a = "http://www.example.xyz";
 * var foo = a;
 * bar(a);
 * ```
 */
export default class DuplicateLiteralsRemoval extends Transform {
  arrayName: string;
  arrayExpression: Node;
  map: Map<string, number>;
  first: Map<string, Location | null>;

  /**
   * getter fn name -> accumulative shift
   */
  fnShifts: Map<string, number>;

  /**
   * lex context -> getter fn name
   */
  fnGetters: Map<Node, string>;

  constructor(o) {
    super(o, ObfuscateOrder.DuplicateLiteralsRemoval);

    this.map = new Map();
    this.first = new Map();

    this.fnShifts = new Map();
    this.fnGetters = new Map();
  }

  apply(tree) {
    super.apply(tree);

    if (this.arrayName && this.arrayExpression.elements.length) {
      var getArrayFn = this.getPlaceholder();
      append(
        tree,
        FunctionDeclaration(
          getArrayFn,
          [],
          [ReturnStatement(this.arrayExpression)]
        )
      );

      prepend(
        tree,
        VariableDeclaration(
          VariableDeclarator(
            this.arrayName,
            CallExpression(
              MemberExpression(
                Identifier(getArrayFn),
                Identifier("call"),
                false
              ),
              [ThisExpression()]
            )
          )
        )
      );
    }
  }

  match(object: Node, parents: Node[]) {
    return (
      isPrimitive(object) &&
      !isDirective(object, parents) &&
      !isModuleSource(object, parents) &&
      !parents.find((x) => x.$dispatcherSkip)
    );
  }

  /**
   * Converts ordinary literal to go through a getter function.
   * @param object
   * @param parents
   * @param index
   */
  toCaller(object: Node, parents: Node[], index: number) {
    // get all the getters defined here or higher
    var getterNames = [object, ...parents]
      .map((x) => this.fnGetters.get(x))
      .filter((x) => x);

    // use random getter function
    var getterName = choice(getterNames);

    // get this literals context
    var lexContext = getLexContext(object, parents);

    var hasGetterHere = this.fnGetters.has(lexContext);

    // create one if none are available (or by random chance if none are here locally)
    var shouldCreateNew =
      !getterName || (!hasGetterHere && Math.random() > 0.9);

    if (shouldCreateNew) {
      ok(!this.fnGetters.has(lexContext));

      var lexContextIndex = parents.findIndex(
        (x) => x !== lexContext && isLexContext(x)
      );
      var basedOn =
        lexContextIndex !== -1
          ? choice(
              parents
                .slice(lexContextIndex + 1)
                .map((x) => this.fnGetters.get(x))
                .filter((x) => x)
            )
          : null;

      var body = [];
      var thisShift = getRandomInteger(-250, 250);
      // the name of the getter
      getterName = this.getPlaceholder();

      if (basedOn) {
        var shift = this.fnShifts.get(basedOn);
        ok(typeof shift === "number");

        body = [
          ReturnStatement(
            CallExpression(Identifier(basedOn), [
              BinaryExpression("+", Identifier("index"), Literal(thisShift)),
            ])
          ),
        ];

        this.fnShifts.set(getterName, shift + thisShift);
      } else {
        // from scratch

        body = [
          ReturnStatement(
            MemberExpression(
              Identifier(this.arrayName),
              BinaryExpression("+", Identifier("index"), Literal(thisShift)),
              true
            )
          ),
        ];

        this.fnShifts.set(getterName, thisShift);
      }

      this.fnGetters.set(lexContext, getterName);

      prepend(
        lexContext,
        VariableDeclaration(
          VariableDeclarator(
            getterName,
            CallExpression(
              FunctionExpression(
                [],
                [
                  ReturnStatement(
                    FunctionExpression([Identifier("index")], body)
                  ),
                ]
              ),
              []
            )
          )
        )
      );
    }

    var theShift = this.fnShifts.get(getterName);

    this.replaceIdentifierOrLiteral(
      object,
      CallExpression(Identifier(getterName), [Literal(index - theShift)]),
      parents
    );
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      var value = object.value;
      if (object.regex) {
        return;
      }

      if (!ComputeProbabilityMap(this.options.duplicateLiteralsRemoval)) {
        return;
      }

      if (
        this.arrayName &&
        parents[0].object &&
        parents[0].object.name == this.arrayName
      ) {
        return;
      }

      var value;
      if (object.type == "Literal") {
        value = typeof object.value + ":" + object.value;
        if (object.value === null) {
          value = "null:null";
        } else {
          // Skip empty strings
          if (typeof object.value === "string" && !object.value) {
            return;
          }
        }
      } else if (object.type == "Identifier") {
        value = "identifier:" + object.name;
      } else {
        throw new Error("Unsupported primitive type: " + object.type);
      }

      ok(value);

      if (!this.first.has(value) && !this.map.has(value)) {
        this.first.set(value, [object, parents]);
      } else {
        if (!this.arrayName) {
          this.arrayName = this.getPlaceholder();
          this.arrayExpression = ArrayExpression([]);
        }

        var first = this.first.get(value);
        if (first) {
          this.first.set(value, null);
          var index = this.map.size;

          ok(!this.map.has(value));
          this.map.set(value, index);

          this.toCaller(first[0], first[1], index);

          var pushing = clone(object);
          this.arrayExpression.elements.push(pushing);

          ok(this.arrayExpression.elements[index] === pushing);
        }

        var index = this.map.get(value);
        ok(typeof index === "number");

        this.toCaller(object, parents, index);
      }
    };
  }
}
