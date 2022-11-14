import presets from "../src/presets";

it('High preset should have "preset": "high"', async () => {
  expect(presets.high.preset).toStrictEqual("high");
});

it('Medium preset should have "preset": "medium"', async () => {
  expect(presets.medium.preset).toStrictEqual("medium");
});

it('Low preset should have "preset": "low"', async () => {
  expect(presets.low.preset).toStrictEqual("low");
});

it("No preset should have eval, lock, or RGF enabled", async () => {
  Object.keys(presets).forEach((key) => {
    expect(typeof presets[key]).toStrictEqual("object");
    expect(!!presets[key].eval).toEqual(false);
    expect(!!presets[key].lock).toEqual(false);
    expect(!!presets[key].rgf).toEqual(false);
  });
});
