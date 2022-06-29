import { GameManager } from './../gameManager';
import { _decorator, Component, Node, tween, Vec3, Color, MeshRenderer, Material } from 'cc';
import { poolManager } from '../../framework/poolManager';
const { ccclass, property } = _decorator;

@ccclass('WarningCircle')
export class WarningCircle extends Component {
    private _tweenLoop: any = null!;//循环缩小放大tween实例
    private _tweenHide: any = null!;//缩小消失tween实例
    private _targetWorPos: Vec3 = new Vec3();
    private _targetScale_1: Vec3 = new Vec3();
    private _targetScale_2: Vec3 = new Vec3();
    private _targetScale_3: Vec3 = new Vec3();
    private _scriptParent: any = null!;

    start () {
        // [3]
    }

    public init (scale: number, scriptParent: any) {
        scriptParent.recycleWarning();
        this._scriptParent = scriptParent;
        this._targetScale_1.set(scale, scale, scale);
        this._targetScale_2.set(scale * 0.8, scale * 0.8, scale * 0.8);
        this.node.setScale(this._targetScale_3);

        let playerWorPos = GameManager.ndPlayer.worldPosition;
        this._targetWorPos.set(playerWorPos.x, playerWorPos.y + 0.2, playerWorPos.z);
        this.node.setWorldPosition(this._targetWorPos);
        
        this._closeTween();
        this.showWarning();
    }

    public showWarning () {
        let showTime = 0.4;

        this._tweenLoop = tween(this.node)
        .to(showTime, {scale: this._targetScale_1}, {easing: "smooth"})
        .start();        
    }

    public hideWarning () {
        this._closeTween();

        this._tweenHide = tween(this.node)
        .to(0.3, {scale: this._targetScale_3}, {easing: "backInOut"})
        .call(()=>{
            poolManager.instance.putNode(this.node);
            this._closeTween();
        })
        .start();           
    }

    private _closeTween() {
        if (this._tweenHide) {
            this._tweenHide.stop();
            this._tweenHide = null!;
        }

        if (this._tweenLoop) {
            this._tweenLoop.stop();
            this._tweenLoop = null!;
        }
    }
}