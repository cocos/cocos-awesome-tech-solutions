/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// var path2curve = require('./R.curve').path2curve;
// var findDotsAtSegment = require('./R.find').findDotsAtSegment;
// 
// function base3(t, p1, p2, p3, p4) {
//     var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
//         t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
//     return t * t2 - 3 * p1 + 3 * p2;
// }
// 
// function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
//     if (z == null) {
//         z = 1;
//     }
//     z = z > 1 ? 1 : z < 0 ? 0 : z;
//     var z2 = z / 2,
//         n = 12,
//         Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
//         Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
//         sum = 0;
//     for (var i = 0; i < n; i++) {
//         var ct = z2 * Tvalues[i] + z2,
//             xbase = base3(ct, x1, x2, x3, x4),
//             ybase = base3(ct, y1, y2, y3, y4),
//             comb = xbase * xbase + ybase * ybase;
//         sum += Cvalues[i] * Math.sqrt(comb);
//     }
//     return z2 * sum;
// }
// 
// function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
//     if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
//         return;
//     }
//     var t = 1,
//         step = t / 2,
//         t2 = t - step,
//         l,
//         e = .01;
//     l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
//     while (Math.abs(l - ll) > e) {
//         step /= 2;
//         t2 += (l < ll ? 1 : -1) * step;
//         l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
//     }
//     return t2;
// }
// 
// 
// function getPointAtSegmentLength (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
//     if (!length) {
//         return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
//     } else {
//         return findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
//     }
// }
// 
// function getLengthFactory (istotal, subpath) {
//     return function (path, length, onlystart) {
//         path = path2curve(path);
//         var x, y, p, l, sp = '', subpaths = {}, point,
//             len = 0;
//         for (var i = 0, ii = path.length; i < ii; i++) {
//             p = path[i];
//             if (p[0] === 'M') {
//                 x = +p[1];
//                 y = +p[2];
//             } else {
//                 l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
//                 if (len + l > length) {
//                     if (subpath && !subpaths.start) {
//                         point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
//                         sp += ['C' + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
//                         if (onlystart) {return sp;}
//                         subpaths.start = sp;
//                         sp = ['M' + point.x, point.y + 'C' + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
//                         len += l;
//                         x = +p[5];
//                         y = +p[6];
//                         continue;
//                     }
//                     if (!istotal && !subpath) {
//                         point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
//                         return {x: point.x, y: point.y, alpha: point.alpha};
//                     }
//                 }
//                 len += l;
//                 x = +p[5];
//                 y = +p[6];
//             }
//             sp += p.shift() + p;
//         }
//         subpaths.end = sp;
//         point = istotal ? len : subpath ? subpaths : findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
//         point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
//         return point;
//     };
// }
// 
// var getTotalLength = getLengthFactory(1);
// var getPointAtLength = getLengthFactory();
// var getSubpathsAtLength = getLengthFactory(0, 1);
// 
// /*\
//  * Raphael.getSubpath
//  [ method ]
//  **
//  * Return subpath of a given path from given length to given length.
//  **
//  > Parameters
//  **
//  - path (string) SVG path string
//  - from (number) position of the start of the segment
//  - to (number) position of the end of the segment
//  **
//  = (string) pathstring for the segment
// \*/
// function getSubpath (path, from, to) {
//     if (this.getTotalLength(path) - to < 1e-6) {
//         return getSubpathsAtLength(path, from).end;
//     }
//     var a = getSubpathsAtLength(path, to, 1);
//     return from ? getSubpathsAtLength(a, from).end : a;
// }
// 
// module.exports = {
//     getTatLen: getTatLen,
//     bezlen: bezlen,
//     getTotalLength: getTotalLength,
//     getPointAtLength: getPointAtLength,
//     getSubpathsAtLength: getSubpathsAtLength,
//     getSubpath: getSubpath
// };
