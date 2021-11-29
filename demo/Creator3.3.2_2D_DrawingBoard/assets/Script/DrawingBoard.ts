/**
 * 画板：
 * 可使用任意颜色绘制矩形，三角形，圆，直线，并统计每种颜色的像素个数
 * 擦除图案时，设置画板的颜色为透明色再进行绘制即可
 * @href https://forum.cocos.org/t/topic/89902
 */
import { _decorator } from 'cc';


class Vec2 {
    public x: number;
    public y: number;

    constructor (x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set (p: number | Vec2, y?: number) {
        if (typeof p === "number") {
            this.x = p;
            this.y = y;
        } else {
            this.x = p.x;
            this.y = p.y;
        }
    }
}

export default class DrawingBoard {
    private _witdh: number;
    /**画板宽度 */
    public get width(): number { return this._witdh; }
    private _height: number;
    /**画板高度 */
    public get height(): number { return this._height; }
    /**记录每个像素点的颜色值的数组，颜色值用十六进制表示，RGBA格式 */
    private pointColor: number[][];
    /**记录每个像素点能否绘制，0表示不能绘制，1表示能绘制 */
    private maskPoint: number[][];
    /**存储像素数据的内存块 */
    private buffer: ArrayBuffer;
    /**颜色分量一维数组，供渲染使用 */
    private pixelColor: Uint8Array;
    /**记录各种颜色的像素的数量 */
    private colorCount: { [key: number]: number };
    /**记录最近一次绘制像素的颜色(十六进制颜色值)，调用绘制函数且未指定颜色值时，将使用该值 */
    private curColor: number;
    /**临时存储的颜色值 */
    private tempColor: number;
    private tempR: number;
    private tempG: number;
    private tempB: number;
    private tempA: number;

    /**
     * 可对每个像素点绘制的画板，画板使用的坐标系原点为左下角，X轴向右为正，Y轴向上为正
     * @param width     画板宽度
     * @param height    画板高度
     * @param data      指定画板初始内容，参数为记录颜色分量的一维数组，不传入参数时，画板中全部像素为透明
     */
    public constructor (width: number, height: number, data?: ArrayBuffer) {
        this.init(width, height, data);
    }

    //#region 初始化
    /**
     * 对画板进行初始化，会清空已绘制的所有内容
     * @param width     画板宽度
     * @param height    画板高度
     * @param data      指定画板初始内容，参数为记录颜色分量的一维数组，不传入参数时，画板内容为全部透明的矩形
     */
    public init (width: number, height: number, data?: ArrayBuffer) {
        this.tempColor = this.tempR = this.tempG = this.tempB = this.tempA = 0;
        this.curColor = 0;
        this._witdh = Math.round(width);
        this._height = Math.round(height);
        this.initPointColor();
        this.initMaskPoint();
        this.initPixelColor();
        this.initLineData();
        if (!!data) {
            this.setData(data);
        }
    }

    private initPointColor() {
        if (!this.pointColor) {
            this.pointColor = [];
        }
        for (let x = 0; x < this.width; ++x) {
            if (!this.pointColor[x]) {
                this.pointColor[x] = [];
            }
            for (let y = 0; y < this.height; ++y) {
                this.pointColor[x][y] = 0;
            }
        }
        this.colorCount = {};
        this.colorCount[0] = this.width * this.height;
    }

    private initMaskPoint() {
        if (!this.maskPoint) {
            this.maskPoint = [];
        }
        for (let x = 0; x < this.width; ++x) {
            if (!this.maskPoint[x]) {
                this.maskPoint[x] = [];
            }
            for (let y = 0; y < this.height; ++y) {
                this.maskPoint[x][y] = 1;
            }
        }
    }

    private initPixelColor() {
        this.buffer = new ArrayBuffer(this.width * this.height * 4);
        this.pixelColor = new Uint8Array(this.buffer);
        this.pixelColor.fill(0);
    }

    //#endregion
    //#region 重置内容
    /**重置画板，画板的宽高不变，但会清空已绘制的所有内容，恢复至透明状态 */
    public reset() {
        this.resetPointColor();
        this.resetMaskPoint();
        this.resetPixelColor();
    }

