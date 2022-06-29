import { poolManager } from './../../framework/poolManager';
import { GameManager } from './../gameManager';
import { _decorator, Component, Vec3, profiler, Node, AnimationComponent } from 'cc';
import { EffectManager } from '../../framework/effectManager';
import { util } from '../../framework/util';
import { constant } from '../../framework/constant';
import { AudioManager } from '../../framework/audioManager';
const { ccclass, property } = _decorator;
//台风S型组件
@ccclass('Tornado')
export class Tornado extends Component {
    @property(AnimationComponent)
    public aniMove: AnimationComponent = null!;

    public skillInfo: any = null!;//技能信息
    public baseInfo: any = null!;//基础信息

    private _offsetPos: Vec3 = new Vec3();//当前坐标和玩家坐标的向量差
    private _oriWorPos: Vec3 = new Vec3();//初始位置
    private _targetSpeed: number = 0;//目标速度
    private _curSpeed: number = 0;//当前速度
    private _targetWorPos: Vec3 = new Vec3();//目标位置
    private _curWorPos: Vec3 = new Vec3();//当前位置
    private _disappearRange: number = 25;//箭节点超过玩家这个范围则隐藏

    start () {
        // [3]
    }

    public init (skillInfo: any, baseInfo: any, scriptParent?: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        scriptParent?.scriptWarning?.hideWarning();
        this._oriWorPos.set(this.node.worldPosition);
        this._curWorPos.set(this.node.worldPosition);
        Vec3.subtract(this._offsetPos, this._curWorPos, GameManager.ndPlayer.worldPosition);
        this._offsetPos.normalize().negative();
        Vec3.add(this._curWorPos, this._curWorPos, this._offsetPos.multiplyScalar(2));
        this.node.setWorldPosition(this._curWorPos);

        EffectManager.instance.playTrail(this.node);
        this._targetSpeed = skillInfo.flySpeed;
        this._curSpeed = this._targetSpeed * 0.5;

        this.aniMove.getState("tornado").time = 0;
        this.aniMove.getState("tornado").sample();
        this.aniMove.play();

        AudioManager.instance.playSound(constant.SOUND.TORNADO);  

    }

    update (deltaTime: number) {
        if (GameManager.ndPlayer) {
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
}