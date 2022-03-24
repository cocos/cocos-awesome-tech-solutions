
import { AffineTransform, Vec2 } from "cc";

let sqrt = Math.sqrt;
export default class drawDashPoints {

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
                            let _tempVec2 = new Vec2(0,0);
                            AffineTransform.transformVec2(_tempVec2, x1, y1, transform);
                            ctx.moveTo(_tempVec2.x, _tempVec2.y);
                        }
                        else {
                            ctx.moveTo(x1, y1);
                        }

                        length -= difLength;
                        totalLength += difLength;
                    }

                    if ((totalLength + length) < to) {
                        x1 = x;
                        y1 = y;

                        if (transform) {
                            let _tempVec2 = new Vec2(0,0);

                            AffineTransform.transformVec2(_tempVec2, x1, y1, transform);
                            ctx.lineTo(_tempVec2.x, _tempVec2.y);
                        }
                        else {
                            ctx.lineTo(x1, y1);
                        }

                        totalLength += length;
                        length = 0;
                    }
                    else if ((totalLength + length) >= to) {
                        var difLength = to - totalLength;
                        var p = difLength / length;

                        x1 = x1 + p * (x - x1);
                        y1 = y1 + p * (y - y1);

                        if (transform) {
                            let _tempVec2 = new Vec2(0,0);
                            AffineTransform.transformVec2(_tempVec2, x1, y1, transform);
                            ctx.lineTo(_tempVec2.x, _tempVec2.y);
                        }
                        else {
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

}