    private resetPointColor() {
        for (let x = this.width - 1; x >= 0; --x) {
            for (let y = this.height - 1; y >= 0; --y) {
                this.pointColor[x][y] = 0;
            }
        }
        for (let key in this.colorCount) {
            this.colorCount[key] = 0;
        }
    }

    private resetMaskPoint() {
        for (let x = this.width - 1; x >= 0; --x) {
            for (let y = this.height - 1; y >= 0; --y) {
                this.maskPoint[x][y] = 1;
            }
        }
    }

    private resetPixelColor() {
        this.pixelColor.fill(0);
    }

    //#endregion
    /**
     * 传入图像的像素数据，直接设置画板的内容，图像尺寸必须与画板一致，若需要重新设置画板大小，请使用 init() 函数
     * @param data 记录各像素颜色分量的一维数组
     */
    public setData(data: ArrayBuffer) {
        let pixelData = new Uint8Array(data);
        if (pixelData.length != this.width * this.height * 4) {
            console.warn("画板设置数据失败，数据长度与画板大小不一致。");
            return;
        }
        this.setPixelColorByRGBA(pixelData);
        this.setPointColorByRGBA(pixelData);
    }

    /**
     * 记录各像素颜色分量
     * @param data 颜色分量一维数组
     */
    private setPixelColorByRGBA(data: Uint8Array) {
        this.pixelColor.set(data);
    }

    /**
     * 按像素点的坐标记录像素点的颜色值
     * @param data 颜色分量一维数组
     */
    private setPointColorByRGBA(data: Uint8Array) {
        this.colorCount = {};
        for (let y = 0; y < this.height; ++y) {
            let i = y * this.height;
            for (let x = 0; x < this.width; ++x) {
                let color = this.convertToNumber(data[i++], data[i++], data[i++], data[i++]);
                this.pointColor[x][y] = color;
                if (!this.colorCount[color]) {
                    this.colorCount[color] = 1;
                } else {
                    this.colorCount[color] += 1;
                }
            }
        }
    }

    /**
     * 设置不能绘制图案的像素区域
     * @param data  像素坐标为索引，0表示不能绘制，1表示能绘制
     */
    public setMask(data: number[][]) {
        for (let x = this.width - 1; x >= 0; --x) {
            if (!!data[x]) {
                for (let y = this.height - 1; y >= 0; --y) {
                    if (undefined != data[x][y]) {
                        this.maskPoint[x][y] = data[x][y];
                    }
                }
            }
        }
    }

    /**
     * 设置画板为全部区域都不能绘制
     */
    public setDisable() {
        for (let x = this.width - 1; x >= 0; --x) {
            for (let y = this.height - 1; y >= 0; --y) {
                this.maskPoint[x][y] = 0;
            }
        }
    }

    /**
     * 在现有可绘制区域的基础上添加可以绘制的像素点区域。
     * 此方法不会禁用画板当前可绘制的像素点区域，只会添加新的可绘制区域
     * @param data  像素坐标为索引，0表示不能绘制，1表示能绘制
     */
    public addEnablePoints(data: number[][]) {
        for (let x = this.width - 1; x >= 0; --x) {
            if (!!data[x]) {
                for (let y = this.height - 1; y >= 0; --y) {
                    if (!!data[x][y]) {
                        this.maskPoint[x][y] = data[x][y];
                    }
                }
            }
        }
    }

    /**
     * 获取画板中的数据
     * @param data 用于接收数据的数组
     * @returns {number[]} 返回存储各像素点颜色分量的一维数组
     */
    public copyData(data?: number[]): number[] {
        if (undefined === data) {
            data = [];
        }
        for (let i = 0, count = this.pixelColor.length; i < count; ++i) {
            data[i] = this.pixelColor[i];
        }
        return data;
    }

    /**
     * 获取画板中记录每个像素的颜色分量的数据
     * @returns 将直接返回画板内部的数组；注：若使用者需要对该数据进行修改，请使用 copyData 方法获取，以免影响画板的像素个数计数功能
     */
    public getData(): Uint8Array {
        return this.pixelColor;
    }

