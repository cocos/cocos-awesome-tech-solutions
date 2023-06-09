System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, RPath, _dec, _class, _crd, ccclass, RectEx;

  function _reportPossibleCrUseOfRPath(extras) {
    _reporterNs.report("RPath", "../../raphael/RPath", _context.meta, extras);
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

      _cclegacy._RF.push({}, "c1fbbC6GUNJobaFlmyCfIA8", "rect", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass
      } = _decorator);

      _export("RectEx", RectEx = (_dec = ccclass('RectEx'), _dec(_class = class RectEx extends Component {
        onLoad() {
          var path = this.addComponent(_crd && RPath === void 0 ? (_reportPossibleCrUseOfRPath({
            error: Error()
          }), RPath) : RPath); // @ts-ignore

          path.rect(-150, -150, 300, 200);
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
//# sourceMappingURL=4033d7f7639d6df6e9943bb27f1b6dc6d413da62.js.map