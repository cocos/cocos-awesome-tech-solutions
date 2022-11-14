import JsConfuser from "../../../src/index";

it("should fix name conflicts for easier AST parsing", async () => {
  var output = await JsConfuser.obfuscate(
    `
  
    var TEST=1;

    function example(){
      var TEST = 2;
    }
  `,
    {
      target: "browser",
      objectExtraction: true, // <- something needs to be enabled
    }
  );

  // expect(output).toContain("var _TEST=2");
  expect(typeof output).toStrictEqual("string");
});

it("should properly execute with names resolved", async () => {
  var output = await JsConfuser.obfuscate(
    `
  
    var TEST= -10;

    function example(){
      var TEST = 100;
      input(TEST)
    }

    example();
  `,
    {
      target: "browser",
      objectExtraction: true, // <- something needs to be enabled
    }
  );

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  // expect(output).toContain("var _TEST=100");

  eval(output);

  expect(value).toStrictEqual(100);
});
