import JsConfuser from "../../../src/index";

it("add debugger statements", async () => {
  var output = await JsConfuser.obfuscate("input(true)", {
    target: "node",
    lock: {
      antiDebug: true,
    },
  });

  expect(output).toContain("debugger");
});

it("add a background interval", async () => {
  var output = await JsConfuser.obfuscate("input(true)", {
    target: "node",
    lock: {
      antiDebug: true,
    },
  });

  expect(output).toContain("setInterval");
});

it("should place syntax-correct code", async () => {
  for (var i = 0; i < 50; i++) {
    var output = await JsConfuser.obfuscate(
      `
    /**
    * GitHub: https://github.com/MichaelXF/js-confuser
    * NPM: https://www.npmjs.com/package/js-confuser
    *
    * Welcome to Js Confuser
    * 
    * You can obfuscate the code with the top right button 'Obfuscate'.
    * 
    * You can customize the obfuscator with the button 'Options'.
    * (Set the target to 'node' for NodeJS apps)
    *
    * Happy Hacking!
    */
    
    function greet(name){
        var output = "Hello " + name + "!";
    }
    
    greet("Internet User");
    
    `,
      {
        compact: true,
        controlFlowFlattening: 0.25,
        identifierGenerator: "randomized",
        lock: { antiDebug: true },
        minify: true,
        target: "node",
      }
    );

    try {
      eval(output);
    } catch (e) {
      expect(e).toStrictEqual(undefined);
    }
  }
});
