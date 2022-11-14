import Transform from "../transform";
import Template from "../../templates/template";
import { walk } from "../../traverse";
import {
  AssignmentExpression,
  CallExpression,
  ExpressionStatement,
  FunctionExpression,
  Identifier,
  MemberExpression,
  Node,
  ReturnStatement,
  SpreadElement,
  ThisExpression,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import { ok } from "assert";

export default class AntiClass extends Transform {
  constructor(o) {
    super(o);
  }

  match(o, p) {
    return o.type == "ClassDeclaration" || o.type == "ClassExpression";
  }

  transform(object, parents) {
    return () => {
      var body = object.body;
      if (body.type !== "ClassBody") {
        return;
      }
      if (!Array.isArray(body.body)) {
        return;
      }

      var isDeclaration = object.type == "ClassDeclaration";

      var virtualName = "virtual" + this.getPlaceholder();

      var staticBody: Node[] = [];
      var virtualBody: Node[] = [];
      var superName;
      var thisName = "this" + this.getPlaceholder();

      // self this
      virtualBody.push(Template(`var ${thisName} = this;`).single());
      virtualBody.push(Template(`${thisName}["constructor"] = null;`).single());
      var superArguments;
      var superBody = [];

      if (object.superClass) {
        superName = "super" + this.getPlaceholder();
      }

      var virtualDescriptorsName = this.getPlaceholder();
      var staticDescriptorsName = this.getPlaceholder();

      // getters/setters
      virtualBody.push(
        Template(
          `var ${virtualDescriptorsName} = {getters: {}, setters: {}}`
        ).single()
      );

      // getters/setters
      staticBody.push(
        Template(
          `var ${staticDescriptorsName} = {getters: {}, setters: {}}`
        ).single()
      );

      body.body.forEach((methodDefinition) => {
        if (!methodDefinition.key) {
          return;
        }
        var isStatic = methodDefinition.static;

        var key = MemberExpression(
          isStatic ? Identifier(virtualName) : ThisExpression(),
          methodDefinition.key,
          methodDefinition.computed
        );
        var value = methodDefinition.value;

        var pushingTo = isStatic ? staticBody : virtualBody;

        if (superName && value.type == "FunctionExpression") {
          var first = value.body.body[0];
          if (
            first.type == "ExpressionStatement" &&
            first.expression.type == "CallExpression"
          ) {
            if (first.expression.callee.type == "Super") {
              superArguments = first.expression.arguments;
              value.body.body.shift();
            }
          }

          walk(
            value.body,
            [value, methodDefinition, body.body, body, object, ...parents],
            (o, p) => {
              if (o.type == "Super") {
                this.replace(o, Identifier(superName));
              }
            }
          );
        }

        if (
          methodDefinition.kind == "constructor" ||
          methodDefinition.kind == "method"
        ) {
          pushingTo.push(
            ExpressionStatement(AssignmentExpression("=", key, value))
          );
        } else if (
          methodDefinition.kind == "get" ||
          methodDefinition.kind == "set"
        ) {
          var id = Identifier(
            methodDefinition.kind == "get" ? "getters" : "setters"
          );
          var type = MemberExpression(
            Identifier(
              isStatic ? staticDescriptorsName : virtualDescriptorsName
            ),
            id,
            false
          );

          var assignmentExpression = AssignmentExpression(
            "=",

            MemberExpression(
              type,
              methodDefinition.key,
              methodDefinition.computed
            ),
            value
          );

          pushingTo.push(ExpressionStatement(assignmentExpression));
        } else {
          console.log(methodDefinition);
          throw new Error("Unsupported method definition");
        }
      });

      virtualBody.push(
        Template(`
      [...Object.keys(${virtualDescriptorsName}.getters), ...Object.keys(${virtualDescriptorsName}.setters)].forEach(key=>{
  
        if( !${thisName}.hasOwnProperty(key) ) {
          var getter = ${virtualDescriptorsName}.getters[key];
          var setter = ${virtualDescriptorsName}.setters[key];
          Object.defineProperty(${thisName}, key, {
            get: getter,
            set: setter,
            configurable: true
          })
        }
  
      })
      
      `).single()
      );

      staticBody.push(
        Template(`
      [...Object.keys(${staticDescriptorsName}.getters), ...Object.keys(${staticDescriptorsName}.setters)].forEach(key=>{
  
        if( !${virtualName}.hasOwnProperty(key) ) {
          var getter = ${staticDescriptorsName}.getters[key];
          var setter = ${staticDescriptorsName}.setters[key];
          Object.defineProperty(${virtualName}, key, {
            get: getter,
            set: setter,
            configurable: true
          })
        }
  
      })
      
      `).single()
      );

      if (superName) {
        ok(superArguments, "Super class with no super arguments");

        // save the super state
        virtualBody.unshift(
          Template(
            `
            Object.keys(this).forEach(key=>{
              var descriptor = Object.getOwnPropertyDescriptor(this, key);
              if ( descriptor) {
                Object.defineProperty(${superName}, key, descriptor)
              } else {
                ${superName}[key] = this[key];
              }
            })`
          ).single()
        );

        virtualBody.unshift(
          ExpressionStatement(
            CallExpression(
              MemberExpression(object.superClass, Identifier("call"), false),
              [ThisExpression(), ...superArguments]
            )
          )
        );

        virtualBody.unshift(Template(`var ${superName} = {}`).single());
      }

      virtualBody.push(
        Template(
          `if(!this["constructor"]){this["constructor"] = ()=>{}};`
        ).single()
      );
      if (object.id && object.id.name) {
        virtualBody.push(
          Template(`Object.defineProperty(this["constructor"], 'name', {
          writable: true,
          configurable: true,
          value: '${object.id.name}'
        });`).single()
        );
      }

      virtualBody.push(Template(`this["constructor"](...arguments)`).single());

      var virtualFunction = FunctionExpression([], virtualBody);

      var completeBody = [
        VariableDeclaration(VariableDeclarator(virtualName, virtualFunction)),
        ...staticBody,
        ReturnStatement(Identifier(virtualName)),
      ];

      var expr: Node = CallExpression(FunctionExpression([], completeBody), []);
      if (isDeclaration) {
        expr = VariableDeclaration(VariableDeclarator(object.id, expr));
      }

      this.replace(object, expr);
    };
  }
}
