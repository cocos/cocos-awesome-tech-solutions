import { isEquivalent } from "../../src/util/compare";
import { Identifier } from "../../src/util/gen";

it("should compare nodes correctly", () => {
  expect(isEquivalent(Identifier("name"), Identifier("name"))).toStrictEqual(
    true
  );

  expect(
    isEquivalent(Identifier("name"), Identifier("different_name"))
  ).toStrictEqual(false);
});
