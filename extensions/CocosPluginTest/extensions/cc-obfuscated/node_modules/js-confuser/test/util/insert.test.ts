import { compileJsSync } from "../../src/compiler";
import parseJS from "../../src/parser";
import { isBlock } from "../../src/traverse";
import { Identifier } from "../../src/util/gen";
import {
  deleteDeclaration,
  isVarContext,
  isFunction,
  deleteDirect,
  getContexts,
  getLexContext,
  getVarContext,
} from "../../src/util/insert";

it("isBlock() should be true for block statements and program", async () => {
  expect(isBlock({ type: "Program", body: [] })).toStrictEqual(true);
  expect(isBlock({ type: "BlockStatement", body: [] })).toStrictEqual(true);
});

it("isVarContext() should return true for Function Nodes", () => {
  expect(isVarContext({ type: "FunctionDeclaration" })).toStrictEqual(true);
  expect(isVarContext({ type: "FunctionExpression" })).toStrictEqual(true);
  expect(isVarContext({ type: "ArrowFunctionExpression" })).toStrictEqual(true);
});

it("isFunction() should return true for Function Nodes", () => {
  expect(isFunction({ type: "FunctionDeclaration" })).toStrictEqual(true);
  expect(isFunction({ type: "FunctionExpression" })).toStrictEqual(true);
  expect(isFunction({ type: "ArrowFunctionExpression" })).toStrictEqual(true);
});

it("isVarContext() should return true for the Program Node (root node)", () => {
  expect(isVarContext({ type: "Program" })).toStrictEqual(true);
});

it("should delete variable declarations correctly", async () => {
  var tree = await parseJS("var a = 1;");

  deleteDeclaration(tree.body[0].declarations[0], [
    tree.body[0].declarations,
    tree.body[0],
    tree.body,
    tree,
  ]);

  expect(tree.body.length).toStrictEqual(0);
});

it("should delete function declarations correctly", async () => {
  var tree = await parseJS("function a(){}");

  deleteDeclaration(tree.body[0], [tree.body as any, tree]);

  expect(tree.body.length).toStrictEqual(0);
});

it("should delete variable declarations with multiple declarations without leave side-effects", async () => {
  var tree = await parseJS("var a = 1, b = 1, c = 1");

  // delete "b"
  deleteDeclaration(tree.body[0].declarations[1], [
    tree.body[0].declarations,
    tree.body[0],
    tree.body,
    tree,
  ]);

  expect(tree.body.length).toStrictEqual(1);
  expect(tree.body[0].declarations.length).toStrictEqual(2);
  expect(tree.body[0].declarations.find((x) => x.id.name == "b")).toBeFalsy();
  expect(tree.body[0].declarations.map((x) => x.id.name)).toEqual(["a", "c"]);
});

it("getContexts should return correct results", () => {
  expect(getContexts({ type: "Program", body: [] }, [])).toEqual([
    { type: "Program", body: [] },
  ]);
});

it("should throw when missing parameters", () => {
  expect(deleteDirect).toThrow();
  expect(() => deleteDirect(Identifier("node"), null)).toThrow();

  expect(getLexContext).toThrow();
  expect(getVarContext).toThrow();
  expect(() => getLexContext(Identifier("test"), [])).toThrow();
  expect(() => getVarContext(Identifier("test"), [])).toThrow();
});