    /**获取画板内部使用的内存块，若仅需要获取像素数据，不进一步处理，使用 getData 即可 */
    public getBuffer(): ArrayBuffer {
        return this.buffer;
    }

    public getPointData(): number[][] {
        return this.pointColor;
    }

    /**
     * 获取指定颜色的像素的个数
     * @param r 颜色的r分量
     * @param g 颜色的g分量
     * @param b 颜色的b分量
     * @param a 颜色透明度，默认为255
     */
    public getColorCount(r: number, g: number, b: number, a: number = 255): number {
        let c = this.convertToNumber(r, g, b, a);
        return this.colorCount[c];
    }

    /**
     * 设置画板绘制图案使使用的颜色
     * @param r 包含RGBA分量的颜色对象，或者颜色的r分量
     * @param g 颜色的g分量
     * @param b 颜色的b分量
     * @param a 颜色透明度，默认为255
     */
    public setColor(r: number, g: number, b: number, a: number = 255) {
        this.curColor = this.convertToNumber(r, g, b, a);
        if (!this.colorCount[this.curColor]) {
            this.colorCount[this.curColor] = 0;
        }
        this.tempColor = this.curColor;
        this.tempR = r;
        this.tempG = g;
        this.tempB = b;
        this.tempA = a;
    }

    /**清空所有已绘制的内容 */
    public clear() {
        this.reset();
    }

    //#region 绘制：直线
    //直线
    /**上一次绘制的直线的终点 */
    private previousLineEndPos: Vec2;
    private previousLineEndPosT: Vec2;
    private previousLineEndPosB: Vec2;
    /**上一次绘制的直线的端点样式 */
    private previousLineCircleEnd: boolean;
    /**上一次绘制的直线的宽度 */
    private previousLineWidth: number;

    private initLineData() {
        this.previousLineEndPos = new Vec2();
        this.previousLineEndPosT = new Vec2();
        this.previousLineEndPosB = new Vec2();
        this.previousLineCircleEnd = true;
        this.previousLineWidth = 1;
    }

    /**
     * 移动画笔到指定的位置，调用 lineTo 函数时将使用该点作为直线的起点
     * @param x     坐标X
     * @param y     坐标Y
     */
    public moveTo(x: number, y: number) {
        x = Math.round(x);
        y = Math.round(y);
        this.previousLineEndPos.set(x, y);
        this.previousLineEndPosT.set(x, y);
        this.previousLineEndPosB.set(x, y);
    }

    /**
     * 设置线宽
     */
    public setLineWidth(w: number) {
        this.previousLineWidth = w;
    }

    /**
     * 设置线段端点样式
     * @param b 线段端点是否为圆形
     */
    public setLineCircleEnd(b: boolean) {
        this.previousLineCircleEnd = b;
    }

    /**
     * 绘制直线，使用默认的颜色、线宽和线段端点样式
     * @param x1        起点坐标X
     * @param y1        起点坐标Y
     * @param x2        终点坐标X
     * @param y2        终点坐标Y
     */
    public line(x1: number, y1: number, x2: number, y2: number) {
        x1 = Math.round(x1);
        x2 = Math.round(x2);
        y1 = Math.round(y1);
        y2 = Math.round(y2);
        if (x1 == x2 && y1 == y2) return;
        let width = this.previousLineWidth;
        let circleEnd = this.previousLineCircleEnd;
        this.previousLineEndPos.set(x2, y2);
        let offsetX = 0;
        let offsetY = 0;
        let rateK = 1;
        if (x1 == x2) {
            offsetX = Math.round(width * 0.5);
        } else if (y1 == y2) {
            offsetY = Math.round(width * 0.5);
        } else {
            let k = (y2 - y1) / (x2 - x1);
            rateK = Math.sqrt(k * k + 1);
            offsetY = width * 0.5 / rateK;
            offsetX = Math.round(offsetY * k);
            offsetY = Math.round(offsetY);
        }
        this.previousLineEndPosT.set(x2 - offsetX, y2 + offsetY);
        this.previousLineEndPosB.set(x2 + offsetX, y2 - offsetY);

        let p1 = new Vec2(x1, y1);
        let p2 = new Vec2(x2, y2);
        if (x1 > x2) {
            p1.x = x2;
            p1.y = y2;
            p2.x = x1;
            p2.y = y1;
        }
        this._drawLine(p1, p2, width, offsetX, offsetY, rateK);
        if (circleEnd) {
            this._drawCircle(x1, y1, width * 0.5);
            this._drawCircle(x2, y2, width * 0.5);
        }
    }

