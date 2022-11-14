import {
  alphabeticalGenerator,
  choice,
  getRandomFalseExpression,
  getRandomString,
  getRandomTrueExpression,
} from "../../src/util/random";

const escodegen = require("escodegen");

it("choice() should return a random element from an array", async () => {
  var sample = [10, 20, 30, 40, 50];

  var times = 50;
  for (var i = 0; i < times; i++) {
    var random = choice(sample);
    expect(sample).toContain(random);
  }
});

it("getRandomString() should return a random string with exact length", async () => {
  expect(typeof getRandomString(6)).toStrictEqual("string");
  expect(getRandomString(6).length).toStrictEqual(6);
});

it("getRandomFalseExpression() should always eval to false", async () => {
  var times = 50;
  for (var i = 0; i < times; i++) {
    var expr = getRandomFalseExpression();
    var code = escodegen.generate(expr);

    expect(eval("!!" + code)).toStrictEqual(false);
  }
});

it("getRandomTrueExpression() should always eval to true", async () => {
  var times = 50;
  for (var i = 0; i < times; i++) {
    var expr = getRandomTrueExpression();
    var code = escodegen.generate(expr);

    expect(eval("!!" + code)).toStrictEqual(true);
  }
});

it("alphabeticalGenerator should return correct outputs", async () => {
  expect(alphabeticalGenerator(1)).toStrictEqual("a");
  expect(alphabeticalGenerator(2)).toStrictEqual("b");
  expect(alphabeticalGenerator(3)).toStrictEqual("c");
  expect(alphabeticalGenerator(4)).toStrictEqual("d");
  expect(alphabeticalGenerator(5)).toStrictEqual("e");
  expect(alphabeticalGenerator(6)).toStrictEqual("f");
  expect(alphabeticalGenerator(7)).toStrictEqual("g");
  expect(alphabeticalGenerator(8)).toStrictEqual("h");
  expect(alphabeticalGenerator(10)).toStrictEqual("j");
  expect(alphabeticalGenerator(27)).toStrictEqual("A");
  expect(alphabeticalGenerator(28)).toStrictEqual("B");
  expect(alphabeticalGenerator(29)).toStrictEqual("C");

  expect(alphabeticalGenerator(90)).toStrictEqual("aL");
  expect(alphabeticalGenerator(900)).toStrictEqual("qp");

  var seen = new Set();
  for (var i = 1; i < 1000; i++) {
    var c = alphabeticalGenerator(i);

    expect(seen.has(c)).toStrictEqual(false);

    seen.add(c);
  }
});
