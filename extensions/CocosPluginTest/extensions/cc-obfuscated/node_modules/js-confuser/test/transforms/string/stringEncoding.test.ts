import JsConfuser from "../../../src/index";

it("should encode strings", async () => {
  var code = `var TEST_STRING = "encoded."`;

  var output = await JsConfuser(code, {
    target: "browser",
    stringEncoding: true,
  });

  expect(output).not.toContain("encoded.");

  expect(
    output.includes(
      "\\u0065\\u006e\\u0063\\u006f\\u0064\\u0065\\u0064\\u002e"
    ) || output.includes("\\x65\\x6e\\x63\\x6f\\x64\\x65\\x64\\x2e")
  ).toStrictEqual(true);
});

it("should encode strings but still have same result", async () => {
  var code = `input("encoded.")`;

  var output = await JsConfuser(code, {
    target: "browser",
    stringEncoding: true,
  });

  expect(output).not.toContain("encoded.");

  expect(
    output.includes(
      "\\u0065\\u006e\\u0063\\u006f\\u0064\\u0065\\u0064\\u002e"
    ) || output.includes("\\x65\\x6e\\x63\\x6f\\x64\\x65\\x64\\x2e")
  ).toStrictEqual(true);

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual("encoded.");
});