    /**
     * 绘制到指定坐标的直线，起点为上一次绘制的直线的终点，使用默认的颜色、宽度和线段端点样式
     * @param x     终点坐标X
     * @param y     终点坐标Y
     */
    public lineTo(x: number, y: number) {
        x = Math.round(x);
        y = Math.round(y);
        if (this.previousLineEndPos.x == x && this.previousLineEndPos.y == y) return;
        let width = this.previousLineWidth;
        let circleEnd = this.previousLineCircleEnd;
        let x1 = this.previousLineEndPos.x;
        let y1 = this.previousLineEndPos.y;
        let x2 = x;
        let y2 = y;
        if (x1 > x2) {
            x1 = x2;
            y1 = y2;
            x2 = this.previousLineEndPos.x;
            y2 = this.previousLineEndPos.y;
        }
        let offsetX = 0;
        let offsetY = 0;
        let rateK = 1;
        if (x1 == x2) {
            offsetX = Math.round(width * 0.5);
        } else if (y1 == y2) {
            offsetY = Math.round(width * 0.5);
        } else {
            let k = (y2 - y1) / (x2 - x1);
            rateK = Math.sqrt(k * k + 1);
            offsetY = width * 0.5 / rateK;
            offsetX = Math.round(offsetY * k);
            offsetY = Math.round(offsetY);
        }
        if (!circleEnd) {
            if (this.previousLineEndPos.x != this.previousLineEndPosT.x ||
                this.previousLineEndPos.y != this.previousLineEndPosT.y) {
                let p1 = new Vec2(this.previousLineEndPos.x - offsetX, this.previousLineEndPos.y + offsetY);
                let p2 = new Vec2(this.previousLineEndPos.x + offsetX, this.previousLineEndPos.y - offsetY);
                this._drawTriangle([p1, p2, this.previousLineEndPosT]);
                this._drawTriangle([p1, p2, this.previousLineEndPosB]);
            }
        } else {
            this._drawCircle(x1, y1, width * 0.5);
            this._drawCircle(x2, y2, width * 0.5);
        }
        this._drawLine(new Vec2(x1, y1), new Vec2(x2, y2), width, offsetX, offsetY, rateK);

        this.previousLineEndPos.set(x, y);
        this.previousLineEndPosT.set(x - offsetX, y + offsetY);
        this.previousLineEndPosB.set(x + offsetX, y - offsetY);
    }

