import JsConfuser from "../../../src/index";

test("Variant #1: SelfDefending should forcibly enable `compact`", async () => {
  var output = await JsConfuser.obfuscate(`console.log(1)`, {
    target: "node",
    compact: false,
    lock: {
      selfDefending: true,
    },
  });

  expect(output).not.toContain("\n");
});

test("Variant #2: SelfDefending should not crash when unchanged", async () => {
  var output = await JsConfuser.obfuscate(
    `
  function caught(){
    TEST_CAUGHT = true;
  }
  TEST_VAR = 100;
  `,
    {
      target: "node",
      lock: {
        selfDefending: true,
        countermeasures: "caught",
      },
    }
  );

  var TEST_VAR, TEST_CAUGHT;

  eval(output);

  expect(TEST_VAR).toStrictEqual(100);
  expect(TEST_CAUGHT).toStrictEqual(undefined);
});

test("Variant #2: SelfDefending should crash when changed", async () => {
  var output = await JsConfuser.obfuscate(
    `
  function caught(){
    TEST_CAUGHT = true;
  }
  TEST_VAR = 100;
  `,
    {
      target: "node",
      lock: {
        selfDefending: true,
        countermeasures: "caught",
      },
    }
  );

  // Re-run through obfuscator without compact = new lines = crash should occur
  var output2 = await JsConfuser.obfuscate(output, {
    target: "node",
    compact: false,
  });

  var TEST_VAR, TEST_CAUGHT;

  eval(output2);

  expect(TEST_CAUGHT).toStrictEqual(true);
});
