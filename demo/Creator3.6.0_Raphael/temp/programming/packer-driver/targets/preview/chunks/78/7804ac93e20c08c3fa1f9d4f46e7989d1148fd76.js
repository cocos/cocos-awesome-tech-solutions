System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, AffineTransform, Vec2, drawDashPoints, _crd, sqrt;

  _export("default", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      AffineTransform = _cc.AffineTransform;
      Vec2 = _cc.Vec2;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3ed44ZCT2ZJloFqEaSDKWFw", "R.dash", undefined);

      __checkObsolete__(['AffineTransform', 'Vec2']);

      sqrt = Math.sqrt;

      _export("default", drawDashPoints = class drawDashPoints {
        drawDashPointsFunc(points, ctx, dashArray, dashOffset, transform) {
          var lastx = points[0],
              lasty = points[1];
          var dx, dy;
          var totalLength = 0;
          var length = 0;
          var dashLength = dashArray.length;
          var dashIndex = 0;
          var from = dashOffset;
          var drawLength = dashArray[dashIndex];
          var to = dashOffset + drawLength;
          var x1, y1;
          var x, y;

          for (var i = 0, l = points.length / 2; i < l; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];

            if (i !== 0) {
              dx = x - lastx;
              dy = y - lasty;
              length = sqrt(dx * dx + dy * dy);
              if (!x1) x1 = lastx;
              if (!y1) y1 = lasty;

              while (length > 0) {
                if (totalLength + length < from) {
                  totalLength += length;
                  length = 0;
                  x1 = x;
                  y1 = y;
                  continue;
                }

                if (totalLength <= from) {
                  var difLength = from - totalLength;
                  var p = difLength / length;
                  x1 = x1 + p * (x - x1);
                  y1 = y1 + p * (y - y1);

                  if (transform) {
                    var _tempVec2 = new Vec2(0, 0);

                    AffineTransform.transformVec2(_tempVec2, x1, y1, transform);
                    ctx.moveTo(_tempVec2.x, _tempVec2.y);
                  } else {
                    ctx.moveTo(x1, y1);
                  }

                  length -= difLength;
                  totalLength += difLength;
                }

                if (totalLength + length < to) {
                  x1 = x;
                  y1 = y;

                  if (transform) {
                    var _tempVec = new Vec2(0, 0);

                    AffineTransform.transformVec2(_tempVec, x1, y1, transform);
                    ctx.lineTo(_tempVec.x, _tempVec.y);
                  } else {
                    ctx.lineTo(x1, y1);
                  }

                  totalLength += length;
                  length = 0;
                } else if (totalLength + length >= to) {
                  var difLength = to - totalLength;
                  var p = difLength / length;
                  x1 = x1 + p * (x - x1);
                  y1 = y1 + p * (y - y1);

                  if (transform) {
                    var _tempVec3 = new Vec2(0, 0);

                    AffineTransform.transformVec2(_tempVec3, x1, y1, transform);
                    ctx.lineTo(_tempVec3.x, _tempVec3.y);
                  } else {
                    ctx.lineTo(x1, y1);
                  }

                  length -= difLength;
                  totalLength += difLength;
                  from = to + dashArray[++dashIndex % dashLength];
                  to = from + dashArray[++dashIndex % dashLength];
                }
              }
            }

            lastx = x;
            lasty = y;
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7804ac93e20c08c3fa1f9d4f46e7989d1148fd76.js.map