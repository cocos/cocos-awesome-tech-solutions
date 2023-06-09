System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, math, input, Input, KeyCode, _dec, _class, _crd, ccclass, property, cameraMove;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec3 = _cc.Vec3;
      math = _cc.math;
      input = _cc.input;
      Input = _cc.Input;
      KeyCode = _cc.KeyCode;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8257bRdcEtEiqQ6Vctd7+xy", "cameraMove", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3', 'math', 'input', 'Input', 'KeyCode']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("cameraMove", cameraMove = (_dec = ccclass('cameraMove'), _dec(_class = class cameraMove extends Component {
        constructor(...args) {
          super(...args);
          this.startShift = false;
          this.startW = false;
          this.startA = false;
          this.startS = false;
          this.startD = false;
        }

        start() {
          // //键盘监听
          // systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
          // systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
          // //鼠标监听
          // systemEvent.on(SystemEvent.EventType.MOUSE_MOVE, this.onMouseMove, this);
          //键盘监听
          input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
          input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this); //鼠标监听

          input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        }

        onKeyUp(event) {
          switch (event.keyCode) {
            case KeyCode.SHIFT_LEFT:
            case KeyCode.SHIFT_RIGHT:
              this.startShift = false;
              break;

            case KeyCode.KEY_W:
              this.startW = false;
              break;

            case KeyCode.KEY_A:
              this.startA = false;
              break;

            case KeyCode.KEY_S:
              this.startS = false;
              break;

            case KeyCode.KEY_D:
              this.startD = false;
              break;
          }
        }

        onKeyDown(event) {
          switch (event.keyCode) {
            case KeyCode.SHIFT_LEFT:
            case KeyCode.SHIFT_RIGHT:
              this.startShift = true;
              break;

            case KeyCode.KEY_W:
              this.startW = true;
              break;

            case KeyCode.KEY_A:
              this.startA = true;
              break;

            case KeyCode.KEY_S:
              this.startS = true;
              break;

            case KeyCode.KEY_D:
              this.startD = true;
              break;
          }
        }

        onMouseMove(event) {
          if (event.movementX != 0 && this.startShift) {
            const up = new Vec3(0, 1, 0);
            const right = new Vec3(1, 0, 0);
            const rotationx = this.node.getRotation();
            math.Quat.rotateAround(rotationx, rotationx, up, -event.movementX / 5 / 360.0 * 3.1415926535);
            math.Quat.rotateAround(rotationx, rotationx, right, -event.movementY / 2.5 / 360.0 * 3.1415926535);
            this.node.setRotation(rotationx);
          }
        }

        update(deltaTime) {
          if (this.startW) {
            this.node.translate(new Vec3(0, deltaTime, 0));
          }

          if (this.startA) {
            this.node.translate(new Vec3(-deltaTime, 0, 0));
          }

          if (this.startS) {
            this.node.translate(new Vec3(0, -deltaTime, 0));
          }

          if (this.startD) {
            this.node.translate(new Vec3(deltaTime, 0, 0));
          }
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=cedebf1319e05dc45ad23a25628ce6d91ff66792.js.map