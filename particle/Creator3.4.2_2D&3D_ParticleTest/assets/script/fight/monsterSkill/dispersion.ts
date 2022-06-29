import { _decorator, Component, Node, Vec3, RigidBodyComponent, Game } from 'cc';
import { AudioManager } from '../../framework/audioManager';
import { constant } from '../../framework/constant';
import { EffectManager } from '../../framework/effectManager';
import { poolManager } from '../../framework/poolManager';
import { util } from '../../framework/util';
import { GameManager } from '../gameManager';
const { ccclass, property } = _decorator;
//180度散射球组件: 挂载每个球上, 不是挂在父节点上
@ccclass('Dispersion')
export class Dispersion extends Component {
    public baseInfo: any = null!;//敌人基本信息
    public skillInfo: any = null!;//技能信息

    private _curSpeed: number = 0;//当前速度
    private _targetSpeed: number = 0;//目标速度
    private _oriPos: Vec3 = null!;//初始默认位置
    private _oriEulerAngles: Vec3 = null!//初始默认角度
    private _offsetPos: Vec3 = new Vec3();//和玩家之间的向量差
    private _curWorPos: Vec3 = new Vec3();//当前节点世界坐标
    private _disappearRange: number = 20;//箭节点超过玩家这个范围则隐藏
    private _targetWorPos: Vec3 = new Vec3();//箭的下次目标位置
    private _oriScale: Vec3 = new Vec3();//初始缩放大小

    start () {
        // [3]
    }

    /**
    * 初始化 
    */
     public init (skillInfo: any, baseInfo: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        this.node.active = true;

        if (!this._oriPos) {
            this._oriPos = this.node.position.clone();
        }

        if (!this._oriEulerAngles) {
            this._oriEulerAngles = this.node.eulerAngles.clone();
        }
        
        this.node.setPosition(this._oriPos);
        this.node.eulerAngles.set(this._oriEulerAngles);

        this._targetSpeed = skillInfo.flySpeed;
        this._curSpeed = skillInfo.flySpeed * 0.5;

        EffectManager.instance.playTrail(this.node);

        AudioManager.instance.playSound(constant.SOUND.ENERGY_BALL);  
    }

    /**
     * 击中玩家后隐藏
     *
     * @memberof Arrow
     */
    public hide () {
        if (!this.node.parent) {
            return;
        }

       this.node.active = false;

       //如果dispersionSurround组里所有的球都隐藏了则回收整个dispersion预制体
       let isAllHide = this.node.parent?.children.every((ndChild: Node)=>{
           return ndChild.active === false;
       })

       if (isAllHide && this.node.parent) {
           poolManager.instance.putNode(this.node.parent);
       }
    }

    update (deltaTime: number) {
        if (!this.node.parent || !GameManager.ndPlayer || GameManager.isGameOver || GameManager.isGamePause) {
            return;
        }

        //朝forward方向飞行
        this._curSpeed = util.lerp(this._targetSpeed, this._curSpeed, 0.25);
        this._targetWorPos.set(0, 0, -deltaTime * this._curSpeed);
        this.node.translate(this._targetWorPos, Node.NodeSpace.LOCAL);

        //超过玩家一定范围则隐藏
        this._curWorPos.set(this.node.worldPosition);
        Vec3.subtract(this._offsetPos, this._curWorPos, GameManager.ndPlayer.worldPosition);
        if (this._offsetPos && this._offsetPos.length() >= this._disappearRange) {
            this.hide();
        }
    }
}