
import { math, v2, Vec2 } from "cc";

function ab_cross_ac(a, b, c) //ab与ac的叉积
{
    return cross(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y);
}
function dot(x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
}
function cross(x1, y1, x2, y2) {
    return x1 * y2 - x2 * y1;
}
function dblcmp(a: number, b: number) {
    if (Math.abs(a - b) <= 0.000001) return 0;
    if (a > b) return 1;
    else return -1;
}

//求a点是不是在线段上，>0不在，=0与端点重合，<0在。
function point_on_line(a, p1, p2) {
    return dblcmp(dot(p1.x - a.x, p1.y - a.y, p2.x - a.x, p2.y - a.y), 0);
}

// 判断一个点是否在三角形内
export function isInTriangle(point: Vec2, triA: Vec2, triB: Vec2, triC: Vec2) {
    let AB: Vec2 = new Vec2();
    Vec2.subtract(AB, triB, triA);

    let AC: Vec2 = new Vec2();
    Vec2.subtract(AC, triC, triA);

    let BC: Vec2 = new Vec2();
    Vec2.subtract(BC, triC, triB);

    let AD: Vec2 = new Vec2();
    Vec2.subtract(AD, point, triA);

    let BD: Vec2 = new Vec2();
    Vec2.subtract(BD, point, triB);

    //@ts-ignore
    return (AB.cross(AC) >= 0 ^ AB.cross(AD) < 0) && (AB.cross(AC) >= 0 ^ AC.cross(AD) >= 0) && (BC.cross(AB) > 0 ^ BC.cross(BD) >= 0);
}


