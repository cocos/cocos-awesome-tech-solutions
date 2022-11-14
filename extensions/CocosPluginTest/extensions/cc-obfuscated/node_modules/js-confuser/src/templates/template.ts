import { Node } from "../util/gen";
import { parseSnippet, parseSync } from "../parser";

export interface ITemplate {
  fill(variables?: { [name: string]: string | number }): string;

  compile(variables?: { [name: string]: string | number }): Node[];

  single(variables?: { [name: string]: string | number }): Node;

  source: string;
}

export default function Template(template: string): ITemplate {
  var neededVariables = 0;
  while (template.includes(`{$${neededVariables + 1}}`)) {
    neededVariables++;
  }
  var vars = Object.create(null);
  new Array(neededVariables + 1).fill(0).forEach((x, i) => {
    vars["\\$" + i] = "temp_" + i;
  });

  function fill(variables?: { [name: string]: string | number }): string {
    if (!variables) {
      variables = Object.create(null);
    }

    var cloned = template;

    var keys = { ...variables, ...vars };

    Object.keys(keys).forEach((name) => {
      var bracketName = "{" + name + "}";
      var value = keys[name] + "";

      var reg = new RegExp(bracketName, "g");

      cloned = cloned.replace(reg, value);
    });

    return cloned;
  }

  function compile(variables: { [name: string]: string | number }): Node[] {
    var code = fill(variables);
    try {
      var program = parseSnippet(code);

      return program.body;
    } catch (e) {
      console.error(e);
      console.error(template);
      throw new Error("Template failed to parse");
    }
  }

  function single(variables?: { [name: string]: string | number }): Node {
    var nodes = compile(variables);
    return nodes[0];
  }

  var obj: ITemplate = {
    fill,
    compile,
    single,
    source: template,
  };

  return obj;
}
