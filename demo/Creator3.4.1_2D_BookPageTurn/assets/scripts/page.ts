import { _decorator, Component } from 'cc';
const {ccclass, property} = _decorator;

import BezierRender from "./bezier-render";
import VerletRender from "./verlet-render";

@ccclass('Page')
export default class Page extends Component {
    @property({type: BezierRender, displayName:"贝塞尔曲线"})
    public bezierRender: BezierRender = null
    @property({type: VerletRender, displayName:"Verlet积分算法"})
    public verletRender: VerletRender = null
    private _angle: number = 0
    private _rightToLeft = true
    private _waitTime = 0
    start () {
    }
    update(dt: number) {
        let anglePerDt = 180
        if(this._rightToLeft) {
        this._angle += dt * anglePerDt
        if(this._angle > 180) {
        this._angle = 180
        if(this._waitTime++ > 100) {
        this._rightToLeft = false
        this._waitTime = 0
        }
        }
        } else {
        this._angle -= dt * anglePerDt
        if(this._angle < 0) {
        this._angle = 0
        if(this._waitTime++ > 100) {
        this._rightToLeft = true
        this._waitTime = 0
        }
        }
        }

        this.bezierRender.updateAngle(this._angle)
        this.verletRender.updateAngle(this._angle)
    }
}
