System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, Vec3, systemEvent, SystemEvent, math, macro, _dec, _class, _temp, _crd, ccclass, property, cameraMove;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec3 = _cc.Vec3;
      systemEvent = _cc.systemEvent;
      SystemEvent = _cc.SystemEvent;
      math = _cc.math;
      macro = _cc.macro;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8257bRdcEtEiqQ6Vctd7+xy", "cameraMove", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("cameraMove", cameraMove = (_dec = ccclass('cameraMove'), _dec(_class = (_temp = class cameraMove extends Component {
        constructor() {
          super(...arguments);

          _defineProperty(this, "startShift", false);

          _defineProperty(this, "startW", false);

          _defineProperty(this, "startA", false);

          _defineProperty(this, "startS", false);

          _defineProperty(this, "startD", false);
        }

        start() {
          //键盘监听
          systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
          systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this); //鼠标监听

          systemEvent.on(SystemEvent.EventType.MOUSE_MOVE, this.onMouseMove, this);
        }

        onKeyUp(event) {
          switch (event.keyCode) {
            case macro.KEY.shift:
              this.startShift = false;
              break;

            case macro.KEY.w:
              this.startW = false;
              break;

            case macro.KEY.a:
              this.startA = false;
              break;

            case macro.KEY.s:
              this.startS = false;
              break;

            case macro.KEY.d:
              this.startD = false;
              break;
          }
        }

        onKeyDown(event) {
          switch (event.keyCode) {
            case macro.KEY.shift:
              this.startShift = true;
              break;

            case macro.KEY.w:
              this.startW = true;
              break;

            case macro.KEY.a:
              this.startA = true;
              break;

            case macro.KEY.s:
              this.startS = true;
              break;

            case macro.KEY.d:
              this.startD = true;
              break;
          }
        }

        onMouseMove(event) {
          if (event.movementX != 0 && this.startShift) {
            var up = new Vec3(0, 1, 0);
            var right = new Vec3(1, 0, 0);
            var rotationx = this.node.getRotation();
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

      }, _temp)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=cameraMove.js.map