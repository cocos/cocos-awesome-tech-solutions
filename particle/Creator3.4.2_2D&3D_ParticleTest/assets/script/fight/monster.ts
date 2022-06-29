import { AudioManager } from './../framework/audioManager';
import { util } from './../framework/util';
import { localConfig } from './../framework/localConfig';
import { EffectManager } from './../framework/effectManager';
import { uiManager } from './../framework/uiManager';
import { poolManager } from './../framework/poolManager';
import { _decorator, Component, Vec3, macro, Node, VideoClip, Quat, clamp, RigidBodyComponent } from 'cc';
import { constant } from '../framework/constant';
import { GameManager } from './gameManager';
import { MonsterBloodBar } from '../ui/fight/monsterBloodBar';
import { clientEvent } from '../framework/clientEvent';
import { MonsterModel } from './monsterModel';
import { resourceUtil } from '../framework/resourceUtil';
import { EnergyBall } from './monsterSkill/energyBall';
import { FireBall } from './monsterSkill/fireBall';
import { DispersionSurround } from './monsterSkill/dispersionSurround';
import { Dispersion } from './monsterSkill/dispersion';
import { FireBallBig } from './monsterSkill/fireBallBig';
import { Tornado } from './monsterSkill/tornado';
import { Laser } from './monsterSkill/laser';
import { CharacterRigid } from './characterRigid';
//怪物组件
let qt_0 = new Quat();
let v3_0 = new Vec3();

const { ccclass, property } = _decorator;
//普通怪物组件
@ccclass('Monster')
export class Monster extends Component {
    public scriptMonsterModel: MonsterModel = null!;//怪物动画组件播放脚本
    public isMoving: boolean = false;//怪物是否正在移动
    public scriptBloodBar: MonsterBloodBar = null!;//关联的血条脚本
    public bloodTipDirection: number = constant.BLOOD_TIP_DIRECTION.LEFT_UP;//血量提示方向
    public skillInfo: any = null!;//技能信息
    public allSkillInfo: any = null!;//所有拥有的技能信息
    public baseInfo: any = null!;//怪物在base表里面对应数据
    public layerInfo: any = null!;//怪物在当前层级的配置数据
    public curAttackSpeed: number = 0;//当前攻击速度
    public scriptWarning: any = null!;//预警技能脚本
    public attackForward: Vec3 = new Vec3();//攻击朝向
    public attackPos: Vec3 = new Vec3();//技能即将攻击的位置
    public rigidComMonster: RigidBodyComponent = null!;
    public scriptCharacterRigid: CharacterRigid = null!;
    public set curMoveSpeed (v: number) {
        this._curMoveSpeed = v;
        this.scriptCharacterRigid.initSpeed(v, GameManager.moveSpeedAddition);
    }

    public get curMoveSpeed () {
        return this._curMoveSpeed;
    }

    public set isDie (v: boolean) {
        this._isDie = v;

        if (this._isDie) {
            this.showDie();
        }
    }

    public get isDie () {
        return this._isDie;
    }

    protected _isDie: boolean = false;//是否死亡
    protected _curAttackInterval: number = 0;//距离上次被攻击的时长
    protected _isHitByPlayer: boolean = false;//是否被玩家击中
    protected _isInitBloodBar: boolean = false;//是否已经初始化血条
    protected _bloodTipOffsetPos: Vec3 = new Vec3(0, 50, 0);//怪物血条距离人物位置偏差
    protected _hideBloodCountDown: number = 3;//怪物的血条被攻击后才会显示，且如果3秒未被攻击则会隐藏
    protected _hitEffectPos: Vec3 = new Vec3(0, 0.2, 0);//受击特效位置
    protected _isAllowToAttack: boolean = false;//是否允许攻击
    protected _playerMonsterOffset: Vec3 = new Vec3();//怪物和玩家间距
    protected _curAngleY: number = 0;//当前Y分量旋转角度
    protected _horizontal: number = 0;//水平移动距离
    protected _vertical: number = 0;//垂直移动距离
    protected _iceDamageCountDown: number = 0;//冰冻伤害倒计时
    protected _fireDamageCountDown: number = 0;//灼烧伤害倒计时
    protected get _isStopAttack () {//当前是否停止攻击,且原地跑
        return  !this.isDie && !this.scriptMonsterModel.isIdle && !this.scriptMonsterModel.isAttacking && !this.scriptMonsterModel.isHitting && this._prevMoveWorPos.equals(this.node.worldPosition, 0.01);
    }
    protected _ndMonsterSkill: Node = null!;//技能特效节点
    protected _skillIndex: number = 0;//当前技能索引
    protected _minLength: number = 3;//怪物和玩家之间的最小距离

