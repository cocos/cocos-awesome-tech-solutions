import JsConfuser from "../../../src/index";

it("should force blocks to be block statements (if statement)", async () => {
  var output = await JsConfuser.obfuscate(
    `
  if ( a ) b();

  if ( a ) {} else c()
  `,
    {
      target: "node",
      objectExtraction: true, // <- something needs to enabled
    }
  );

  expect(output).toContain("{b()}");
  expect(output).toContain("{c()}");
});

it("should force blocks to be block statements (arrow function)", async () => {
  var output = await JsConfuser.obfuscate(
    `
  var arrowFn = ()=>true;
  `,
    {
      target: "node",
      objectExtraction: true, // <- something needs to enabled
    }
  );

  expect(output).toContain("return");
  expect(output).toContain("{");
  expect(output).toContain("}");
});

it("should force blocks to be block statements", async () => {
  var output = await JsConfuser.obfuscate(
    `
  if ( a ) b()
  `,
    {
      target: "node",
      objectExtraction: true, // <- something needs to enabled
    }
  );

  expect(output).toContain("{b()}");
});

it("should force explicit member expressions", async () => {
  var output = await JsConfuser.obfuscate(
    `
  console.log('...')
  `,
    {
      target: "node",
      objectExtraction: true, // <- something needs to enabled
    }
  );

  expect(output).toContain("console['log']");
});
