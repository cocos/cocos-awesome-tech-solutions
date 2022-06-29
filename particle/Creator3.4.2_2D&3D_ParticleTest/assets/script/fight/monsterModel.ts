
import { _decorator, Component, Node, SkeletalAnimationComponent, SkeletalAnimationState, AnimationClip } from 'cc';
import { constant } from '../framework/constant';
import { GameManager } from './gameManager';
import { Monster } from './monster';
const { ccclass, property } = _decorator;

@ccclass('MonsterModel')
export class MonsterModel extends Component {
    @property(SkeletalAnimationComponent)
    public aniComPlayer: SkeletalAnimationComponent = null!;//动画播放组件

    public isAniPlaying: Boolean = false;//当前动画是否正在播放
    public scriptMonster: Monster = null!;

    private _aniType: string = "";//动画类型
    private _aniState: SkeletalAnimationState = null!;//动画播放状态

    //是否正在跑
    public get isRunning () {
        return this._aniType === constant.MONSTER_ANI_TYPE.RUN && this.isAniPlaying;
    }

    //是否站立
    public get isIdle () {
        return this._aniType === constant.MONSTER_ANI_TYPE.IDLE && this.isAniPlaying;
    }

    //是否正在攻击
    public get isAttacking () {
        return (this._aniType === constant.MONSTER_ANI_TYPE.ATTACK  && this.isAniPlaying)
            || (this._aniType === constant.MONSTER_ANI_TYPE.ATTACK_1 && this.isAniPlaying)
            || (this._aniType === constant.MONSTER_ANI_TYPE.ATTACK_2  && this.isAniPlaying);
    } 

    //是否正在受到攻击
    public get isHitting () {
        return this._aniType === constant.MONSTER_ANI_TYPE.HIT && this.isAniPlaying;;
    } 

    start () {
        // [3]
    }

    /**
     * attack动画帧事件
     * @returns 
     */
    onFrameAttack (isNormalAttack: boolean = true) {
        if (GameManager.isGameOver || GameManager.isGamePause) {
            return;
        }

        this.scriptMonster.releaseSkillToPlayer(isNormalAttack);
    }

    /**
     * 播放小怪动画
     *
     * @param {string} aniType 动画类型
     * @param {boolean} [isLoop=false] 是否循环
     * @param {Function} [callback] 回调函数
     * @param {number} [pos] 调用播放动画的位置，方便用于测试
     * @returns
     * @memberof Player
     */
     public playAni (aniType: string, isLoop: boolean = false, callback?: Function, pos?: number) {
        // console.log("monsterAniType", aniType, "curAni", this._aniType, "pos", pos);

        this._aniType = aniType;
        this.aniComPlayer?.play(aniType);
        this.isAniPlaying = true;

        this._aniState = this.aniComPlayer?.getState(aniType) as SkeletalAnimationState;

        if (this._aniState) {
            if (isLoop) {
                this._aniState.wrapMode = AnimationClip.WrapMode.Loop;    
            } else {
                this._aniState.wrapMode = AnimationClip.WrapMode.Normal;    
            }

            switch (aniType) {
                case constant.MONSTER_ANI_TYPE.ATTACK:
                    this._aniState.speed = GameManager.gameSpeed * GameManager.attackSpeedAddition * this.scriptMonster.curAttackSpeed;
                    break;
                case constant.MONSTER_ANI_TYPE.ATTACK_1:
                    this._aniState.speed = GameManager.gameSpeed * GameManager.attackSpeedAddition * this.scriptMonster.curAttackSpeed;
                    break;
                case constant.MONSTER_ANI_TYPE.ATTACK_2:
                    this._aniState.speed = GameManager.gameSpeed * GameManager.attackSpeedAddition * this.scriptMonster.curAttackSpeed;
                    break;
                case constant.MONSTER_ANI_TYPE.RUN:
                    this._aniState.speed = GameManager.gameSpeed * (this.scriptMonster.curMoveSpeed * GameManager.moveSpeedAddition / this.scriptMonster.baseInfo.moveSpeed);
                    break;
                case constant.MONSTER_ANI_TYPE.IDLE:
                    this._aniState.speed = GameManager.gameSpeed;
                    break;
                default:
                    this._aniState.speed = GameManager.gameSpeed;
                    break;
            }
        }

        if (!isLoop) {
            this.aniComPlayer.once(SkeletalAnimationComponent.EventType.FINISHED, ()=>{
                this.isAniPlaying = false;
                callback && callback();
            })
        }
    }

}