    protected _curMoveSpeed: number = 0;//当前移动速度

    //移动相关
    protected _moveMode: number = 0;//移动方式
    protected _movePattern: number = 0;//移动模式
    protected _moveFrequency: number = 0;//两次移动间隔,为0表示一直移动)
    protected _offsetPos: Vec3 = new Vec3();//和玩家之间的向量差
    protected _offsetPos_2: Vec3 = new Vec3();//和玩家之间的向量差
    protected _mixOffset: Vec3 = new Vec3(1, 0, 1);//和玩家的最小间距
    protected _targetWorPos: Vec3 = new Vec3();//下一步的目标位置
    protected _isPlayRotate: boolean = false;//是否旋转
    protected _curAngle: Vec3 = new Vec3()//当前旋转的角度
    protected _curAngle_2: Vec3 = new Vec3();//怪物角度
    protected _tempAngle: Vec3 = new Vec3();//临时变量，怪物角度
    protected _rotateDirection: Vec3 = new Vec3();//旋转方向
    protected _forWard: Vec3 = new Vec3();//朝向
    protected _ndRunSmokeEffect: Node = null!;//烟雾特效
    protected _originAngle: Vec3 = new Vec3(0, -90, 0);//怪物开始角度
    protected _targetAngle: Vec3 = new Vec3();//目标旋转角度
    protected _checkInterval: number = 0.04;//每40ms刷新一次
    protected _currentTime: number = 0;//当前累积时间
    protected _ndBody: Node = null!;//
    protected _curMoveWorPos: Vec3 = new Vec3();//当前怪物移动位置
    protected _isArrived: boolean = false;//是否到达
    protected _checkMoveInterval: number = 0;//检查当前是否移动时间间隔
    protected _prevMoveWorPos: Vec3 = new Vec3();//之前怪物的移动坐标
    protected _moveUnit: Vec3 = new Vec3();//每次移动的单位向量
    protected _minLengthRatio: number = 1.1;//达到最小距离的1.1倍视为进入最小距离
    protected _randomMoveTryTimes: number= 5;//每次随机移动位置最多计算次数

    onEnable () {
        clientEvent.on(constant.EVENT_TYPE.MONSTER_MOVE, this._monsterMove, this);
    }

    onDisable () {
        clientEvent.off(constant.EVENT_TYPE.MONSTER_MOVE, this._monsterMove, this);

        //回收血条节点
        if (this.scriptBloodBar) {
            if (this.scriptBloodBar.node.parent) {
                poolManager.instance.putNode(this.scriptBloodBar.node);
            }
            this.scriptBloodBar = null!;
        }

        //回收预警节点
        this.recycleWarning();

        //回收技能节点
        if (this._ndMonsterSkill) {
            poolManager.instance.putNode(this._ndMonsterSkill);
            this._ndMonsterSkill = null!;
        }
    }

    start () {
        // [3]
    }

    public init(baseInfo: any, layerInfo: any) {
        this.baseInfo = baseInfo;
        this.layerInfo = layerInfo;
        this.isDie = false;
        
        this.recycleWarning();

        this._ndBody = this.node.getChildByName("body") as Node;
        this.scriptCharacterRigid = this.node.getComponent(CharacterRigid) as CharacterRigid;

        if (!this.rigidComMonster) {
            this.rigidComMonster = this.node.getComponent(RigidBodyComponent) as RigidBodyComponent;
        }
        this.rigidComMonster.clearState();

        this.scriptMonsterModel = this._ndBody.getComponent(MonsterModel) as MonsterModel;
        this.scriptMonsterModel.playAni(constant.MONSTER_ANI_TYPE.IDLE, true);

        this._curAttackInterval = 0;
        this._isHitByPlayer = false;
        this._isInitBloodBar = false;
        this._isAllowToAttack = false;
        this._isArrived = false;
        this._checkMoveInterval = 0;
        this._iceDamageCountDown = 0;
        this._fireDamageCountDown = 0;
        this._ndMonsterSkill = null!;
        this._skillIndex = 0;
        this._moveUnit = new Vec3();
        this._movePattern = layerInfo.movePattern ? layerInfo.movePattern : this.baseInfo.movePattern;
        
        this.scriptBloodBar = null!;

        this._refreshSkill();

        this.scriptMonsterModel.scriptMonster = this;

        this.curAttackSpeed = this.baseInfo.attackSpeed;
        this.curMoveSpeed = this.baseInfo.moveSpeed;

        this._getMinLength();
    }

