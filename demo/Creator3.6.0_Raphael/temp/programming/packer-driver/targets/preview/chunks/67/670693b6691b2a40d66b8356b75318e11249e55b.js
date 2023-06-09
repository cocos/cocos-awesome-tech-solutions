System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, RPath, _dec, _class, _crd, ccclass, L;

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

      _cclegacy._RF.push({}, "c3530pnjtRNVZHe6/ooVhu2", "l", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass
      } = _decorator);

      _export("L", L = (_dec = ccclass('L'), _dec(_class = class L extends Component {
        onLoad() {
          var path = this.addComponent(_crd && RPath === void 0 ? (_reportPossibleCrUseOfRPath({
            error: Error()
          }), RPath) : RPath); // @ts-ignore

          path.selected = true; // @ts-ignore

          path.M(-50, -100); // @ts-ignore

          path.L(50, -100); // @ts-ignore

          path.L(0, 100); // @ts-ignore

          path.Z();
          path.makePath();
        }

        backToList() {
          director.loadScene('TestList');
        }

      }) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // cc.Class({
      //     extends: cc.Component,
      // 
      //     // use this for initialization
      //     onLoad: function () {
      //         var path = this.addComponent('R.path');
      //         
      //         path.selected = true;
      //         
      //         path.M(-50, -100);
      //         path.L(50, -100);
      //         path.L(0, 100);
      //         path.Z();
      // 
      //         path.makePath();
      //     },
      // });


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=670693b6691b2a40d66b8356b75318e11249e55b.js.map