import { ObfuscateOrder } from "../../order";
import Template from "../../templates/template";
import { isBlock } from "../../traverse";
import {
  AssignmentExpression,
  DebuggerStatement,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  Literal,
  WhileStatement,
} from "../../util/gen";
import { getBlockBody, prepend } from "../../util/insert";
import { getRandomInteger } from "../../util/random";
import Transform from "../transform";
import Lock from "./lock";

var DevToolsDetection = Template(
  `
  try {
    if ( setInterval ) {
      setInterval(()=>{
        {functionName}();
      }, 4000);
    }
  } catch ( e ) {

  }
`
);

export default class AntiDebug extends Transform {
  made: number;
  lock: Lock;

  constructor(o, lock) {
    super(o, ObfuscateOrder.Lock);

    this.lock = lock;
    this.made = 0;
  }

  apply(tree) {
    super.apply(tree);

    var fnName = this.getPlaceholder();
    var startTimeName = this.getPlaceholder();
    var endTimeName = this.getPlaceholder();
    var isDevName = this.getPlaceholder();
    var functionDeclaration = FunctionDeclaration(
      fnName,
      [],
      [
        ...Template(`
      var ${startTimeName} = new Date();
      debugger;
      var ${endTimeName} = new Date();
      var ${isDevName} = ${endTimeName}-${startTimeName} > 1000;
      `).compile(),

        IfStatement(
          Identifier(isDevName),
          this.options.lock.countermeasures
            ? this.lock.getCounterMeasuresCode()
            : [
                WhileStatement(Identifier(isDevName), [
                  ExpressionStatement(
                    AssignmentExpression(
                      "=",
                      Identifier(startTimeName),
                      Identifier(endTimeName)
                    )
                  ),
                ]),
              ],
          null
        ),
      ]
    );

    tree.body.unshift(...DevToolsDetection.compile({ functionName: fnName }));
    tree.body.push(functionDeclaration);
  }

  match(object, parents) {
    return isBlock(object);
  }

  transform(object, parents) {
    return () => {
      var body = getBlockBody(object.body);

      [...body].forEach((stmt, i) => {
        var addDebugger = Math.random() < 0.1 / (this.made || 1);

        if (object.type == "Program" && i == 0) {
          addDebugger = true;
        }

        if (addDebugger) {
          var index = getRandomInteger(0, body.length);
          if (body[index].type != "DebuggerStatement") {
            body.splice(index, 0, DebuggerStatement());

            this.made++;
          }
        }
      });
    };
  }
}
