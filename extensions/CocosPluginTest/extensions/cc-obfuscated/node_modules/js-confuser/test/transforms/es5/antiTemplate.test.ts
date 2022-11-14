import JsConfuser from "../../../src/index";

describe("ES5 > AntiTemplate", () => {
  it("should convert single template literals to strings", async () => {
    var output = await JsConfuser("TEST_VARIABLE = `Hello World`", {
      target: "node",
      es5: true,
    });

    expect(output).not.toContain("`");
    expect(output).not.toContain("'+'");

    var TEST_VARIABLE;

    eval(output);
    expect(TEST_VARIABLE).toStrictEqual("Hello World");
  });

  it("should convert complex template literals to concatenated strings", async () => {
    var TEST_VARIABLE_2 = 10;

    var output = await JsConfuser(
      "TEST_VARIABLE = `Hello World: ${TEST_VARIABLE_2}`",
      { target: "node", es5: true }
    );

    expect(output).not.toContain("`");
    expect(output).toContain("'+");

    var TEST_VARIABLE;

    eval(output);
    expect(TEST_VARIABLE).toStrictEqual("Hello World: 10");
  });

  it("should convert tagged template literals to call expressions", async () => {
    var TEST_VARIABLE = 10;

    var output = await JsConfuser(
      "TEST_FUNCTION`Hello World: ${TEST_VARIABLE}`",
      { target: "node", es5: true }
    );

    expect(output).not.toContain("`");
    expect(output).toContain("','");

    var input;
    function TEST_FUNCTION(p, ...fillers) {
      input = p[0] + fillers[0];
    }

    eval(output);
    expect(input).toStrictEqual("Hello World: 10");
  });

  it("should work on tagged template literals with multiple expressions", async () => {
    var TEST_VARIABLE_1 = 10;
    var TEST_VARIABLE_2 = 30;

    var output = await JsConfuser(
      "TEST_FUNCTION`${TEST_VARIABLE_1},20,${TEST_VARIABLE_2}`",
      { target: "node", es5: true }
    );

    expect(output).not.toContain("`");
    expect(output).toContain("','");

    var input;
    function TEST_FUNCTION(p, ...fillers) {
      input = p[0] + fillers[0] + p[1] + fillers[1];
    }

    eval(output);
    expect(input).toStrictEqual("10,20,30");
  });

  it("should add the .raw property to the first parameter on tagged template literals", async () => {
    var TEST_VARIABLE = 10;

    var output = await JsConfuser(
      "TEST_FUNCTION`Hello World: ${TEST_VARIABLE}`",
      { target: "node", es5: true }
    );

    expect(output).not.toContain("`");
    expect(output).toContain("','");

    var input;
    function TEST_FUNCTION(p, ...fillers) {
      input = p.raw[0];
    }

    eval(output);
    expect(input).toStrictEqual("Hello World: ");
  });

  it("should have the correct .raw property for strings with backslashes", async () => {
    var TEST_VARIABLE = 10;

    var output = await JsConfuser(
      "TEST_FUNCTION`Hello World:\\t${TEST_VARIABLE}`",
      { target: "node", es5: true }
    );

    expect(output).not.toContain("`");
    expect(output).toContain("','");

    var input;
    function TEST_FUNCTION(p, ...fillers) {
      input = p.raw[0];
    }

    eval(output);
    expect(input).toStrictEqual("Hello World:\\t");
  });
});