    /**
     * 获取怪物和玩家之间的最小距离
     *
     * @memberof Monster
     */
    protected _getMinLength () {
        if (this.node.name === "aula") {
            this._minLength = 2;
        } else if (this.node.name === "boomDragon") {
            this._minLength = 2;
        } else if (this.node.name === "hellFire") {
            this._minLength = 2.5;
        } else if (this.node.name === "magician") {
            this._minLength = 2.5;
        } else if (this.node.name === "dragon") {
            this._minLength = 5;
        }
    }

    /**
     * 刷新当前使用技能
     *
     * @private
     * @memberof Monster
     */
    protected _refreshSkill () {
        this.allSkillInfo = this.layerInfo.skill === "" ? [] :this.layerInfo.skill.split("#");
        if (this.allSkillInfo.length) {
            this._skillIndex = this._skillIndex >= this.allSkillInfo.length ? 0 : this._skillIndex;
            let skillID = this.allSkillInfo[this._skillIndex];
            this.skillInfo = localConfig.instance.queryByID("monsterSkill", skillID);
            this._skillIndex += 1;
        } 
    }

    /**
     * 怪物阵亡
     *
     * @memberof Monster
     */
    public showDie () {
        this.scriptCharacterRigid.stopMove();

        this.recycleWarning();

        AudioManager.instance.playSound(`${this.node.name}Die`);

        let sound = '';
        if (this.node.name === "aula") {
            sound = constant.SOUND.AULA_DIE;
        } else if (this.node.name === "boomDragon") {
            sound = constant.SOUND.BOOM_DRAGON_DIE;
        } else if (this.node.name === "hellFire") {
            sound = constant.SOUND.HELL_FIRE_DIE;
        } else if (this.node.name === "magician") {
            sound = constant.SOUND.MAGICIAN_DIE;
        } else if (this.node.name === "dragon") {
            sound = constant.SOUND.DRAGON_DIE;
        }

        AudioManager.instance.playSound(sound);
        
        EffectManager.instance.showRewardBounce(this.node, "gold/gold", this.baseInfo.goldNum, ()=>{
            if (this.baseInfo.heartDropRate >= Math.random()) {
                EffectManager.instance.showRewardBounce(this.node, "heart/heart", 1);
            }
        });

        //检查玩家是否拥有嗜血技能：主角击杀敌人时回复自身生命上限2%的生命值。
        if (GameManager.scriptPlayer.isBloodthirsty) {
            let bloodNum = GameManager.scriptPlayer.curHpLimit * 0.02;
            GameManager.scriptPlayer.addBlood(bloodNum);
        }

        this.scriptMonsterModel.playAni(constant.MONSTER_ANI_TYPE.DIE, false, ()=>{
            if (this.isDie) {
                this.scriptBloodBar = null!;
                poolManager.instance.putNode(this.node);
            }
        });
    }

    public recycleWarning () {
        //回收预警节点
        if (this.scriptWarning) {
            if (this.scriptWarning.node.parent) {
                poolManager.instance.putNode(this.scriptWarning.node);
            } 
            this.scriptWarning = null!;
        }
    }

