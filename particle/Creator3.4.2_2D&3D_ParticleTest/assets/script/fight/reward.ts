import { EffectManager } from './../framework/effectManager';
import { util } from './../framework/util';
import { poolManager } from './../framework/poolManager';
import { constant } from './../framework/constant';
import { _decorator, Component, Node, Vec3, RigidBodyComponent, Quat, ParticleSystemComponent, clamp, Details, tween, Enum, Game } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { GameManager } from './gameManager';
import { resourceUtil } from '../framework/resourceUtil';
import { AudioManager } from '../framework/audioManager';
//奖品(奖励)组件：金币和爱心

//奖励类型
const REWARD_TYPE = Enum ({
    GOLD: 1,//金币
    HEART: 2,//爱心
})
const { ccclass, property } = _decorator;
@ccclass('Reward')
export class Reward extends Component {
    @property({
        type: REWARD_TYPE,
        displayOrder: 1
    })
    public rewardType: any = REWARD_TYPE.GOLD;
    public isDropOver: boolean = false;//是否已经落在地上

    private _trialScale = new Vec3(3, 3, 3);//拖尾缩放
    private _trialPos: Vec3 = new Vec3(0, -0.1, 0);//拖尾位置
    private _tweenBounce: any = null!;//tween
    private _curQuat: Quat = new Quat();//旋转
    private _isAutoRotate: boolean = false;//是否自动旋转
    private _isInhaling: boolean = false;//是否正在吸入中
    private _oriScale: Vec3 = null!;//原始缩放大小
    private _ndParent: Node = null!;//父亲节点
    private _ndTrial: Node = null!;//拖尾节点
    private _endTargetPos:Vec3 = new Vec3();//最终目标位置
    private _midTargetPos: Vec3 = new Vec3();//中间位置
    private _stepTargetPos: Vec3 = new Vec3();//下一次的位置
    private _upSpeedY: number = 0.2;//上升最大速度
    private _downSpeedY: number = 0.2;//下降最大速度
    private _curSpeedY: number = 0;//当前速度
    private _oriWorPos: Vec3 = new Vec3();//初始奖品世界坐标
    private _isArriveMinPos: boolean = false;//已经到达中间位置
    private _rewardWorPos: Vec3 = new Vec3();//当前奖品世界坐标
    private _playerWorPos: Vec3 = new Vec3();//目标(主角)位置
    private _nextWorPos: Vec3 = new Vec3();//下一个位置
    private _offsetPos: Vec3 = new Vec3();//奖品和玩家之间的向量差
    private _targetWorPos: Vec3 = new Vec3();//
    private _totalFlyTime: number = 0;//奖品总飞行时间
    private _curFlyTime: number = 0;//奖品当前飞行时间
    private _raiseTimes: number = 1;//
    private _bouncePos: Vec3 = new Vec3(0, 0.618, 0);//回收缓动高度
    private _bounceScale: Vec3 = new Vec3(0.2, 0.2, 0.2);//回收缓动缩放

    onEnable () {
        clientEvent.on(constant.EVENT_TYPE.INHALE_REWARD, this._inhaleReward, this);
    }

    onDisable () {
        clientEvent.off(constant.EVENT_TYPE.INHALE_REWARD, this._inhaleReward, this);
    }

    start () {
      
    }

    init (time: number, ndParent: Node) {
        this._ndParent = ndParent;

        if (this._oriScale) {
            this.node.setScale(this._oriScale);
        } else {
            this._oriScale = this.node.getScale();
        }

        this._isAutoRotate = false;
        this._isInhaling = false;
        this._curSpeedY = this._upSpeedY;
        this._oriWorPos.set(this.node.getWorldPosition().x, 1.65, this.node.getWorldPosition().z);
        this._isArriveMinPos = false;
        this.isDropOver = false;
        this._totalFlyTime = 0;
        this._curFlyTime = 0;
        this._raiseTimes = 1;

        //依次弹出奖品
        this.scheduleOnce(()=>{
            this.show();
        }, time)

        if (!this._ndTrial) {
            resourceUtil.loadEffectRes("trail/coinTrail").then((pf: any)=>{
                this._ndTrial = poolManager.instance.getNode(pf, this.node);
                this._ndTrial.active = false;    
                this._ndTrial.setScale(this._trialScale);
                this._ndTrial.setPosition(this._trialPos);
            });
        } else {
            this._ndTrial.active = false;
        }
    }

    show () {
        this.node.active = true;
        let x = Math.random() * 6 - 3;//-3~3
        let y = 4;//最高的高度4~4.5;
        let z = Math.random() * 6 - 3;//-3~3
        this._endTargetPos = this._endTargetPos.set(this._oriWorPos).add3f(x, 0, z);
        this._midTargetPos = this._midTargetPos.set(this._oriWorPos).add3f(x/2, y, z/2);

        // console.log("终点位置", this._endTargetPos, "中间位置", this._midTargetPos);

        AudioManager.instance.playSound(constant.SOUND.GOLD_DROP);  
    }

    /**
     * 检查所有怪物是否已经击败，且奖品是否都全部掉落完毕
     *
     * @protected
     * @memberof Reward
     */
    protected _checkMonsterClearOver () {
        let ndTarget = GameManager.getNearestMonster();

        if (!ndTarget) {
            let arrReward = this._ndParent.children.filter((ndChild: Node)=>{
                return ndChild.name === "gold" || ndChild.name === "heart";
            })

            let isAllDropOver = arrReward.every((ndReward: Node) => {
                let scriptReward = ndReward.getComponent(Reward) as Reward;
                return scriptReward.isDropOver === true;
            });

            if (isAllDropOver) {
                console.log("###所有的奖品都已经掉落到地上了");
                clientEvent.dispatchEvent(constant.EVENT_TYPE.INHALE_REWARD);
            }
        }
    }

