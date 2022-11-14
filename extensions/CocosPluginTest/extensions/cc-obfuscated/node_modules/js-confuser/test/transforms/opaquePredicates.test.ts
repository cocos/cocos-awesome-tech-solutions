import JsConfuser from "../../src/index";

it("should append logical expressions", async () => {
  var code = `

    var test = false;
    if ( test ) {

    }
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    opaquePredicates: true,
  });

  expect(output).not.toContain("(test)");
});
