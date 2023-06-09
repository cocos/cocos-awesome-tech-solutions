/**
 * 画板扩展：
 * 存储UV和顶点数据
 */
import { _decorator, Component, Node, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DrawingBoardExt')
export default class DrawingBoardExt {
    /**
     * 画板宽度
     */
    private _witdh: number;
    public get width(): number { return this._witdh; }
    /**
     * 画板高度
     */
    private _height: number;
    public get height(): number { return this._height; }
    // UV数据集合
    private uvDatas: Vec2[][] = [];
    // UV数据集合临时
    private uvs: Vec2[] = [];
    // 记录上一次坐标
    private _lastPos: Vec2 = new Vec2();

    public constructor (width: number, height: number) {
        this.init(width, height);
    }

    public init (width: number, height: number) {
        this._witdh = Math.round(width);
        this._height = Math.round(height);
    }

    /**
     * 通过位置设置UV数据
     * @param x X坐标
     * @param y Y坐标
     */
    public setUVDataByPos (x: number, y: number) {
        let diffX = Math.abs(this._lastPos.x - x);
        let diffY = Math.abs(this._lastPos.y - y);

        if ((diffX <= 1) && (diffY <= 1)) {
            console.log("点与点之间误差太小，不记录");
            return ;
        }
        
        this._lastPos.set(x, y);

        let x1 = (x - this._witdh / 2);
        let y1 = (this._height / 2 - y);
        let xoffset = x1 / this._witdh;
        let yoffset = y1 / this._height;
        this.uvs.push(new Vec2(xoffset, yoffset));
    }

    public recordUVData () {
        this.uvDatas = this.uvDatas.concat(this.uvs);
        console.log(this.uvDatas);
        this.uvs = [];
    }
}
