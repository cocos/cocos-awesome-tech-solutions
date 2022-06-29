import { poolManager } from './../../framework/poolManager';
import { constant } from './../../framework/constant';
import { LabelComponent, tween, Vec3, UITransformComponent, view, _decorator, Component, Node, find  } from 'cc';
import { util } from '../../framework/util';
import { GameManager } from '../../fight/gameManager';
//战斗血量增减提示组件
const { ccclass, property } = _decorator;

@ccclass('FightTip')
export class FightTip extends Component {

    private _tweenTip: any = null;//tween实例
    private _costTime: number = 1.5;//缓动所需时间
    private _arrDirection: any = util.objectToArray(constant.BLOOD_TIP_DIRECTION);//三个不同方向
    private _isChangePos: boolean = false;//是否改变位置
    private _targetPos: Vec3 = new Vec3(0, 200, 0);//目标位置
    private _oriWorPos: Vec3 = new Vec3();//初始位置
    private _curWorPos: Vec3  = new Vec3();//当前位置
    private _oriScale: Vec3 = new Vec3(0.7, 0.7, 0.7);//初始缩放
    private _oriAngle: Vec3 = new Vec3();//初始角度
    private _scale_1: Vec3 = new Vec3(1, 1, 1);//最开始缩放
    private _scale_2: Vec3 = new Vec3();//最终缩放

    start () {
        // Your initialization goes here.
    }

    /**
     * 展示血量提示
     *
     * @param {*} scriptParent 关联的血条脚本
     * @param {number} tipType 提示类型
     * @param {string} bloodNum 数值
     * @param {Function} [callback] 回调函数
     * @memberof FightTip
     */
    public show (scriptParent: any, tipType: number, bloodNum: number, callback?: Function) {
        this._closeTweenTip();
        this.node.eulerAngles = this._oriAngle;
        this.node.setScale(this._oriScale);
        
        this._isChangePos = false;

        this._oriWorPos.set(scriptParent.node.worldPosition);

        let arrChildren = this.node.children;
        arrChildren.forEach((item)=>{
            item.active = false;
        })


        // let UICom = this.node.getComponent(UITransformComponent) as UITransformComponent;
        // UICom.priority = constant.PRIORITY.BLOOD_TIP;
        
        this.node.setSiblingIndex(constant.PRIORITY.BLOOD_TIP);

        bloodNum = Math.round(bloodNum);

        let lbHitNum;
        let ndSub: Node = null!;
        if (tipType === constant.FIGHT_TIP.ADD_BLOOD) {
            ndSub = this.node.getChildByName("addBlood") as Node;
        } else if (tipType === constant.FIGHT_TIP.REDUCE_BLOOD) {
            ndSub = this.node.getChildByName("reduceBlood") as Node;
        } else if (tipType === constant.FIGHT_TIP.CRITICAL_HIT) {
            ndSub = this.node.getChildByName("criticalHit") as Node;
            // UICom.priority = constant.PRIORITY.BLOOD_CRITICAL_TIP;
            this.node.setSiblingIndex(constant.PRIORITY.BLOOD_CRITICAL_TIP);
        }

        lbHitNum = ndSub.getChildByName('num')?.getComponent(LabelComponent);
        lbHitNum && (lbHitNum.string = String(bloodNum));

        ndSub.active = true;

        let pos = this.node.getPosition();
        let width:number = ndSub.getComponent(UITransformComponent)?.width!;
        let height:number = ndSub.getComponent(UITransformComponent)?.height!;
        if ((Math.abs(pos.x) + width / 2) > view.getCanvasSize().width / 2) {
            let w = view.getCanvasSize().width / 2 - width / 2;
            pos.x = pos.x > 0 ? w : -w;
        }

        if ((Math.abs(pos.y) + height / 2) > view.getCanvasSize().height / 2) {
            let h = view.getCanvasSize().height / 2 - height / 2;
            pos.y = pos.y > 0 ? h : -h;
        }
        this.node.setPosition(pos);

        this.getTargetPos(scriptParent);

        this._isChangePos = true;

        this._tweenTip = tween(this.node)
        .to(this._costTime * 0.4, {scale: this._scale_1}, {easing: 'smooth'})
        .to(this._costTime * 0.2, {scale: this._scale_2}, {easing: "backIn"})
        .call(()=>{
            this._closeTweenTip();
            poolManager.instance.putNode(this.node);
            callback && callback();
            this._isChangePos = false;
        })
        .start();
    }

    /**
     * 获取跟上次血量提示不一样方向的提示
     */
    private getTargetPos (scriptParent: any) {
        let dir: number;
        let arr = this._arrDirection.concat();
        
        arr = arr.filter((item: any)=>{
            return item !== scriptParent.bloodTipDirection;
        });

        dir = arr[Math.floor(Math.random() * arr.length)];
        switch (dir) {
            case constant.BLOOD_TIP_DIRECTION.LEFT_UP:
                this._targetPos.set(-2, 5, 0);
                break;
            case constant.BLOOD_TIP_DIRECTION.MID_UP:
                this._targetPos.set(0, 4, 0);
                break;
            case constant.BLOOD_TIP_DIRECTION.RIGHT_UP:
                this._targetPos.set(2, 2, 0);
                break;
            default:
                break;
        }
        
        this._targetPos.add(scriptParent.node.worldPosition.clone());

        scriptParent.bloodTipDirection = dir;
    }

    private _closeTweenTip () {
        if (this._tweenTip) {
            this._tweenTip.stop();
            this._tweenTip = null;  
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.

        if (this._isChangePos) {
            this._oriWorPos.lerp(this._targetPos, 0.05);
            GameManager.mainCamera?.convertToUINode(this._oriWorPos, find('Canvas') as Node, this._curWorPos);

            this.node.setPosition(this._curWorPos);
        }
    }

}
