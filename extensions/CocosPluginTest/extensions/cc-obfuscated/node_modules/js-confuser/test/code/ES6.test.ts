import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import JsConfuser from "../../src/index";

var ES6_JS = readFileSync(join(__dirname, "./ES6.src.js"), "utf-8");

it("works with ES6 code on High Preset", async () => {
  var output = await JsConfuser(ES6_JS, {
    target: "node",
    preset: "high",
  });

  (global as any).expect = expect;

  eval(output);
});
