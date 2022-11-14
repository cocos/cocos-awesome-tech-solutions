import JsConfuser from "../../../src/index";

test("Variant #1: Chrome", async () => {
  // Chrome user-agent
  var window = {
    navigator: {
      userAgent:
        "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
    },
  };

  var output = await JsConfuser.obfuscate(
    `
  function caught(){
    TEST_VARIABLE = "caught"
  }
  `,
    {
      target: "browser",
      lock: {
        browserLock: ["chrome"],
        countermeasures: "caught",
      },
    }
  );

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toStrictEqual(undefined);
});

test(
  "Variant #2: Chrome on Firefox browser",
  async () => {
    // Firefox user-agent
    var window = {
      navigator: {
        userAgent:
          "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
      },
    };

    var output = await JsConfuser.obfuscate(
      `
  function caught(){
    TEST_VARIABLE = "caught"
  }
  `,
      {
        target: "browser",
        lock: {
          browserLock: ["chrome"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;

    eval(output);
    expect(TEST_VARIABLE).toStrictEqual("caught");
  },
  30 * 1000
);

test("Variant #2: Firefox", async () => {
  // Firefox user-agent
  var window = {
    navigator: {
      userAgent:
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
    },
  };

  var output = await JsConfuser.obfuscate(
    `
  function caught(){
    TEST_VARIABLE = "caught"
  }
  `,
    {
      target: "browser",
      lock: {
        browserLock: ["firefox"],
        countermeasures: "caught",
      },
    }
  );

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toStrictEqual(undefined);
});

test(
  "Variant #4: Firefox on Chrome browser",
  async () => {
    // Chrome user-agent
    var window = {
      navigator: {
        userAgent:
          "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
      },
    };

    var output = await JsConfuser.obfuscate(
      `
  function caught(){
    TEST_VARIABLE = "caught"
  }
  `,
      {
        target: "browser",
        lock: {
          browserLock: ["firefox"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;

    eval(output);
    expect(TEST_VARIABLE).toStrictEqual("caught");
  },
  30 * 1000
);
