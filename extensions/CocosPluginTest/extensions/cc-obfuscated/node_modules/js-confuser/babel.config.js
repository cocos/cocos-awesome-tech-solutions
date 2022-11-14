// babel.config.js
// Jest uses this & for building
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: "defaults, not ie 11, not ie_mob 11" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-optional-chaining",
  ],
};
