import { ok } from "assert";
import { ObfuscateOrder } from "../../order";
import { ComputeProbabilityMap } from "../../probability";
import Template from "../../templates/template";
import { isDirective } from "../../util/compare";
import {
  CallExpression,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  Literal,
  MemberExpression,
  ReturnStatement,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import { append, prepend } from "../../util/insert";
import Transform from "../transform";
import { isModuleSource } from "./stringConcealing";
function LZ_encode(c) {
  ok(c);
  var x = "charCodeAt",
    b,
    e = {},
    f = c.split(""),
    d = [],
    a = f[0],
    g = 256;
  for (b = 1; b < f.length; b++)
    (c = f[b]),
      null != e[a + c]
        ? (a += c)
        : (d.push(1 < a.length ? e[a] : a[x](0)), (e[a + c] = g), g++, (a = c));
  d.push(1 < a.length ? e[a] : a[x](0));
  for (b = 0; b < d.length; b++) d[b] = String.fromCharCode(d[b]);
  return d.join("");
}

function LZ_decode(b) {
  ok(b);
  var o,
    f,
    a,
    e = {},
    d = b.split(""),
    c = (f = d[0]),
    g = [c],
    h = (o = 256);
  for (var i = 1; i < d.length; i++)
    (a = d[i].charCodeAt(0)),
      (a = h > a ? d[i] : e[a] ? e[a] : f + c),
      g.push(a),
      (c = a.charAt(0)),
      (e[o] = f + c),
      o++,
      (f = a);
  return g.join("");
}

const DecodeTemplate = Template(
  `function {name}(b){
    var o,
    f,
    a,
    e = {},
    d = b.split(""),
    c = (f = d[0]),
    g = [c],
    h = (o = 256);
  for (b = 1; b < d.length; b++)
    (a = d[b].charCodeAt(0)),
      (a = h > a ? d[b] : e[a] ? e[a] : f + c),
      g.push(a),
      (c = a.charAt(0)),
      (e[o] = f + c),
      o++,
      (f = a);
  return g.join("").split("{delimiter}");
  }`
);

export default class StringCompression extends Transform {
  map: Map<string, number>;
  ignore: Set<string>;
  string: string;
  delimiter = "1";

  fnName: string;

  constructor(o) {
    super(o, ObfuscateOrder.StringCompression);

    this.map = new Map();
    this.ignore = new Set();
    this.string = "";
    this.fnName = this.getPlaceholder();
  }

  apply(tree) {
    super.apply(tree);

    this.string = this.string.slice(0, this.string.length - 1);
    if (!this.string.length) {
      return;
    }

    var split = this.getPlaceholder();
    var decoder = this.getPlaceholder();
    var getStringName = this.getPlaceholder();

    var encoded = LZ_encode(this.string);
    if (LZ_decode(encoded) !== this.string) {
      this.error(new Error("String failed to be decoded"));
    }

    var getStringParamName = this.getPlaceholder();
    var decoderParamName = this.getPlaceholder();

    var callExpression = CallExpression(Identifier(decoderParamName), [
      CallExpression(Identifier(getStringParamName), []),
    ]);

    prepend(
      tree,
      VariableDeclaration(
        VariableDeclarator(
          split,
          CallExpression(
            FunctionExpression(
              [Identifier(getStringParamName), Identifier(decoderParamName)],
              [ReturnStatement(callExpression)]
            ),
            [Identifier(getStringName), Identifier(decoder)]
          )
        )
      )
    );

    append(
      tree,
      FunctionDeclaration(
        getStringName,
        [],
        [ReturnStatement(Literal(encoded))]
      )
    );

    append(
      tree,
      FunctionDeclaration(
        this.fnName,
        [Identifier("index")],
        [
          ReturnStatement(
            MemberExpression(Identifier(split), Identifier("index"), true)
          ),
        ]
      )
    );

    append(
      tree,
      DecodeTemplate.single({ name: decoder, delimiter: this.delimiter })
    );
  }

  match(object, parents) {
    return (
      object.type == "Literal" &&
      typeof object.value === "string" &&
      object.value &&
      object.value.length > 3 &&
      !isDirective(object, parents) &&
      !isModuleSource(object, parents)
    );
  }

  transform(object, parents) {
    if (!object.value) {
      return;
    }
    if (
      this.ignore.has(object.value) ||
      object.value.includes(this.delimiter)
    ) {
      return;
    }

    if (
      !parents[0] ||
      (parents[0].type == "CallExpression" &&
        parents[0].callee.type == "Identifier" &&
        parents[0].callee.name == this.fnName)
    ) {
      return;
    }

    if (!ComputeProbabilityMap(object.value, (x) => x)) {
      return;
    }

    var index = this.map.get(object.value);
    if (typeof index !== "number") {
      if (LZ_decode(LZ_encode(object.value)) !== object.value) {
        this.ignore.add(object.value);
        return;
      }

      var before = this.string;

      index = this.map.size;
      this.map.set(object.value, index);
      this.string += object.value + this.delimiter;

      // allow rollback if string becomes corrupted
      if (LZ_decode(LZ_encode(this.string)) !== this.string) {
        this.string = before;
        this.map.delete(object.value);
        this.ignore.add(object.value);
        return;
      }
    }
    ok(typeof index === "number");

    this.replaceIdentifierOrLiteral(
      object,
      CallExpression(Identifier(this.fnName), [Literal(index)]),
      parents
    );
  }
}
