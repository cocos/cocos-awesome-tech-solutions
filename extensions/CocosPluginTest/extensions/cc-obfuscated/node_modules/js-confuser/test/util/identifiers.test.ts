import parseJS from "../../src/parser";
import {
  getFunctionParameters,
  getIdentifierInfo,
  validateChain,
} from "../../src/util/identifiers";

describe("getIdentifierInfo", () => {
  test("Variant #1: Determine function declarations", async () => {
    var tree = await parseJS(`function abc(){}`);

    var object = tree.body[0].id;

    expect(object.type).toStrictEqual("Identifier");

    var parents = [tree.body[0], tree.body, tree];

    var info = getIdentifierInfo(object, parents as any);

    expect(info.isFunctionDeclaration).toStrictEqual(true);
    expect(info.spec.isDefined).toStrictEqual(true);
  });

  test("Variant #2: Determine labels", async () => {
    var tree = await parseJS(`label: for (var i = 0; i < 0; i++ ) {}`);

    var object = tree.body[0].label;

    expect(object.type).toStrictEqual("Identifier");

    var parents = [tree.body[0], tree.body, tree];

    var info = getIdentifierInfo(object, parents as any);

    expect(info.isLabel).toStrictEqual(true);
    expect(info.spec.isReferenced).toStrictEqual(false);
  });

  test("Variant #3: Error when a non-identifier node is given", async () => {
    expect(() => {
      getIdentifierInfo({ type: "Literal", value: true }, []);
    }).toThrow();
  });
});

describe("validateChain", () => {
  test("Variant #1: Error when parents is not an array", () => {
    expect(() => {
      validateChain({ type: "Identifier", name: "name" }, {} as any);
    }).toThrow();
  });

  test("Variant #2: Error when object is undefined", () => {
    expect(() => {
      validateChain(undefined, []);
    }).toThrow();
  });

  test("Variant #3: Error when object is not connected to direct parent", () => {
    expect(() => {
      validateChain({ type: "Identifier", name: "name" }, [
        { type: "Program", body: [] },
      ]);
    }).toThrow();
  });
});

describe("getFunctionParameters", () => {
  test("Variant #1: Work with default values and destructuring", async () => {
    var code = `function a(A=_b,{B,[_c]:C},[D]){}`;
    var tree = await parseJS(code);

    var object = tree.body[0];
    var parents: any = [tree.body, tree];

    var locations = getFunctionParameters(object, parents);
    var names = locations.map((x) => x[0].name);

    expect(names).toStrictEqual(["A", "B", "C", "D"]);
  });

  test("Variant #2: Work with spread element", async () => {
    var code = `function a(...A){}`;
    var tree = await parseJS(code);

    var object = tree.body[0];
    var parents: any = [tree.body, tree];

    var locations = getFunctionParameters(object, parents);
    var names = locations.map((x) => x[0].name);

    expect(names).toStrictEqual(["A"]);
  });

  test("Variant #3: Normal parameters", async () => {
    var code = `function a(A,B,C,D){}`;
    var tree = await parseJS(code);

    var object = tree.body[0];
    var parents: any = [tree.body, tree];

    var locations = getFunctionParameters(object, parents);
    var names = locations.map((x) => x[0].name);

    expect(names).toStrictEqual(["A", "B", "C", "D"]);
  });

  test("Variant #4: Default values as functions", async () => {
    var code = `function a(A = function(_a){ return _a; },B = function(_a, _b = function(){return this;}){return _a + _b();},C,D){}`;
    var tree = await parseJS(code);

    var object = tree.body[0];
    var parents: any = [tree.body, tree];

    var locations = getFunctionParameters(object, parents);
    var names = locations.map((x) => x[0].name);

    expect(names).toStrictEqual(["A", "B", "C", "D"]);
  });
});
