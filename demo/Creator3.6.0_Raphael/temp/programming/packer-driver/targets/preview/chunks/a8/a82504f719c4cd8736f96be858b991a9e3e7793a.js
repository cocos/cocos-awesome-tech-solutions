System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, Vec3, director, RPath, _dec, _class, _crd, ccclass, tempPoint, Simplify;

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
      Node = _cc.Node;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
      director = _cc.director;
    }, function (_unresolved_2) {
      RPath = _unresolved_2.RPath;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c8703hYIG5NTrPaSI/t9BCp", "simplify", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform', 'Vec3', 'director']);

      ({
        ccclass
      } = _decorator);
      tempPoint = new Vec3();

      _export("Simplify", Simplify = (_dec = ccclass('Simplify'), _dec(_class = class Simplify extends Component {
        constructor() {
          super(...arguments);
          this.path = null;
          this.points = [];
        }

        onLoad() {
          this.path = this.addComponent(_crd && RPath === void 0 ? (_reportPossibleCrUseOfRPath({
            error: Error()
          }), RPath) : RPath);
          this.path.fillColor = 'none';
          this.path.lineWidth = 5;
          this.path.showHandles = true;
          this.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
          this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
          this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        }

        onTouchBegan(event) {
          var touchLoc = event.getUILocation(); // console.log(touchLoc ,'  touch',touch)
          // console.log(event ,'  event')

          this.points = [];
          var com = this.node.parent.getComponent(UITransform);
          touchLoc = com.convertToNodeSpaceAR(new Vec3(touchLoc.x, touchLoc.y, 0));
          this.points = [touchLoc];
          return true;
        }

        onTouchMoved(event) {
          var touchLoc = event.getUILocation();
          var com = this.node.parent.getComponent(UITransform);
          touchLoc = com.convertToNodeSpaceAR(new Vec3(touchLoc.x, touchLoc.y, 0));
          this.points.push(touchLoc);
          this.path.points(this.points);
        }

        onTouchEnded(event) {
          this.path.points(this.points);
          this.path.simplify();
        }

        update(dt) {}

        backToList() {
          director.loadScene('TestList');
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a82504f719c4cd8736f96be858b991a9e3e7793a.js.map