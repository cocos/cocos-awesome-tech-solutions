System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, RGroup, _dec, _class, _crd, ccclass, Group;

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
      director = _cc.director;
    }, function (_unresolved_2) {
      RGroup = _unresolved_2.RGroup;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6aad7MJKDJGtp1PUnNMcZEi", "group", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass
      } = _decorator);

      _export("Group", Group = (_dec = ccclass('Group'), _dec(_class = class Group extends Component {
        onLoad() {
          var group = this.addComponent(_crd && RGroup === void 0 ? (_reportPossibleCrUseOfRGroup({
            error: Error()
          }), RGroup) : RGroup);
          var path = group.addPath();
          path.rect(-100, -100, 100, 100);
          path.makePath();
          path = group.addPath();
          path.circle(50, 50, 50);
          path.makePath();
          group.rotation = 45;
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
//# sourceMappingURL=4023fbf35256d44c3830ff63f86a66f07058f07a.js.map