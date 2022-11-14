import JsConfuser from "../../src/index";

it("should rename labels", async () => {
  var code = `
    TEST_LABEL: while(0){}
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    objectExtraction: true,
  });

  expect(output).not.toContain("TEST_LABEL");
});

it("should remove labels unused labels", async () => {
  var code = `
    TEST_LABEL: while(0){}
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    objectExtraction: true,
  });

  expect(output).not.toContain("TEST_LABEL");
  expect(output).not.toContain(":"); // No labels are required here
});

it("should use label-less break statements when possible", async () => {
  var code = `
    TEST_LABEL: while(0){
      break TEST_LABEL;
    }
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    objectExtraction: true,
  });

  expect(output).not.toContain("TEST_LABEL");
});

it("should not rename nested labels", async () => {
  var code = `
    TEST_LABEL: for ( var i =0; i < 10; i++ ) {
      switch(1){
        case 1:
          break TEST_LABEL;
      }
    }
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    objectExtraction: true,
  });

  expect(output).not.toContain("TEST_LABEL");
  expect(output).toContain(":for");
});

it("should not remove labels on block statements", async () => {
  var code = `
    TEST_LABEL: {
      break TEST_LABEL;
    }
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    objectExtraction: true,
  });

  expect(output).not.toContain("TEST_LABEL");
  expect(output).toContain(":{");
});

it("should remove labels on block statements when the label was never used", async () => {
  var code = `
    TEST_LABEL: {
      "";
    }
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    objectExtraction: true,
  });

  expect(output).not.toContain("TEST_LABEL");
  expect(output).not.toContain(":{");
  expect(output).toContain("{");
});