    /**
     * 怪物播放受击效果
     *
     * @param {boolean} isArrowLaunch 是否被弹射的弓箭射中，如果是则造成普通伤害
     * @param {boolean} isPassiveLightning 是否被动受到电击
     * @return {*} 
     * @memberof Monster
     */
    public playHit (isArrowLaunch: boolean = false, isPassiveLightning: boolean = false) {
        if (this.isDie) {
            return;
        }

        AudioManager.instance.playSound(constant.SOUND.HIT_MONSTER);

        //播放受击特效
        let effectPath = "hit/hit";
        let arrEffectPath: any = [];
        let recycleTime = 1.2;
        
        let isHasIce = GameManager.scriptPlayer.isArrowIce;
        let isHasFire = GameManager.scriptPlayer.isArrowFire;
        let isHasLightning = GameManager.scriptPlayer.isArrowLightning;

        if (isHasFire || isHasIce || isHasLightning) {
            if (isHasFire && isHasIce && isHasLightning) {
                arrEffectPath = ["hit/hitFire", "hit/hitIce", "hit/hitLightning"];
            } else {
                if (isHasFire && isHasIce || isHasFire && isHasLightning || isHasIce && isHasLightning) {
                    if (isHasFire && isHasIce) {
                        arrEffectPath = ["hit/hitFire", "hit/hitIce"];
                    } else if (isHasLightning && isHasFire) {
                        arrEffectPath = ["hit/hitFire", "hit/hitLightning"];
                    } else if (isHasLightning && isHasIce) {
                        arrEffectPath = ["hit/hitIce", "hit/hitLightning"];
                    }
                } else {
                    if (isHasFire) {
                        arrEffectPath = ["hit/hitFire"];
                    } else if (isHasIce) {
                        arrEffectPath = ["hit/hitIce"];
                    } else if (isHasLightning) {
                        arrEffectPath = ["hit/hitLightning"];
                    }
                }
            }

            effectPath = arrEffectPath[Math.floor(Math.random() * arrEffectPath.length)];

            if (effectPath === "hit/hitFire") {
                //灼烧技能持续2秒
                recycleTime = 2;
            } else if (effectPath === "hit/hitIce") {
                recycleTime = 1;
            }

            //被冰冻技能击中
            if (isHasIce && this._iceDamageCountDown <= 0) {
                this._iceDamageCountDown = 1;
            }

            //被灼烧技能击中
            if (isHasFire && this._fireDamageCountDown <= 0) {
                this._fireDamageCountDown = 2;
            }
        } 

        EffectManager.instance.playEffect(this.node, effectPath, false, true, recycleTime, 1, this._hitEffectPos);

        //攻击的时候霸体状态
        if (!this.scriptMonsterModel.isAttacking) {
            this.scriptMonsterModel.playAni(constant.MONSTER_ANI_TYPE.HIT);
        }

        //受到攻击的敌人会向身旁一定范围内的所有敌人发射闪电，减少生命上限5%的生命值
        if (GameManager.scriptPlayer.isArrowLightning && !isPassiveLightning) {
            let arrTargets = GameManager.getNearbyMonster(this.node, true);

            if (arrTargets) {
                arrTargets.forEach((ndChild: Node)=>{
                    EffectManager.instance.showLightningChain(this.node, ndChild);
                    let scriptMonster = ndChild.getComponent(Monster) as Monster;
                    scriptMonster.playHit(false, true);
                })                
            }
        }

        //怪物扣血
        if (Math.random() > this.baseInfo.dodgeRate) {
            //闪避失败
            let tipType = constant.FIGHT_TIP.REDUCE_BLOOD;
            let damage = GameManager.scriptPlayer.curAttackPower * (1 - this.baseInfo.defensePower * GameManager.defenseAddition / (this.baseInfo.defensePower + 400));
            let isCriticalHit = Math.random() <= GameManager.scriptPlayer.curCriticalHitRate;//是否暴击
            //是否暴击
            if (isCriticalHit) {
                //不是被弹射的箭击中，且不是被动受到电击
                if (!isArrowLaunch && !isPassiveLightning) {
                    damage = damage * GameManager.scriptPlayer.curCriticalHitDamage;
                    tipType = constant.FIGHT_TIP.CRITICAL_HIT;
                }
            } 
            
            if (isPassiveLightning) {
                damage = this.baseInfo.hp * 0.05 * (1 - this.baseInfo.defensePower / (this.baseInfo.defensePower + 400));
            }

            this.refreshBlood(-damage, tipType);
        }
    }

    /**
     * 刷新血量
     *
     * @private
     * @param {number} bloodNum
     * @memberof Monster
     */
    public refreshBlood (bloodNum: number, tipType: number) {
        let cb = () => {
            this.scriptBloodBar.refreshBlood(bloodNum);
            uiManager.instance.showBloodTips(this, tipType, bloodNum, this._bloodTipOffsetPos);
        }

        this._curAttackInterval = 0;

        if (!this._isInitBloodBar) {
            this._isInitBloodBar = true;
            console.log("###小怪生成新的血条", this.node.name);
            uiManager.instance.showMonsterBloodBar(this, this.baseInfo.hp, ()=>{
                cb();
            });
        } else {
            if (this.scriptBloodBar) {
                this.scriptBloodBar.node.active = true;
                cb();
            }
        }
    }

    /**
     * 怪物行为
     *
     * @param {*} obj
     * @memberof Player
     */
     public playAction (obj: any) {
        switch (obj.action) {
            case constant.MONSTER_ACTION.MOVE:
                let angle = obj.value + 135;

                let radian = angle * macro.RAD;
                this._horizontal = Math.round(Math.cos(radian) * 1);
                this._vertical = Math.round(Math.sin(radian) * 1);  
                this.isMoving = true;

                this._curAngleY = obj.value;
                this._curAngleY = this._curAngleY < 0 ? this._curAngleY + 360 : this._curAngleY > 360 ? this._curAngleY - 360 : this._curAngleY;

                this._prevMoveWorPos.set(this.node.worldPosition);
                break;
            case constant.MONSTER_ACTION.STOP_MOVE:
                this._horizontal = 0;
                this._vertical = 0;

                if (GameManager.ndPlayer) {
                    this._attackPlayer();
                } else {
                    this.scriptMonsterModel.playAni(constant.MONSTER_ANI_TYPE.IDLE, true);
                }

                this.isMoving = false;
                this.scriptCharacterRigid.stopMove();
                break;
            default:
                break;
        }
    }

