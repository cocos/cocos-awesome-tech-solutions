import { isIndependent } from "../src/util/compare";
import {
  ArrayExpression,
  FunctionExpression,
  Identifier,
  Literal,
} from "../src/util/gen";

describe("isIndependent", () => {
  it("should return true for literals", () => {
    expect(isIndependent(Literal("String"), [])).toStrictEqual(true);
  });

  it("should return false for identifiers", () => {
    expect(
      isIndependent(Identifier("variable"), [{ type: "Program" }])
    ).toStrictEqual(false);
  });

  it("should return true for reserved identifiers (null, undefined, etc)", () => {
    expect(
      isIndependent(Identifier("null"), [{ type: "Program" }])
    ).toStrictEqual(true);
  });

  it("should return true for arrays of literals", () => {
    expect(
      isIndependent(ArrayExpression([Literal("String")]), [])
    ).toStrictEqual(true);
  });

  it("should return false for arrays with identifiers", () => {
    expect(
      isIndependent(
        ArrayExpression([Literal("String"), Identifier("variable")]),
        []
      )
    ).toStrictEqual(false);
  });

  it("should return false for everything else", () => {
    expect(isIndependent(FunctionExpression([], []), [])).toStrictEqual(false);
  });
});
