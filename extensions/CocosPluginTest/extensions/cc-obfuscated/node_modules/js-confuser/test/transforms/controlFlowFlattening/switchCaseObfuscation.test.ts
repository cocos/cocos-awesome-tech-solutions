import JsConfuser from "../../../src/index";

it("should obfuscate numbered switch statements (SwitchCaseObfuscation)", async () => {
  var code = `
    var array = [];

    function runOnce(stateParam){
      switch(stateParam){
        case 1: array.push(1, 2, 3); break;
        case 2: array.push(4, 5, 6); break;
        case 3: array.push(7, 8, 9); break;
        case 4: array.push(10); break;
      }
    }

    runOnce(1);
    runOnce(2);
    runOnce(3);
    runOnce(4);

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    controlFlowFlattening: true,
  });

  expect(
    output.includes("case 1:") &&
      output.includes("case 2:") &&
      output.includes("case 3:") &&
      output.includes("case 4:")
  ).toStrictEqual(false);

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(output);
});

it("should not obfuscate switch statements with complex discriminants (SwitchCaseObfuscation)", async () => {
  var code = `
    var array = [];

    function runOnce(stateParam){
      switch(stateParam || 0){
        case 1: array.push(1, 2, 3); break;
        case 2: array.push(4, 5, 6); break;
        case 3: array.push(7, 8, 9); break;
        case 4: array.push(10); break;
      }
    }

    runOnce(1);
    runOnce(2);
    runOnce(3);
    runOnce(4);

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    controlFlowFlattening: true,
  });

  expect(output).toContain("stateParam||0");

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(output);
});