export function isInPolygon(checkPoint: Vec2, polygonPoints: Vec2[]) {
    var counter = 0;
    var i: number;
    var xinters;
    var p1: Vec2, p2: Vec2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];

    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
            checkPoint.x > Math.min(p1.x, p2.x) &&
            checkPoint.x <= Math.max(p1.x, p2.x)
        ) {
            if (checkPoint.y <= Math.max(p1.y, p2.y)) {
                if (p1.x != p2.x) {
                    xinters = (checkPoint.x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                    if (p1.y == p2.y || checkPoint.y <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }

    if (counter % 2 == 0) {
        return false;
    }

    return true;
}

export function computeUv(points: Vec2[], width: number, height: number) {
    let uvs: Vec2[] = [];
    for (const p of points) {
        // uv原点是左上角
        let x = math.clamp(0, 1, (p.x + width / 2) / width);
        let y = math.clamp(0, 1, 1. - (p.y + height / 2) / height);
        uvs.push(v2(x, y));
    }
    return uvs;
}

export function splitPolygon(points: Vec2[]): number[] {
    if (points.length <= 3) return [0, 1, 2];
    let pointMap: { [key: string]: number } = {};     // point与idx的映射
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        pointMap[`${p.x}-${p.y}`] = i;
    }
    const getIdx = (p: Vec2) => {
        return pointMap[`${p.x}-${p.y}`]
    }
    points = points.concat([]);
    let idxs: number[] = [];

    let index = 0;
    while (points.length > 3) {
        let p1 = points[(index) % points.length]
            , p2 = points[(index + 1) % points.length]
            , p3 = points[(index + 2) % points.length];
        let splitPoint = (index + 1) % points.length;

        let v1: Vec2 = new Vec2();
        Vec2.subtract(v1, p2, p1);
        let v2: Vec2 = new Vec2();
        Vec2.subtract(v2, p3, p2);

        if (v1.cross(v2) < 0) {      // 是一个凹角, 寻找下一个
            index = (index + 1) % points.length;
            continue;
        }
        let hasPoint = false;
        for (const p of points) {
            if (p != p1 && p != p2 && p != p3 && isInTriangle(p, p1, p2, p3)) {
                hasPoint = true;
                break;
            }
        }
        if (hasPoint) {      // 当前三角形包含其他点, 寻找下一个
            index = (index + 1) % points.length;
            continue;
        }
        // 找到了耳朵, 切掉
        idxs.push(getIdx(p1), getIdx(p2), getIdx(p3));
        points.splice(splitPoint, 1);
    }
    for (const p of points) {
        idxs.push(getIdx(p));
    }
    return idxs;
}

//点发出的右射线和线段的关系
// 返回值: -1:不相交, 0:相交, 1:点在线段上
function rayPointToLine(point: Vec2, linePA: Vec2, linePB: Vec2) {
    // 定义最小和最大的X Y轴值  
    let minX = Math.min(linePA.x, linePB.x);
    let maxX = Math.max(linePA.x, linePB.x);
    let minY = Math.min(linePA.y, linePB.y);
    let maxY = Math.max(linePA.y, linePB.y);

    // 射线与边无交点的其他情况  
    if (point.y < minY || point.y > maxY || point.x > maxX) {
        return -1;
    }

    // 剩下的情况, 计算射线与边所在的直线的交点的横坐标  
    let x0 = linePA.x + ((linePB.x - linePA.x) / (linePB.y - linePA.y)) * (point.y - linePA.y);
    if (x0 > point.x) {
        return 0;
    }
    if (x0 == point.x) {
        return 1;
    }
    return -1;
}

//点和多边形的关系
//返回值: -1:在多边形外部, 0:在多边形内部, 1:在多边形边线内, 2:跟多边形某个顶点重合
function relationPointToPolygon(point: Vec2, polygon: Vec2[]) {
    let count = 0;
    for (let i = 0; i < polygon.length; ++i) {
        if (polygon[i].equals(point)) {
            return 2;
        }

        let pa = polygon[i];
        let pb = polygon[0];
        if (i < polygon.length - 1) {
            pb = polygon[i + 1];
        }

        let re = rayPointToLine(point, pa, pb);
        if (re == 1) {
            return 1;
        }
        if (re == 0) {
            count++;
        }
    }
    if (count % 2 == 0) {
        return -1;
    }
    return 0;
}

//求两条线段的交点
//返回值：[n,p] n:0相交，1在共有点，-1不相交  p:交点
function lineCrossPoint(p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2): [number, Vec2] {
    let a = p1, b = p2, c = q1, d = q2;
    let s1, s2, s3, s4;
    let d1, d2, d3, d4;
    let p: Vec2 = new Vec2(0, 0);

    d1 = dblcmp(s1 = ab_cross_ac(a, b, c), 0);
    d2 = dblcmp(s2 = ab_cross_ac(a, b, d), 0);
    d3 = dblcmp(s3 = ab_cross_ac(c, d, a), 0);
    d4 = dblcmp(s4 = ab_cross_ac(c, d, b), 0);

    //如果规范相交则求交点
    if ((d1 ^ d2) == -2 && (d3 ^ d4) == -2) {
        p.x = (c.x * s2 - d.x * s1) / (s2 - s1);
        p.y = (c.y * s2 - d.y * s1) / (s2 - s1);
        return [0, p];
    }

    //如果不规范相交
    if (d1 == 0 && point_on_line(c, a, b) <= 0) {
        p = c;
        return [1, p];
    }
    if (d2 == 0 && point_on_line(d, a, b) <= 0) {
        p = d;
        return [1, p];
    }
    if (d3 == 0 && point_on_line(a, c, d) <= 0) {
        p = a;
        return [1, p];
    }
    if (d4 == 0 && point_on_line(b, c, d) <= 0) {
        p = b;
        return [1, p];
    }
    //如果不相交
    return [-1, null];
}

//线段对多边形进行切割
//返回多边形数组
//如果没有被切割，返回空数组
export function lineCutPolygon(pa: Vec2, pb: Vec2, polygon: Vec2[]) {
    let ret: Array<Vec2[]> = [];

    let points: Vec2[] = [];
    let pointIndex: number[] = [];

    //将所有的点以及交点组成一个点序列
    for (let i = 0; i < polygon.length; ++i) {
        points.push(polygon[i]);

        let a = polygon[i];
        let b = polygon[0];
        if (i < polygon.length - 1) b = polygon[i + 1];

        let c = lineCrossPoint(pa, pb, a, b);
        if (c[0] == 0) {
            pointIndex.push(points.length);
            points.push(c[1] as Vec2);
        }
        else if (c[0] > 0) {
            if ((c[1] as Vec2).equals(a)) {
                pointIndex.push(points.length - 1);
            }
            else {
                pointIndex.push(points.length);
            }
        }
    }
    if (pointIndex.length > 1) {
        //准备从第一个交点开始拆，先弄清楚第一个交点是由外穿内，还是内穿外
        let cp0 = points[pointIndex[0]];
        let cp1 = points[pointIndex[1]];

        let r = relationPointToPolygon(new Vec2((cp0.x + cp1.x) / 2, (cp0.y + cp1.y) / 2), polygon);
        let inPolygon: boolean = r >= 0;

        let cp0_cp1: Vec2 = new Vec2();
        let len_0_1 = Vec2.subtract(cp0_cp1, cp0, cp1).length()

        let cp0_cp: Vec2 = new Vec2();
        let len_0_ = Vec2.subtract(cp0_cp, cp0, points[pointIndex[pointIndex.length - 1]]).length()

        if (pointIndex.length > 2 && len_0_1 > len_0_) {
            cp1 = points[pointIndex[pointIndex.length - 1]];
            r = relationPointToPolygon(new Vec2((cp0.x + cp1.x) / 2, (cp0.y + cp1.y) / 2), polygon);
            inPolygon = r < 0;
        }

        let firstInPolygon = inPolygon;//起始点是从外面穿到里面

        let index = 0;
        let startIndex = pointIndex[index];
        let oldPoints = [];
        let newPoints = [];
        let count = 0;

        oldPoints.push(points[startIndex]);
        if (inPolygon) {
            newPoints.push(points[startIndex]);
        }

        index++;
        count++;
        startIndex++;

        while (count < points.length) {
            if (startIndex == points.length) startIndex = 0;
            let p = points[startIndex];
            if (index >= 0 && startIndex == pointIndex[index]) {
                //又是一个交点
                index++;
                if (index >= pointIndex.length) index = 0;
                if (inPolygon) {
                    //原来是在多边形内部
                    //产生了新的多边形
                    newPoints.push(p);
                    ret.push(newPoints);
                    newPoints = [];
                }
                else {
                    //开始新的多边形
                    newPoints = [];
                    newPoints.push(p);
                }
                oldPoints.push(p);
                inPolygon = !inPolygon;
            }
            else {
                //普通的点
                if (inPolygon) {
                    newPoints.push(p);
                }
                else {
                    oldPoints.push(p);
                }
            }
            startIndex++;
            count++;
        }
        if (inPolygon) {
            if (!firstInPolygon && newPoints.length > 1) {
                //如果起始点是从里面穿出去，到这里跟起始点形成闭包
                newPoints.push(points[pointIndex[0]]);
                ret.push(newPoints);
            }
            else {
                //结束了，但是现在的状态是穿在多边形内部
                //把newPoints里面的回复到主多边形中
                for (let i = 0; i < newPoints.length; ++i) {
                    oldPoints.push(newPoints[i]);
                }
            }

        }

        ret.push(oldPoints);
    }
    return ret;
}