    /**
     * 玩家吸入奖品
     *
     * @protected
     * @memberof Reward
     */
    protected _inhaleReward () {
        //先弹跳
        this._closeTween();
        this._tweenBounce = tween(this.node)
        .by(0.3, {position: this._bouncePos, scale: this._bounceScale}, {easing: "bounceInOut"})
        .call(()=>{
            //播放粒子特效，不要勾选粒子的prewarm属性，免得出现概率性没有播放拖尾
            this._ndTrial.active = true;
            EffectManager.instance.playTrail(this._ndTrial);
            
            //再吸入
            this._isInhaling = true;
            
        })
        .start()
    }

    protected _closeTween () {
        if (this._tweenBounce) {
            this._tweenBounce.stop();
            this._tweenBounce = null!;
        }
    }

    /**
     *  检查所有奖品是否吸收完毕
     *
     * @protected
     * @memberof Reward
     */
    protected _checkInhaleOver () {
        let arrReward = this._ndParent.children.filter((ndChild: Node)=>{
            return ndChild.name === "gold" || ndChild.name === "heart";
        })

        if (!arrReward.length) {
            console.log("###已吸入全部奖品");
            AudioManager.instance.playSound(constant.SOUND.GOLD_COLLECT);
            clientEvent.dispatchEvent(constant.EVENT_TYPE.SHOW_WARP_GATE);
        }
    }

    update (deltaTime: number) {
        //奖品上下弹跳
        if (!this.isDropOver) {
            this._rewardWorPos.set(this.node.position);
            //先抬高
            if (!this._isArriveMinPos) {
                this._stepTargetPos = this._rewardWorPos.lerp(this._midTargetPos, 0.03);
                this._curSpeedY = util.lerp(this._upSpeedY, this._curSpeedY, 0.03);
                this._nextWorPos = this._nextWorPos.set(this._stepTargetPos).add3f(0, this._curSpeedY, 0);
                this._nextWorPos.y = clamp(this._nextWorPos.y, 0, this._midTargetPos.y);
                this.node.setPosition(this._nextWorPos);
    
                // if (pos.equals(this._midTargetPos, 0.2)) {
                if (this._nextWorPos.y >= this._midTargetPos.y) {
                    this._isArriveMinPos = true;
                    this._curSpeedY = 0;
                    // console.log("到达中间位置");
                }
            } else {//后降落
                this._stepTargetPos = this._rewardWorPos.lerp(this._endTargetPos, 0.02);
                this._curSpeedY = util.lerp(this._downSpeedY, this._curSpeedY, 0.05);
                // console.log("_upSpeedY", this._curSpeedY);
                this._nextWorPos = this._nextWorPos.set(this._stepTargetPos).add3f(0, -this._curSpeedY, 0);
                this._nextWorPos.y = clamp(this._nextWorPos.y, this._endTargetPos.y, this._midTargetPos.y);
                this.node.setPosition(this._nextWorPos);

                if (this._nextWorPos.equals(this._endTargetPos, 0.3)) {
                    this.isDropOver = true;
                    // console.log("到达地板上");
                    this._isAutoRotate = true;
                    this._checkMonsterClearOver();
                }
            }
        }

        //奖品落地后自动旋转
        if (this._isAutoRotate) {
            Quat.fromEuler(this._curQuat, 0, 120 * deltaTime, 0);
            this.node.rotate(this._curQuat);
        }

        //奖品被玩家吸入
        if (this._isInhaling) {
            //位置靠近玩家
            this._playerWorPos.set(GameManager.scriptPlayer.node.worldPosition);
            this._rewardWorPos.set(this.node.worldPosition);
            //向量差
            Vec3.subtract(this._offsetPos, this._playerWorPos, this._rewardWorPos);

            if (!this._totalFlyTime) {
                this._totalFlyTime = this._offsetPos.length() / 2;
            }

            // 由慢到快
            this._raiseTimes += deltaTime;
            let offset = Math.pow(this._raiseTimes, 0.5) - 1;
            this._curFlyTime += deltaTime + offset;
            this._curFlyTime = this._curFlyTime >= this._totalFlyTime ? this._totalFlyTime : this._curFlyTime;

            let percent = Number((this._curFlyTime / this._totalFlyTime).toFixed(2));
            // console.log("percent", percent);

            this._targetWorPos.set(this._rewardWorPos.x + this._offsetPos.x * percent, this._playerWorPos.y, this._rewardWorPos.z + this._offsetPos.z * percent);
            this.node.setWorldPosition(this._targetWorPos);

            let length = util.getTwoPosXZLength(this._targetWorPos.x, this._targetWorPos.z, this._playerWorPos.x, this._playerWorPos.z);
            // if (this._targetWorPos.equals(this._playerWorPos, 0.1)) {
            if (length <= 0.1) {
                this._isInhaling = false;
                this._ndTrial.active = false;
                poolManager.instance.putNode(this.node);

                if (this.rewardType === REWARD_TYPE.GOLD) {
                    GameManager.addGold();
                } else if (this.rewardType === REWARD_TYPE.HEART) {
                    //回复5%的血量
                    let bloodNum = GameManager.scriptPlayer.curHpLimit * 0.05;
                    GameManager.scriptPlayer.addBlood(bloodNum);
                }

                this._checkInhaleOver();
                // console.log("吸收奖品");
            }
        }
    }
}
