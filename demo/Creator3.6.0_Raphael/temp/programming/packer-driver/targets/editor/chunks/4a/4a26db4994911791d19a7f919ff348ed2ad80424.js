System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec2, Graphics, _dec, _class, _crd, ccclass, Tentacle;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec2 = _cc.Vec2;
      Graphics = _cc.Graphics;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "06e140gewhG9pluryJqSGEy", "tentacle", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec2', 'Graphics']);

      ({
        ccclass
      } = _decorator);

      _export("Tentacle", Tentacle = (_dec = ccclass('Tentacle'), _dec(_class = class Tentacle extends Component {
        constructor(...args) {
          super(...args);
          this.path = null;
          this.numSegments = null;
          this.segmentLength = null;
          this.points = [];
          this.anchor = null;
        }

        onLoad() {}

        init(group, numSegments, length) {
          this.path = group.addPath();
          this.path.fillColor = 'none';
          this.numSegments = numSegments;
          this.segmentLength = Math.random() * 1 + length - 1;

          for (var i = 0; i < this.numSegments; i++) {
            this.points.push(new Vec2(0, i * this.segmentLength));
          }

          this.path.lineCap = Graphics.LineCap.ROUND;
          this.anchor = this.points[0];
        }

        update() {
          this.points[1].x = this.anchor.x;
          this.points[1].y = this.anchor.y - 1;

          for (let i = 2; i < this.numSegments; i++) {
            var px = this.points[i].x - this.points[i - 2].x;
            var py = this.points[i].y - this.points[i - 2].y;
            var pt = new Vec2(px, py);
            var len = pt.length();

            if (len > 0.0) {
              this.points[i].x = this.points[i - 1].x + pt.x * this.segmentLength / len;
              this.points[i].y = this.points[i - 1].y + pt.y * this.segmentLength / len;
            }
          }

          this.path.points(this.points);
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4a26db4994911791d19a7f919ff348ed2ad80424.js.map