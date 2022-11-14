import JsConfuser from "../../src/index";

it("should result in the same order", async () => {
  var code = `
    var TEST_ARRAY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    input(TEST_ARRAY);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    shuffle: true,
  });

  var value;
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
it("should properly shuffle arrays within expressions", async () => {
  var code = `
    input([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    shuffle: true,
  });

  var value;
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

it("should shuffle arrays based on hash and unshuffle correctly", async () => {
  var code = `input([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);`;

  for (var i = 0; i < 20; i++) {
    var output = await JsConfuser(code, {
      target: "node",
      shuffle: "hash",
    });

    var value;
    function input(valueIn) {
      value = valueIn;
    }

    eval(output);

    expect(value).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }
});

it("should shuffle arrays based on hash and unshuffle incorrect if changed", async () => {
  var code = `input([1, 2, 3, 4, 5]);`;

  var different = false;
  for (var i = 0; i < 20; i++) {
    var output = await JsConfuser(code, {
      target: "node",
      shuffle: "hash",
    });

    output =
      output.split("[")[0] + "[" + output.split("[")[1].replace("5", "6");

    var value;
    function input(valueIn) {
      value = valueIn;
    }

    eval(output);
    expect(value).toHaveLength(5);
    expect(typeof value[0] === "number").toStrictEqual(true);
    if (value[0] !== 1) {
      different = true;
    }
  }

  expect(different).toStrictEqual(true);
});
