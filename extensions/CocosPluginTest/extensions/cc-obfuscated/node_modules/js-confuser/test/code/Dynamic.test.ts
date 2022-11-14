import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import JsConfuser from "../../src/index";

var SOURCE_JS = readFileSync(join(__dirname, "./Dynamic.src.js"), "utf-8");

it("works on High Preset", async () => {
  // `input` is an embedded variable, therefore globalConcealing must be turned off
  var output = await JsConfuser(SOURCE_JS, {
    target: "browser",
    preset: "high",
    globalConcealing: false,
  });

  var value = "never_called";
  function input(x) {
    value = x;
  }

  eval(output);

  expect(value).toStrictEqual(1738.1738);
});

it("work when doubly obfuscated with High Preset", async () => {
  // `input` is an embedded variable, therefore globalConcealing must be turned off
  var output = await JsConfuser(SOURCE_JS, {
    target: "node",
    preset: "high",
    globalConcealing: false,
  });

  var doublyObfuscated = await JsConfuser(output, {
    target: "node",
    preset: "high",
    globalConcealing: false,
  });

  var value = "never_called";
  function input(x) {
    value = x;
  }

  eval(doublyObfuscated);

  expect(value).toStrictEqual(1738.1738);
});