    /**
     * 攻击玩家
    */
    protected _attackPlayer () {
        if (GameManager.scriptPlayer.isDie || this.scriptMonsterModel.isAttacking) {
            return;
        }

        Vec3.subtract(this._offsetPos_2, GameManager.ndPlayer.worldPosition, this.node.worldPosition);
        let length = this._offsetPos_2.length();
        this.attackForward = this._offsetPos_2.normalize().negative();
        this.attackForward.y = 0;
        this.attackPos.set(GameManager.ndPlayer.worldPosition);

        //预警
        if (this.allSkillInfo.length && this.skillInfo && this.skillInfo.warning) {
            let scale = 1;
            if (this.skillInfo.ID === constant.MONSTER_SKILL.FIRE_BALL) {
                scale = 0.1;
            } else if (this.skillInfo.ID === constant.MONSTER_SKILL.FIRE_BALL_BIG) {
                scale = 0.4;
            } else if (this.skillInfo.ID === constant.MONSTER_SKILL.LASER) {
                scale = 3;
            } else if (this.skillInfo.ID === constant.MONSTER_SKILL.ENERGY_BALL) {
                scale = length;
            }

            //回收预警节点
            this.recycleWarning();

            EffectManager.instance.showWarning(this.skillInfo.warning, scale, this, ()=>{
                this.playAttackAni();
            });
        } else {
            this.playAttackAni();
        }
    }

    /**
     * 播放攻击动画
     *
     * @protected
     * @memberof Monster
     */
    public playAttackAni () {
        let attackAniName = constant.MONSTER_ANI_TYPE.ATTACK;
        if (this.baseInfo.resName === "hellFire") {
            //hellFire的攻击动画有两个，其他小怪动画只有一个
            if (!this.allSkillInfo.length) {
                //近战
                attackAniName = constant.MONSTER_ANI_TYPE.ATTACK_1;
            } else {
                //远程
                attackAniName = constant.MONSTER_ANI_TYPE.ATTACK_2;
            }
        }

        //远程
        if (this.allSkillInfo.length) {
            this.scriptMonsterModel.playAni(attackAniName, false, ()=>{
                if (!this.isDie && !this.scriptMonsterModel.isHitting) {
                    this.scheduleOnce(()=>{
                        this._monsterMove()
                    }, this.baseInfo.moveFrequency)
                }
            });
        } else {
            //近战
            let offsetLength = util.getTwoNodeXZLength(this.node, GameManager.ndPlayer);
            if (offsetLength <= this._minLength * this._minLengthRatio) {
                this.scriptMonsterModel.playAni(attackAniName, false, ()=>{
                    if (!this.isDie && !this.scriptMonsterModel.isHitting) {
                        this.scheduleOnce(()=>{
                            this._monsterMove()
                        }, this.baseInfo.moveFrequency)
                    }
                });
            } else {
                if (!this.isDie && !this.scriptMonsterModel.isHitting) {
                    this.scheduleOnce(()=>{
                        this._monsterMove()
                    }, this.baseInfo.moveFrequency)
                }
            }
        }
    }

    private _getRandomMovePos () {
        this._randomMoveTryTimes -= 1;
        //随机移动：先以怪物圆环区间(1, minLength)随机移动,再朝向玩家,然后攻击
        let x = util.getRandom(1, 3) * util.getRandomDirector();
        let z = util.getRandom(1, 3) * util.getRandomDirector();
        // console.log("###随机移动", x, z);
        this._targetWorPos.set(util.toFixed(this.node.worldPosition.x + x), util.toFixed(this.node.worldPosition.y), util.toFixed(this.node.worldPosition.z + z));

        let offsetLength = util.getTwoPosXZLength(this._targetWorPos.x, this._targetWorPos.z, GameManager.ndPlayer.worldPosition.x, GameManager.ndPlayer.worldPosition.z);
        //当目标位置和玩家大于最小距离，进行移动
        if (offsetLength > this._minLength) {
            Vec3.subtract(this._offsetPos, this._targetWorPos, this.node.worldPosition);
            this._offsetPos.y = 0;
            Vec3.normalize(this._moveUnit, this._offsetPos);
            
            this._lookAtTargetWorPos(this._targetWorPos);
            this.isMoving = true;
            this._isArrived = false;
        } else {
            //否则尝试5次随机移动，都没合适的位置则进行进攻
            if (this._randomMoveTryTimes <= 0) {
                // console.log("###随机移动", this._randomMoveTryTimes);
                this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
            } else {
                this._getRandomMovePos();
                // console.log("###随机移动", this._randomMoveTryTimes);
            }
        }
    }

