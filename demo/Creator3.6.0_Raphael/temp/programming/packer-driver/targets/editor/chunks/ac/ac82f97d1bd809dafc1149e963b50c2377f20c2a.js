System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, RPath, _dec, _class, _crd, ccclass, DashLine;

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
      director = _cc.director;
    }, function (_unresolved_2) {
      RPath = _unresolved_2.RPath;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "61ffdR0EHZFb4WwaQ/QVjEl", "dash-line", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass
      } = _decorator);

      _export("DashLine", DashLine = (_dec = ccclass('DashLine'), _dec(_class = class DashLine extends Component {
        onLoad() {
          var path = this.addComponent(_crd && RPath === void 0 ? (_reportPossibleCrUseOfRPath({
            error: Error()
          }), RPath) : RPath);
          path.dashOffset = 100;
          path.dashArray = [50, 10]; //@ts-ignore

          path.rect(-100, -100, 200, 200);
          path.makePath();
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
//# sourceMappingURL=ac82f97d1bd809dafc1149e963b50c2377f20c2a.js.map