    /**
     * 绘制直线，不包含线段端点样式
     * @param p1        线段起点坐标
     * @param p2        线段终点坐标
     * @param width     线段宽度
     * @param color     线段颜色
     */
    private _drawLine(p1: Vec2, p2: Vec2, width: number, offsetX: number, offsetY: number, slopeRate: number) {
        if (p1.y == p2.y) {
            // 水平直线
            let x = p1.x < p2.x ? p1.x : p2.x;
            this._drawRect(new Vec2(x, Math.round(p1.y - width * 0.5)), Math.abs(p1.x - p2.x), width);
        } else if (p1.x == p2.x) {
            // 垂直直线
            let y = p1.y < p2.y ? p1.y : p2.y;
            this._drawRect(new Vec2(Math.round(p1.x - width * 0.5), y), width, Math.abs(p1.y - p2.y));
        } else {
            // 倾斜直线
            let inverseK = (p1.x - p2.x) / (p1.y - p2.y);
            let p1t = new Vec2(p1.x - offsetX, p1.y + offsetY);
            let p1b = new Vec2(p1.x + offsetX, p1.y - offsetY);
            let p2t = new Vec2(p2.x - offsetX, p2.y + offsetY);
            let p2b = new Vec2(p2.x + offsetX, p2.y - offsetY);
            let p1c = new Vec2();
            let p2c = new Vec2();
            let height = Math.round(width * slopeRate);
            if (p2.y > p1.y) {
                if (p1b.x < p2t.x) {
                    p1c.x = p1b.x;
                    p1c.y = p1b.y + height;
                    p2c.x = p2t.x;
                    p2c.y = p2t.y - height;
                    this._drawVerticalTriangle(p1c, p1b, p1t);
                    this._drawParallelogram(p1b, p2c, height);
                    this._drawVerticalTriangle(p2t, p2c, p2b);
                 } else {
                    p1c.x = p1b.x;
                    p1c.y = Math.round(p2t.y - (p1c.x - p2t.x) * inverseK);
                    p2c.x = p2t.x;
                    p2c.y = Math.round(p1b.y + (p1b.x - p2c.x) * inverseK);
                    this._drawVerticalTriangle(p2t, p2c, p1t);
                    this._drawParallelogram(p2c, p1b, p2t.y - p2c.y);
                    this._drawVerticalTriangle(p1c, p1b, p2b);
                }
            } else {
                if (p1t.x < p2b.x) {
                    p1c.x = p1t.x;
                    p1c.y = p1t.y - height;
                    p2c.x = p2b.x;
                    p2c.y = p2b.y + height;
                    this._drawVerticalTriangle(p1t, p1c, p1b);
                    this._drawParallelogram(p1c, p2b, height);
                    this._drawVerticalTriangle(p2c, p2b, p2t);
                } else {
                    p1c.x = p1t.x;
                    p1c.y = Math.round(p2b.y - (p1c.x - p2b.x) * inverseK);
                    p2c.x = p2b.x;
                    p2c.y = Math.round(p1t.y + (p1t.x - p2c.x) * inverseK);
                    this._drawVerticalTriangle(p2c, p2b, p1b);
                    this._drawParallelogram(p2b, p1c, p1t.y - p1c.y);
                    this._drawVerticalTriangle(p1t, p1c, p2t);
                }
            }

        }
    }

    //#endregion
    //#region 绘制：矩形
    /**
     * 绘制矩形
     * @param x     矩形左下角的坐标X
     * @param y     矩形左下角的坐标Y
     * @param w     矩形宽度
     * @param h     矩形高度
     */
    public rect(x: number, y: number, w: number, h: number) {
        x = Math.round(x);
        y = Math.round(y);
        this._drawRect(new Vec2(x, y), w, h);
    }

    /**
     * 绘制矩形
     * @param p         矩形左下顶点的坐标
     * @param w         矩形宽度
     * @param h         矩形高度
     * @param color     矩形填充的颜色
     */
    private _drawRect(p: Vec2, w: number, h: number) {
        let minX = this.clampX(p.x);
        let maxX = this.clampX(p.x + w);
        let minY = this.clampY(p.y);
        let maxY = this.clampY(p.y + h);
        for (let x = minX; x <= maxX; ++x) {
            for (let y = minY; y <= maxY; ++y) {
                this._drawPixel(x, y);
            }
        }
        for (let y = minY; y <= maxY; ++y) {
            this._drawRowPixel(minX, maxX, y);
        }
    }

    /**
     * 绘制平行四边形，平行四边形的左右两边与Y轴平行
     * @param p1        左下顶点坐标
     * @param p2        右下顶点坐标
     * @param height    垂直边高度
     * @param color     颜色
     */
    private _drawParallelogram(p1: Vec2, p2: Vec2, height: number) {
        if (p1.x == p2.x) return;
        let k = (p2.y - p1.y) / (p2.x - p1.x);
        let minX = this._minX(p1.x);
        let maxX = this._maxX(p2.x);
        for (let x = minX; x <= maxX; ++x) {
        let minY = p1.y + Math.round((x - p1.x) * k);
        let maxY = minY + height;
        minY = this._minY(minY);
        maxY = this._maxY(maxY);
        this._drawColPixel(minY, maxY, x);
            for (let y = minY; y <= maxY; ++y) {
                this._drawPixel(x, y);
            }
        }
    }

