System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec2, Color, director, RPath, _dec, _class, _crd, ccclass, Animate;

  function _reportPossibleCrUseOfRPath(extras) {
    _reporterNs.report("RPath", "../raphael/RPath", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec2 = _cc.Vec2;
      Color = _cc.Color;
      director = _cc.director;
    }, function (_unresolved_2) {
      RPath = _unresolved_2.RPath;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "37fb8xBJQBN7q7VurnBDDkZ", "animate", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec2', 'Color', 'director']);

      ({
        ccclass
      } = _decorator);

      _export("Animate", Animate = (_dec = ccclass('Animate'), _dec(_class = class Animate extends Component {
        constructor(...args) {
          super(...args);
          this.path = null;
        }

        onLoad() {
          var path = this.addComponent(_crd && RPath === void 0 ? (_reportPossibleCrUseOfRPath({
            error: Error()
          }), RPath) : RPath);
          path.strokeColor = Color.WHITE;
          path.lineWidth = 4;
          path.fillColor = 'none';
          path.scale = new Vec2(4, -4);
          path.position = new Vec2(-100, 120);
          this.path = path;
          var pathStrings = path.getDemoData();
          var i = 0;
          var duration = 2;

          function animate() {
            var pathString1 = pathStrings[i];
            i = i + 1 >= pathStrings.length ? 0 : i + 1;
            var pathString2 = pathStrings[i];
            path.animateFunc(pathString1, pathString2, duration);
          }

          animate();
          setInterval(animate, duration * 1.5 * 1000);
        }

        backToList() {
          director.loadScene('TestList');
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=50580fbf7c4c86fb472a7e32a611b7ced75044e7.js.map