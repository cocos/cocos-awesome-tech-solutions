require("@babel/register")({
  presets: ["@babel/preset-typescript"],
  extensions: [".js", ".ts"],
  cache: true,
  retainLines: true,
});

module.exports = require("./dev.ts");
