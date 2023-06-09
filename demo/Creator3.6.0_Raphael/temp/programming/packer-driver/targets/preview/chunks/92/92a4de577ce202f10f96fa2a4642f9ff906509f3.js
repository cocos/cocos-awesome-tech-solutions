System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, RPath, _dec, _class, _crd, ccclass, C;

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

      _cclegacy._RF.push({}, "0c7favGfVBDca1FGBGWaW9r", "c", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass
      } = _decorator);

      // import * as Cheerio  from 'cheerio';
      _export("C", C = (_dec = ccclass('C'), _dec(_class = class C extends Component {
        onLoad() {
          // console.log(Cheerio,' cheerio')
          var path = this.addComponent(_crd && RPath === void 0 ? (_reportPossibleCrUseOfRPath({
            error: Error()
          }), RPath) : RPath); // @ts-ignore

          path.selected = true;
          path.fillColor = 'none'; // @ts-ignore

          path.M(-100, 0); // @ts-ignore

          path.C(-100, -100, 50, -100, 50, 0); // @ts-ignore

          path.S(200, 100, 200, 0);
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
//# sourceMappingURL=92a4de577ce202f10f96fa2a4642f9ff906509f3.js.map