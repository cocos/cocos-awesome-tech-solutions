System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, resources, error, director, Color, RGroup, _dec, _class, _crd, ccclass, Svg;

  function _reportPossibleCrUseOfRGroup(extras) {
    _reporterNs.report("RGroup", "../raphael/RGroup", _context.meta, extras);
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
      resources = _cc.resources;
      error = _cc.error;
      director = _cc.director;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      RGroup = _unresolved_2.RGroup;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "fb53bMt0MlJHqaTqqxdDQfm", "svg", undefined);

      __checkObsolete__(['_decorator', 'Component', 'resources', 'error', 'director', 'Color']);

      ({
        ccclass
      } = _decorator);

      _export("Svg", Svg = (_dec = ccclass('Svg'), _dec(_class = class Svg extends Component {
        onLoad() {
          var group = this.addComponent(_crd && RGroup === void 0 ? (_reportPossibleCrUseOfRGroup({
            error: Error()
          }), RGroup) : RGroup);
          resources.load('svg/tiger', (err, txt) => {
            if (err) {
              error(err.toString());
              return;
            }

            console.log(txt, ' text');
            group.loadSvg(txt);
          });
          group.strokeColor = Color.BLACK;
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
//# sourceMappingURL=d42eb7736a99519335357ff8dda0fd97a8b8377f.js.map