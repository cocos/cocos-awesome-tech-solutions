import JsConfuser from "../../../src/index";

describe("OSLock on target 'node'", () => {
  test("Variant #1: Linux", async () => {
    var _require = require;
    var newRequire: any = (name) => {
      if (name == "os") {
        return {
          platform() {
            return "linux";
          },
        };
      } else {
        return _require(name);
      }
    };
    require = newRequire;

    var output = await JsConfuser.obfuscate(`TEST_VARIABLE = 1`, {
      target: "node",
      lock: {
        osLock: ["linux"],
        countermeasures: false,
      },
    });

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual(1);
  });

  test("Variant #2: Linux on windows machine", async () => {
    var _require = require;
    var newRequire: any = (name) => {
      if (name == "os") {
        return {
          platform() {
            return "win32";
          },
        };
      } else {
        return _require(name);
      }
    };
    require = newRequire;

    var output = await JsConfuser.obfuscate(
      `
    function caught(){
      TEST_VARIABLE = "caught"
    }
    `,
      {
        target: "node",
        lock: {
          osLock: ["linux"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual("caught");
  });

  test("Variant #3: Windows", async () => {
    var _require = require;
    var newRequire: any = (name) => {
      if (name == "os") {
        return {
          platform() {
            return "win32";
          },
        };
      } else {
        return _require(name);
      }
    };
    require = newRequire;

    var output = await JsConfuser.obfuscate(
      `
    function caught(){
      TEST_VARIABLE = "caught"
    }
    `,
      {
        target: "node",
        lock: {
          osLock: ["windows"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual(undefined);
  });

  test("Variant #4: Windows on linux machine", async () => {
    var _require = require;
    var newRequire: any = (name) => {
      if (name == "os") {
        return {
          platform() {
            return "linux";
          },
        };
      } else {
        return _require(name);
      }
    };
    require = newRequire;

    var output = await JsConfuser.obfuscate(
      `
    function caught(){
      TEST_VARIABLE = "caught";
    }
    `,
      {
        target: "node",
        lock: {
          osLock: ["windows"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual("caught");
  });

  test("Variant #5: MacOs", async () => {
    var _require = require;
    var newRequire: any = (name) => {
      if (name == "os") {
        return {
          platform() {
            return "darwin";
          },
        };
      } else {
        return _require(name);
      }
    };
    require = newRequire;

    var output = await JsConfuser.obfuscate(`TEST_VARIABLE = 1`, {
      target: "node",
      lock: {
        osLock: ["osx"],
        countermeasures: false,
      },
    });

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual(1);
  });

  test("Variant #6: MacOs on linux machine", async () => {
    var _require = require;
    var newRequire: any = (name) => {
      if (name == "os") {
        return {
          platform() {
            return "linux";
          },
        };
      } else {
        return _require(name);
      }
    };
    require = newRequire;

    var output = await JsConfuser.obfuscate(
      `
    function caught(){
      TEST_VARIABLE = "caught";
    }
    `,
      {
        target: "node",
        lock: {
          osLock: ["osx"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual("caught");
  });
});

describe("OSLock on target 'browser'", () => {
  test("Variant #1: Linux", async () => {
    // Linux user-agent
    var window = {
      navigator: {
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
      },
    };

    var output = await JsConfuser.obfuscate(`TEST_VARIABLE = 1`, {
      target: "browser",
      lock: {
        osLock: ["linux"],
        countermeasures: false,
      },
    });

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual(1);
  });

  test("Variant #2: Linux on windows machine", async () => {
    // Windows user-agent
    var window = {
      navigator: {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
      },
    };

    var output = await JsConfuser.obfuscate(
      `
    function caught(){
      TEST_VARIABLE = "caught";
    }`,
      {
        target: "browser",
        lock: {
          osLock: ["linux"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual("caught");
  });

  test("Variant #3: Windows", async () => {
    // Windows user-agent
    var window = {
      navigator: {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
      },
    };

    var output = await JsConfuser.obfuscate(`TEST_VARIABLE = 1`, {
      target: "browser",
      lock: {
        osLock: ["windows"],
        countermeasures: false,
      },
    });

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual(1);
  });

  test("Variant #4: Windows on linux machine", async () => {
    // Linux user-agent
    var window = {
      navigator: {
        userAgent:
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
      },
    };

    var output = await JsConfuser.obfuscate(
      `
    function caught(){
      TEST_VARIABLE = "caught";
    }
    `,
      {
        target: "browser",
        lock: {
          osLock: ["windows"],
          countermeasures: "caught",
        },
      }
    );

    var TEST_VARIABLE;
    eval(output);

    expect(TEST_VARIABLE).toStrictEqual("caught");
  });
});
