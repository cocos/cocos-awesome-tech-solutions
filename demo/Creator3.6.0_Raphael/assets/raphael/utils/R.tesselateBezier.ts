/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// var tessTol = 0.25;
// 
// var abs = Math.abs;
// 
// function tesselateBezier (x1, y1, x2, y2, x3, y3, x4, y4, level, points, tessTolSclae) {
//     tessTolSclae = tessTolSclae || 1;
// 
//     var x12, y12, x23, y23, x34, y34, x123, y123, x234, y234, x1234, y1234;
//     var dx, dy, d2, d3;
// 
//     if (level > 10) return;
// 
//     x12 = (x1 + x2) * 0.5;
//     y12 = (y1 + y2) * 0.5;
//     x23 = (x2 + x3) * 0.5;
//     y23 = (y2 + y3) * 0.5;
//     x34 = (x3 + x4) * 0.5;
//     y34 = (y3 + y4) * 0.5;
//     x123 = (x12 + x23) * 0.5;
//     y123 = (y12 + y23) * 0.5;
// 
//     dx = x4 - x1;
//     dy = y4 - y1;
//     d2 = abs((x2 - x4) * dy - (y2 - y4) * dx);
//     d3 = abs((x3 - x4) * dy - (y3 - y4) * dx);
// 
//     if ((d2 + d3) * (d2 + d3) < tessTol * tessTolSclae * (dx * dx + dy * dy)) {
//         points.push(x4);
//         points.push(y4);
//         return;
//     }
// 
//     x234 = (x23 + x34) * 0.5;
//     y234 = (y23 + y34) * 0.5;
//     x1234 = (x123 + x234) * 0.5;
//     y1234 = (y123 + y234) * 0.5;
// 
//     tesselateBezier(x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1, points, tessTolSclae);
//     tesselateBezier(x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1, points, tessTolSclae);
// }
// 
// module.exports = tesselateBezier;
let tessTol = 0.25;
let abs = Math.abs;
export default class tesselateBezier {
    public tesselateBezierFunc(x1, y1, x2, y2, x3, y3, x4, y4, level, points, tessTolSclae) {
        tessTolSclae = tessTolSclae || 1;

        var x12, y12, x23, y23, x34, y34, x123, y123, x234, y234, x1234, y1234;
        var dx, dy, d2, d3;

        if (level > 10) return;

        x12 = (x1 + x2) * 0.5;
        y12 = (y1 + y2) * 0.5;
        x23 = (x2 + x3) * 0.5;
        y23 = (y2 + y3) * 0.5;
        x34 = (x3 + x4) * 0.5;
        y34 = (y3 + y4) * 0.5;
        x123 = (x12 + x23) * 0.5;
        y123 = (y12 + y23) * 0.5;

        dx = x4 - x1;
        dy = y4 - y1;
        d2 = abs((x2 - x4) * dy - (y2 - y4) * dx);
        d3 = abs((x3 - x4) * dy - (y3 - y4) * dx);

        if ((d2 + d3) * (d2 + d3) < tessTol * tessTolSclae * (dx * dx + dy * dy)) {
            points.push(x4);
            points.push(y4);
            return;
        }

        x234 = (x23 + x34) * 0.5;
        y234 = (y23 + y34) * 0.5;
        x1234 = (x123 + x234) * 0.5;
        y1234 = (y123 + y234) * 0.5;

        this.tesselateBezierFunc(x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1, points, tessTolSclae);
        this.tesselateBezierFunc(x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1, points, tessTolSclae);
    }
}