    //#endregion
    //#region 绘制：三角形
    /**
     * 绘制三角形
     * @param x1    顶点1坐标X
     * @param y1    顶点1坐标Y
     * @param x2    顶点2坐标X
     * @param y2    顶点2坐标Y
     * @param x3    顶点3坐标X
     * @param y3    顶点3坐标Y
     */
    public triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);
        x3 = Math.round(x3);
        y3 = Math.round(y3);
        let pList: Vec2[] = [];
        pList.push(new Vec2(x1, y1));
        pList.push(new Vec2(x2, y2));
        pList.push(new Vec2(x3, y3));
        this._drawTriangle(pList);
    }

    /**
     * 绘制任意三角形
     * @param p1    顶点坐标
     * @param p2 
     * @param p3 
     * @param color 填充颜色
     */
    private _drawTriangle(pList: Vec2[]) {
        pList.sort((a, b) => {
            return a.x - b.x;
        });
        let p1 = pList[0];
        let p2 = pList[1];
        let p3 = pList[2];
        if (p1.x == p2.x) {
            if (p1.x == p3.x) return;
            if (p1.y < p2.y) {
                p1 = pList[1];
                p2 = pList[0];
            }
            this._drawVerticalTriangle(p1, p2, p3);
            return;
        }
        let k = (p3.y - p1.y) / (p3.x - p1.x);
        let p4 = new Vec2(p2.x, Math.round(p1.y + (p2.x - p1.x) * k));
        if (p4.y == p2.y) return;
        if (p4.y < p2.y) {
            this._drawVerticalTriangle(p2, p4, p1);
            this._drawVerticalTriangle(p2, p4, p3);
        } else {
            this._drawVerticalTriangle(p4, p2, p1);
            this._drawVerticalTriangle(p4, p2, p3);
        }
    }

    /**
     * 绘制一条边与Y轴平行的三角形
     * @param p1    三角形垂直边的 上 顶点坐标
     * @param p2    三角形垂直边的 下 顶点坐标
     * @param p3    三角形 左侧或右侧 顶点坐标
     * @param color 要绘制的颜色
     */
    private _drawVerticalTriangle(p1: Vec2, p2: Vec2, p3: Vec2) {
        if (p3.x == p1.x) return;
        let k1 = (p3.y - p1.y) / (p3.x - p1.x);
        let k2 = (p3.y - p2.y) / (p3.x - p2.x);
        let maxX = p3.x, minX = p1.x;
        if (maxX < minX) {
            maxX = p1.x;
            minX = p3.x;
        }
        minX = this._minX(minX);
        maxX = this._maxX(maxX);
        for (let x = minX; x <= maxX; ++x) {
            let maxY = this.clampY(Math.round(p1.y + (x - p1.x) * k1));
            let minY = this.clampY(Math.round(p2.y + (x - p2.x) * k2));
            this._drawColPixel(minY, maxY, x);
            for (let y = minY; y <= maxY; ++y) {
                this._drawPixel(x, y);
            }
        }
    }

    //#endregion
    //#region 绘制：圆
    /**
    * 绘制一个圆
    * @param x         圆心坐标x
    * @param y         圆心坐标y
    * @param radius    圆的半径
    */
    public circle(x: number, y: number, radius: number) {
        x = Math.round(x);
        y = Math.round(y);
        this._drawCircle(x, y, radius);
    }

    private _drawCircle(x: number, y: number, radius: number) {
        radius = Math.round(radius);
        if (radius == 0) return;
        // 三角形的斜边的平方
        let dis = radius * radius;
        let minX = this._minX(x - radius);
        let maxX = this._maxX(x + radius);
        for (let i = minX; i <= maxX; ++i) {
            let r = x - i;
            r = Math.round(Math.sqrt(dis - r * r));
            let minY = this._minY(y - r);
            let maxY = this._maxY(y + r);
            for (let j = minY; j <= maxY; ++j) {
                this._drawPixel(i, j);
            }
        }
        let minY = this.clampY(y - radius);
        let maxY = this.clampY(y + radius);
        for (let j = minY; j <= maxY; ++j) {
            let r = j - y;
            r = Math.round(Math.sqrt(dis - r * r));
            let minX = this.clampX(x - r);
            let maxX = this.clampX(x + r);
            this._drawRowPixel(minX, maxX, j);
        }
    }

    //#endregion
    //#region 内部绘制方法
    private _minX(x: number): number {
        return x >= 0 ? x : 0;
    }

    private _maxX(x: number): number {
        return x < this.width ? x : this.width - 1;
    }

    private _minY(y: number): number {
        return y >= 0 ? y : 0;
    }

    private _maxY(y: number): number {
        return y < this.height ? y : this.height - 1;
    }

    private clampX(x: number): number {
        if (x < 0) return 0;
        if (x >= this.width) return this.width - 1;
        return x;
    }

    private clampY(y: number): number {
        if (y < 0) return 0;
        if (y >= this.height) return this.height - 1;
        return y;
    }

    /**绘制一个像素点的颜色 */
    private _drawPixel(x: number, y: number) {
        x = Math.round(x);
        y = Math.round(y);
        if (this.maskPoint[x][y] == 0) return;
        if (this.pointColor[x][y] == this.tempColor) return;
        let index = (y * this.width + x) * 4;
        this.pixelColor[index] = this.tempR;
        this.pixelColor[index + 1] = this.tempG;
        this.pixelColor[index + 2] = this.tempB;
        this.pixelColor[index + 3] = this.tempA;
        let c = this.pointColor[x][y];
        this.colorCount[c]--;
        this.colorCount[this.tempColor]++;
        this.pointColor[x][y] = this.tempColor;
    }

    /**
     * 连续绘制一行中的像素点
     * @param startX    起点X坐标
     * @param endX      终点X坐标
     * @param y         Y坐标
     */
    private _drawRowPixel(startX: number, endX: number, y: number) {
        let index = (y * this.width + startX) * 4;
        for (let x = startX; x <= endX; ++x) {
            if (this.maskPoint[x][y] != 0 && this.pointColor[x][y] != this.tempColor) {
                this.pixelColor[index] = this.tempR;
                this.pixelColor[index + 1] = this.tempG;
                this.pixelColor[index + 2] = this.tempB;
                this.pixelColor[index + 3] = this.tempA;
                let c = this.pointColor[x][y];
                this.colorCount[c]--;
                this.colorCount[this.tempColor]++;
                this.pointColor[x][y] = this.tempColor;
            }
            index += 4;
        }
    }

    /**
     * 连续绘制一列中的像素点
     * @param startY    起点Y坐标
     * @param endY      终点Y坐标
     * @param x         X坐标
     */
    private _drawColPixel(startY: number, endY: number, x: number) {
        let index = (startY * this.width + x) * 4;
        for (let y = startY; y <= endY; ++y) {
            if (this.maskPoint[x][y] != 0 && this.pointColor[x][y] != this.tempColor) {
                this.pixelColor[index] = this.tempR;
                this.pixelColor[index + 1] = this.tempG;
                this.pixelColor[index + 2] = this.tempB;
                this.pixelColor[index + 3] = this.tempA;
                let c = this.pointColor[x][y];
                this.colorCount[c]--;
                this.colorCount[this.tempColor]++;
                this.pointColor[x][y] = this.tempColor;
            }
            index += this.width * 4;
        }
    }

    /**
     * 将RGBA颜色分量转换为一个数值表示的颜色，颜色分量为0~255之间的值
     * @param r 
     * @param g 
     * @param b 
     * @param a 
     */
    private convertToNumber(r: number, g: number, b: number, a: number = 255): number {
        // 颜色值将用于数组索引，不能为负数，故红色分量为奇数时将减1变为偶数
        return ((r & 0xfe) << 23) | (g << 16) | (b << 8) | a;
    }
    
    /**将十六进制的颜色转换为RGBA分量表示的颜色 */
    private convertToRGBA(color: number): { r: number, g: number, b: number, a: number } {
        // 颜色值将用于数组索引，不能为负数，故红色分量为奇数时将减1变为偶数
        return {
            r: (color & 0xef000000) >> 23,
            g: (color & 0x00ff0000) >> 16,
            b: (color & 0x0000ff00) >> 8,
            a: (color & 0x000000ff),
        };
    }
    //#endregion
}