    /**
     * 先移动
     *
     * @private
     * @memberof Monster
     */
    protected _monsterMove () {
        if (this.isDie) {
            return;
        }

        if (!this._isAllowToAttack) {
            this._isAllowToAttack = true;
        }
        
        if (this._movePattern === constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
            //不移动，原地攻击玩家
            this._lookAtTargetWorPos();
        } else if (this._movePattern === constant.MONSTER_MOVE_PATTERN.RANDOM) {
            this._randomMoveTryTimes = 5;
            this._getRandomMovePos();
        } else if (this._movePattern === constant.MONSTER_MOVE_PATTERN.FORWARD_PLAYER) {
            //面向玩家移动：先面向玩家，再移动，然后攻击
            this._lookAtTargetWorPos();
            Vec3.subtract(this._offsetPos, GameManager.ndPlayer.worldPosition, this.node.worldPosition);
            this._offsetPos.y = 0;

            let offsetLength = util.getTwoNodeXZLength(this.node, GameManager.ndPlayer);
            //当怪物和玩家小于2个最小距离之和或者大于一个最小距离且小于两个最小距离，进行移动
            if (offsetLength > this._minLength * 2 || (offsetLength > this._minLength && offsetLength < this._minLength * 2)) {
                //单位向量
                Vec3.normalize(this._moveUnit, this._offsetPos);
                Vec3.multiplyScalar(this._offsetPos, this._moveUnit, this._minLength);

                if (offsetLength > this._minLength * 2) {
                    //向玩家移动2个单位向量
                    Vec3.add(this._targetWorPos, this.node.worldPosition, this._offsetPos);
                } else {
                    Vec3.subtract(this._targetWorPos, GameManager.ndPlayer.worldPosition, this._offsetPos);
                }
               
                this._targetWorPos.set(util.toFixed(this._targetWorPos.x), util.toFixed(this.node.worldPosition.y), util.toFixed(this._targetWorPos.z));
                this.isMoving = true;
            } else {
                //否则原地进行攻击
                this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
            }
        }
    }

    /**
     * 怪物面向目标的世界坐标
     *
     * @private
     * @memberof Monster
     */
    protected _lookAtTargetWorPos (targetWorPos?: Vec3) {
        let screenPos1 = GameManager.mainCamera?.worldToScreen(GameManager.ndPlayer.worldPosition) as Vec3;
        let screenPos2 =  GameManager.mainCamera?.worldToScreen(this.node.worldPosition) as Vec3;
        if (targetWorPos) {
            screenPos1 = GameManager.mainCamera?.worldToScreen(targetWorPos) as Vec3;
        }
        Vec3.subtract(this._playerMonsterOffset, screenPos1, screenPos2);
        let angleY = Math.round(Math.atan2(this._playerMonsterOffset.y, this._playerMonsterOffset.x) * 180 / Math.PI);
        // if (angleY !== this._curAngleY) {
            this.playAction({action: constant.MONSTER_ACTION.MOVE, value: angleY});
        // }
    }
    
