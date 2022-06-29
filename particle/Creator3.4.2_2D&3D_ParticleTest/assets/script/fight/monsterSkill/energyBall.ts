import { util } from './../../framework/util';
import { GameManager } from './../gameManager';
import { _decorator, Component, Node, Vec3 } from 'cc';
import { poolManager } from '../../framework/poolManager';
import { EffectManager } from '../../framework/effectManager';
import { AudioManager } from '../../framework/audioManager';
import { constant } from '../../framework/constant';
//能量球组件: 直线飞行
const { ccclass, property } = _decorator;

@ccclass('EnergyBall')
export class EnergyBall extends Component {
    public baseInfo: any = null!;//敌人基本信息
    public skillInfo: any = null!;//技能信息

    private _curSpeed: number = 0;//当前速度
    private _targetSpeed: number = 0;//目标速度
    private _offsetPos: Vec3 = new Vec3();//和玩家之间的向量差
    private _curWorPos: Vec3 = new Vec3();//当前节点世界坐标
    private _disappearRange: number = 25;//能量球节点超过玩家这个范围则隐藏
    private _targetWorPos: Vec3 = new Vec3();//能量球的下次目标位置

    start () {
        // [3]
    }

    /**
    * 初始化 
    */
    public init (skillInfo: any, baseInfo: any, scriptParent: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        scriptParent.scriptWarning?.hideWarning();
        this._targetSpeed = skillInfo.flySpeed;;
        this._curSpeed = skillInfo.flySpeed * 0.5;

        EffectManager.instance.playTrail(this.node);

        AudioManager.instance.playSound(constant.SOUND.ENERGY_BALL);  
    }

    update (deltaTime: number) {
        if (!this.node.parent || !GameManager.ndPlayer || GameManager.isGameOver || GameManager.isGamePause) {
            return;
        }

        //朝forward方向飞行
        this._curSpeed = util.lerp(this._targetSpeed, this._curSpeed, 0.25);
        this._targetWorPos.set(0, 0, -deltaTime * this._curSpeed);
        this.node.translate(this._targetWorPos, Node.NodeSpace.LOCAL);
        this._curWorPos.set(this.node.worldPosition);

        //超过玩家一定范围则隐藏
        Vec3.subtract(this._offsetPos, this._curWorPos, GameManager.ndPlayer.worldPosition);
        if (this._offsetPos && this._offsetPos.length() >= this._disappearRange) {
            poolManager.instance.putNode(this.node);
        }
    }
}