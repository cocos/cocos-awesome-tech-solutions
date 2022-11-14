// Import `js-confuser`
const JsConfuser = require("js-confuser");
const { readFileSync, writeFileSync } = require("fs");

// Read the file's code
const file = readFileSync("./input.js", "utf-8");

// Obfuscate the code
JsConfuser.obfuscate(file, {
  target: "node",
  preset: "high",
}).then((obfuscated) => {
  // Write output to file
  writeFileSync("./high.js", obfuscated, { encoding: "utf-8" });
});
