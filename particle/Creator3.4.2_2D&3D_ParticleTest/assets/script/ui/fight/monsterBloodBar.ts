import { constant } from './../../framework/constant';
import { _decorator, Component, UITransformComponent, tween, clamp, Vec3, Node, find } from 'cc';
import { GameManager } from '../../fight/gameManager';
import { poolManager } from '../../framework/poolManager';

//boss和小怪血条组件

const { ccclass, property } = _decorator;
@ccclass('MonsterBloodBar')
export class MonsterBloodBar extends Component {
    @property(UITransformComponent)
    public UIComWhiteBar: UITransformComponent = null!;//白色进度条的UI组件

    @property(UITransformComponent)
    public UIComRedBar: UITransformComponent = null!;//血量进度条的UI组件

    @property(UITransformComponent)
    public UIComBloodBar: UITransformComponent = null!;//血量容器的UI组件

    private _whiteBarHeight: number = 19;//白色进度条高度
    private _redBarHeight: number = 19;//血量进度条高度
    private _totalBlood: number = 0;//总的血量
    private _curBlood: number = 0;//当前血量值
    private _scriptParent: any = null!;//血条所在节点绑定的脚本
    private _maxWhiteBarWidth: number = 104;//当前小怪血条中白色进度条长度
    private _maxRedBarWidth: number = 104;//当前小怪血条中血量条长度
    private _ndTarget: Node = null!;//跟随目标
    private _offsetPos: Vec3 = null!;//偏差
    private _curPos: Vec3 = new Vec3()!;//当前血条位置
    private _isBloodEmpty: boolean = false;//血条是否为空
    private _isStopMove: boolean = false;//是否停止移动
    private _prevBloodPos: Vec3 = new Vec3();//血量为空前的血条位置

    start () {
        // [3]
    }

/**
 * 展示血条
 *
 * @param {*} scriptParent 
 * @param {number} totalBlood
 * @param {Vec3} offsetPos
 * @param {Vec3} scale
 * @param {(Function | null)} [callback]
 * @param {boolean} [isInit=true]
 * @memberof MonsterBloodBar
 */
public show (scriptParent: any, totalBlood: number, offsetPos: Vec3, scale: Vec3, callback?: Function | null, isInit: boolean = true) {
        this._scriptParent = scriptParent;
        this._totalBlood = totalBlood * GameManager.hpAddition;
        this._offsetPos = offsetPos;
        this._ndTarget = scriptParent.node;
        this._isBloodEmpty = false;

        this._prevBloodPos.set(this._ndTarget.worldPosition);

        if (isInit) {
            this._curBlood = this._totalBlood;
        }

        //当前血量占全部的比例
        let ratio = this._curBlood / this._totalBlood;
        ratio = clamp(ratio, 0, 1);

        //进度条宽度设置
        this.UIComWhiteBar.setContentSize(ratio * this._maxWhiteBarWidth, this._whiteBarHeight);
        this.UIComRedBar.setContentSize(ratio * this._maxRedBarWidth, this._redBarHeight);

        // this.UIComBloodBar.priority = constant.PRIORITY.BLOOD;
        this.node.setSiblingIndex(constant.PRIORITY.BLOOD);

        callback && callback();
    }

    /**
     * 刷新血量
     *
     * @param {number} num 血量值
     * @memberof MonsterBloodBar
     */
    public refreshBlood (num: number) {
        this._curBlood += num;

        let ratio = this._curBlood / this._totalBlood;

        if (num < 0) {//减血
            ratio = ratio <= 0 ? 0 : ratio;
    
            this.UIComRedBar.setContentSize(this._maxRedBarWidth * ratio, this._redBarHeight);

            if (!this._isBloodEmpty) {
                this._isBloodEmpty = ratio <= 0;

                tween(this.UIComWhiteBar)
                .to(0.7, {width: this._maxWhiteBarWidth * ratio})
                .call(()=>{
                    if (this._isBloodEmpty) {
                        poolManager.instance.putNode(this.node);
                    }
                })
                .start();

                if (this._isBloodEmpty) {
                    this._scriptParent.isDie = true;
                }
            } else {
                poolManager.instance.putNode(this.node);
                this._scriptParent.isDie = true;
            }
        } 
    }

    update () {
        if (this.node.parent && this.node.active && this._ndTarget && this._ndTarget.parent) {
            let worPos = this._ndTarget.worldPosition;
            if (this._isBloodEmpty) {
                worPos = this._prevBloodPos;
            } else {
                this._prevBloodPos.set(worPos);
            }

            GameManager.mainCamera?.convertToUINode(worPos, find("Canvas") as Node, this._curPos);
            this._curPos.add(this._offsetPos);
            this.node.setPosition(this._curPos);
        }
    }
}
