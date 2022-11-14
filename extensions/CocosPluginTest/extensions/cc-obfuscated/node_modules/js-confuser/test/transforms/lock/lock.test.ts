import JsConfuser from "../../../src/index";

it("should work with startDate and call countermeasures function", async () => {
  var startDate = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      lock: {
        startDate: Date.now() + 1000 * 60 * 60 * 24, // one day in the future
        countermeasures: "countermeasures",
      },
    }
  );

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(startDate);
  expect(value).toStrictEqual(true);
});

it("should not call countermeasures if the time is correct", async () => {
  var startDate = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      lock: {
        startDate: Date.now() - 1000 * 60 * 60 * 24, // one day in the past
        endDate: Date.now() + 1000 * 60 * 60 * 24, // one day in the future (2-day window to run this code)
        countermeasures: "countermeasures",
      },
    }
  );

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(startDate);
  expect(value).toStrictEqual("never_called");
});

it("should work with endDate and call countermeasures function", async () => {
  var endDate = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      lock: {
        endDate: Date.now() - 1000 * 60 * 60 * 24, // one day in the past
        countermeasures: "countermeasures",
      },
    }
  );

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(endDate);
  expect(value).toStrictEqual(true);
});

// it("strings should be encoded when startDate and endDate are given", async () => {
//   var startDate = await JsConfuser.obfuscate(` input("ENCODED_STRING") `, {
//     target: "node",
//     lock: {
//       startDate: Date.now() - 1000 * 60 * 60 * 24, // one day in the past
//       endDate: Date.now() + 1000 * 60 * 60 * 24, // one day in the future (2-day window to run this code)
//     },
//   });

//   var value = "never_called";
//   function input(valueIn) {
//     value = valueIn;
//   }

//   eval(startDate);
//   expect(value).toStrictEqual("ENCODED_STRING");
// });

it("should work with nativeFunctions and call countermeasures function", async () => {
  var output = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      lock: {
        nativeFunctions: ["fetch"],
        countermeasures: "countermeasures",
      },
    }
  );

  // custom function, not "native"
  var fetch = () => {};

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual(true);
});

it("should work with nativeFunctions and not call countermeasures function when correct", async () => {
  var output = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      lock: {
        nativeFunctions: ["fetch"],
        countermeasures: "countermeasures",
      },
    }
  );

  // bound functions return the "[native code]" string
  var fetch = (() => {}).bind(this);

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual("never_called");
});

it("countermeasures function should still work even with renameVariables enabled", async () => {
  var output = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      renameVariables: true,
      renameGlobals: true, // <- `countermeasures` is top level name
      lock: {
        endDate: Date.now() - 1000 * 60 * 60 * 24, // always in the past, therefore countermeasures will always be called
        countermeasures: "countermeasures",
      },
    }
  );

  // ensure function was renamed
  expect(output).not.toContain("countermeasures");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual(true);
});

it("should not call countermeasures when domainLock is correct", async () => {
  var output = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "browser",
      lock: {
        domainLock: ["mywebsite.com"],
        countermeasures: "countermeasures",
      },
    }
  );

  var location = {
    href: "mywebsite.com",
  };

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual("never_called");
});

it("should call countermeasures when domain is different", async () => {
  var output = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "browser",
      lock: {
        domainLock: ["mywebsite.com"],
        countermeasures: "countermeasures",
      },
    }
  );

  var location = {
    href: "anotherwebsite.com",
  };

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual(true);
});

it("should not call countermeasures when context is correct", async () => {
  var output = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      lock: {
        context: ["authenticated"],
        countermeasures: "countermeasures",
      },
    }
  );

  (global as any).authenticated = true;

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual("never_called");
});

it("should call countermeasures when context is different", async () => {
  var output = await JsConfuser.obfuscate(
    ` function countermeasures(){ input(true) } `,
    {
      target: "node",
      lock: {
        context: ["missingProperty"],
        countermeasures: "countermeasures",
      },
    }
  );

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual(true);
});