    /**
     * 向玩家释放技能
     *
     * @returns
     * @memberof Player
     */
    public releaseSkillToPlayer (isNormalAttack?:boolean) {
        //没有技能则使用近战
        if (!this.allSkillInfo.length) {
            let offsetLength = util.getTwoNodeXZLength(this.node, GameManager.ndPlayer);
            if (offsetLength <= this._minLength * this._minLengthRatio) {
                GameManager.scriptPlayer.reduceBlood(this.baseInfo);
            }
            return;
        }

        this.node.forward = Vec3.subtract(this._forWard, GameManager.ndPlayer.worldPosition, this.node.worldPosition).normalize();

        //加载对应技能
        resourceUtil.loadEffectRes(`${this.skillInfo.resName}/${this.skillInfo.resName}`).then((prefab: any)=>{
            if (this.isMoving) {
                return;
            }
            this._ndMonsterSkill = poolManager.instance.getNode(prefab, GameManager.ndGameManager as Node) as Node;
            this._ndMonsterSkill.setWorldPosition(this.node.worldPosition.x, 2.5, this.node.worldPosition.z);
            this._ndMonsterSkill.forward = this.attackForward.negative();
            
            let scriptSkillCollider: any = null!;

            //怪物技能初始化
            switch (this.skillInfo.ID) {
                case constant.MONSTER_SKILL.ENERGY_BALL:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(EnergyBall) as EnergyBall;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case constant.MONSTER_SKILL.FIRE_BALL: 
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(FireBall) as FireBall;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case constant.MONSTER_SKILL.DISPERSION:
                    this._ndMonsterSkill.children.forEach((ndChild: Node, idx: number)=>{
                        let scriptSkillCollider = ndChild.getComponent(Dispersion) as Dispersion;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo);
                    })
                    break;
                case constant.MONSTER_SKILL.TORNADO: 
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(Tornado) as Tornado;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case constant.MONSTER_SKILL.FIRE_BALL_BIG:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(FireBallBig) as FireBallBig;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case constant.MONSTER_SKILL.DISPERSION_SURROUND:
                    this._ndMonsterSkill.children.forEach((ndChild: Node)=>{
                        let scriptSkillCollider = ndChild.getComponent(DispersionSurround) as DispersionSurround;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo);
                    })
                    break;
                case constant.MONSTER_SKILL.LASER:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(Laser) as Laser;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
            }

            this._refreshSkill();
        })
    }

    update (deltaTime: number) {
        if (!GameManager.isGameStart || GameManager.isGameOver || GameManager.isGamePause || this.isDie || !this._isAllowToAttack || !GameManager.scriptPlayer || GameManager.scriptPlayer.isDie) {
            return;
        }

        //3秒未被攻击则会隐藏血条
        if (!this._isHitByPlayer && this.scriptBloodBar) {
            this._curAttackInterval += deltaTime;

            if (this._curAttackInterval >= this._hideBloodCountDown && this.scriptBloodBar.node.active) {
                this.scriptBloodBar.node.active = false;
            }
        }

        if (this.isMoving) {
            if (this._movePattern === constant.MONSTER_MOVE_PATTERN.RANDOM) {
                //如果移动到目标位置就停止移动
                let offsetLength = util.getTwoPosXZLength(this.node.worldPosition.x, this.node.worldPosition.z, this._targetWorPos.x, this._targetWorPos.z);
                let offsetTarget = 0.05;

                //爆炸龙的位移是跳，不容易精准到达目标位置,把达到范围适当增大
                if (this.baseInfo.resName === 'boomDragon') {
                    offsetTarget = 0.5;
                }

                if (offsetLength <= offsetTarget && !this._isArrived) {
                    // console.log("###到达目标位置，面向玩家");
                    this._isArrived = true;
                    this._lookAtTargetWorPos();
                }
                
            } else if (this._movePattern === constant.MONSTER_MOVE_PATTERN.FORWARD_PLAYER) {
                //如果移动到目标位置就停止移动
                let offsetLength = util.getTwoPosXZLength(this.node.worldPosition.x, this.node.worldPosition.z, this._targetWorPos.x, this._targetWorPos.z);
                if (offsetLength <= 0.05) {
                    // 进行攻击
                    this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
                }
            }
        }

        //怪物旋转
        if (this._isPlayRotate) {
            //当前怪物角度
            this._tempAngle.set(this.node.eulerAngles);
            this._tempAngle.y = this._tempAngle.y < 0 ? this._tempAngle.y + 360 : this._tempAngle.y;

            if (this._curAngle.length() === 0) {
                this._curAngle.set(this._tempAngle);
            }

            this.node.eulerAngles = this._tempAngle;
            //第二个参数越小朝向越精确
            let isEqual = this._curAngle.equals(this._targetAngle, 0.01);

            if (!isEqual) {
                Vec3.lerp(this._curAngle, this._curAngle, this._targetAngle, 0.167);
                this.node.eulerAngles = this._curAngle;
            } else {
                this._isPlayRotate = false;
                this.node.eulerAngles = this._targetAngle;
                this._curAngle.set(0, 0, 0);

                if (this._movePattern === constant.MONSTER_MOVE_PATTERN.RANDOM) {
                    if (this._isArrived) {
                        // console.log("###面向玩家角度结束，发起进攻1");
                        this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
                    }
                } else if (this._movePattern === constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
                    // console.log("###面向玩家角度结束，发起进攻2");
                    this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
                }
            }
        }

        if (this._horizontal !== 0 || this._vertical !== 0) {
            //计算出旋转角度
            this._rotateDirection.set(this._horizontal, 0, -this._vertical);
            this._rotateDirection = this._rotateDirection.normalize();
        
            Quat.fromViewUp(qt_0, this._rotateDirection);
            Quat.toEuler(v3_0, qt_0);
            v3_0.y = v3_0.y < 0 ? v3_0.y + 360 : v3_0.y;

            this._isPlayRotate = true;
            
            //设置当前怪物角度为正数
            this._curAngle_2.set(this.node.eulerAngles);
            if (this._curAngle_2.y < 0) {
                this._curAngle_2.y += 360;
                this.node.eulerAngles = this._curAngle_2; // 转为0~360
            } else if (this._curAngle_2.y > 360) {
                this._curAngle_2.y -= 360;
                this.node.eulerAngles = this._curAngle_2; // 转为0~360
            }

            //设置目标旋转角度
            if (!v3_0.equals(this.node.eulerAngles, 0.01)) {
                    this._targetAngle.y = this._curAngleY + 225;
                    this._targetAngle.y = this._targetAngle.y < 0 ? this._targetAngle.y + 360 : this._targetAngle.y > 360 ? this._targetAngle.y - 360 : this._targetAngle.y;
                    this._targetAngle.x = 0; 
                    this._targetAngle.z = 0;

                    if (Math.abs(this._targetAngle.y - this._curAngle_2.y) > 180) {
                        if (this._targetAngle.y > this._curAngle_2.y) {
                            this._targetAngle.y -= 360;
                        } else {
                            this._targetAngle.y += 360;
                        }
                    }

                    //每次有新的_targetAngle之后，先将_curAngle初始化
                    this._curAngle.set(0, 0, 0);
            } else {
                this._isPlayRotate = false;
                this.node.eulerAngles = v3_0;

                if (this._movePattern === constant.MONSTER_MOVE_PATTERN.RANDOM) {
                    if (this._isArrived) {
                        // console.log("###面向玩家角度结束，发起进攻1-1");
                        this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
                    }
                } else if (this._movePattern === constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
                    // console.log("###面向玩家角度结束，发起进攻2-1");
                    this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
                }
            }

            if (!this.isMoving) {
                return;
            }

            //怪物朝着目标位置移动：
            if (this._movePattern !== constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
                this.scriptCharacterRigid.move(-this._moveUnit.x * this.curMoveSpeed * GameManager.moveSpeedAddition * 0.5 * deltaTime, -this._moveUnit.z * this.curMoveSpeed * GameManager.moveSpeedAddition * 0.5 * deltaTime);
            }

            if (!this.scriptMonsterModel.isRunning && this._movePattern !== constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
                this.scriptMonsterModel.playAni(constant.MONSTER_ANI_TYPE.RUN, true);
            }
        } else {
            if (!this.isDie && !this.scriptMonsterModel.isIdle && !this.scriptMonsterModel.isAttacking && !this.scriptMonsterModel.isHitting) {
                this.scriptMonsterModel.playAni(constant.MONSTER_ANI_TYPE.IDLE, true);
                this.scriptCharacterRigid.stopMove();
            }
        }

        //冰冻持续降低攻击力和伤害
        if (this._iceDamageCountDown > 0) {
            this._iceDamageCountDown -= deltaTime;
            this.curAttackSpeed = this.baseInfo.attackSpeed * (1 - 0.1);
            this.curMoveSpeed = this.baseInfo.moveSpeed * (1 - 0.5);

            if (this._iceDamageCountDown <= 0) {
                this.curAttackSpeed = this.baseInfo.attackSpeed;
                this.curMoveSpeed = this.baseInfo.moveSpeed;
            }
        }

        //灼烧持续扣血
        if (this._fireDamageCountDown > 0) {
            this._fireDamageCountDown -= deltaTime;

            let countDown = Number((this._fireDamageCountDown).toFixed(2))
            countDown = countDown * 100 % 50;
            if (countDown === 0) {
                // console.log("灼烧扣血", this._fireDamageCountDown);
                let bloodNum = this.baseInfo.hp * 0.05;
                this.refreshBlood(-bloodNum, constant.FIGHT_TIP.REDUCE_BLOOD);
            }
        }

        //检查当前是否碰到障碍或者其他物体导致无法达到目标位置
        if (this._movePattern !== constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
            this._checkMoveInterval += deltaTime;
            if (this._checkMoveInterval >= 0.2) {
                this._checkMoveInterval = 0;
            
                if (this._isStopAttack) {
                    this.playAction({action: constant.MONSTER_ACTION.STOP_MOVE});
                    console.log("###碰到障碍, 停止移动");
                } else {
                    this._prevMoveWorPos.set(this.node.worldPosition);
                }
            }
        }
    }
}
