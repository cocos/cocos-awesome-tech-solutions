import { getFactors } from "../../src/util/math";

it("getFactors() should return correct factors", () => {
  expect(getFactors(6)).toEqual([1, 6, 2, 3]);
});
