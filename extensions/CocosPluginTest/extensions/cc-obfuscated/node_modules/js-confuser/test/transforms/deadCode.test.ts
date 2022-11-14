import JsConfuser from "../../src/index";

it("should execute properly", async () => {
  var code = `
    var array = [];

    array.push(1);
    array.push(2);
    array.push(3);
    array.push(4);
    array.push(5);
    array.push(6);
    array.push(7);
    array.push(8);
    array.push(9);
    array.push(10);

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    deadCode: true,
  });

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
