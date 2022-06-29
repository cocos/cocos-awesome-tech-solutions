import { MapManager } from './mapManager';
import { util } from './../framework/util';
import { AudioManager } from './../framework/audioManager';
import { EffectManager } from './../framework/effectManager';
import { playerData } from './../framework/playerData';
import { localConfig } from './../framework/localConfig';
import { PlayerModel } from './playerModel';
import { poolManager } from './../framework/poolManager';
import { clientEvent } from './../framework/clientEvent';
import { _decorator, Component, Quat, Vec3, Node, macro, ProgressBar, clamp, RigidBodyComponent, ICollisionEvent, CapsuleColliderComponent, geometry, PhysicsSystem, BoxColliderComponent, MeshRenderer } from 'cc';
import { constant } from '../framework/constant';
import { GameManager } from './gameManager';
import { resourceUtil } from '../framework/resourceUtil';
import { Arrow } from './arrow';
import { uiManager } from '../framework/uiManager';
import { PlayerBloodBar } from '../ui/fight/playerBloodBar';
import { CharacterRigid } from './characterRigid';

let qt_0 = new Quat();
let v3_0 = new Vec3();
let v3_1 = new Vec3();
let v3_2 = new Vec3();
const ray: geometry.Ray = new geometry.Ray();

const { ccclass, property } = _decorator;
@ccclass('Player')
export class Player extends Component {
    @property(PlayerModel)
    public scriptPlayerModel: PlayerModel = null!;//玩家动画组件播放脚本

    @property(RigidBodyComponent)
    public rigidComPlayer: RigidBodyComponent = null!;

    @property(CapsuleColliderComponent)
    public colliderComPlayer: CapsuleColliderComponent = null!;
    
    public scriptBloodBar: PlayerBloodBar = null!;//血条绑定脚本
    public isMoving: boolean = false;//玩家是否正在移动
    public isPlayRotate: boolean = false;//是否旋转
    public scriptCharacterRigid: CharacterRigid = null!;
    public playerBaseInfo: any = {};//玩家在base.csv的基础数据

    public set isDie (v: boolean) {
        this._isDie = v;

        if (this._isDie) {
            this._showDie();
        }
    }

    public get isDie () {
        return this._isDie;
    }

    //是否拥有形态技能
    public isArrowDouble: boolean = false;//是否拥有技能：弓箭双重射击
    public isArrowPenetrate: boolean = false;//是否拥有技能：弓箭穿透射击
    // public isArrowRebound: boolean = false;//是否拥有技能：弓箭反弹
    public isArrowContinuous: boolean = false;//是否拥有技能：连续射击

    //是否拥有buff技能
    public isArrowIce: boolean = false;//是否拥有技能：冰冻
    public isArrowFire: boolean = false;//是否拥有技能：灼烧

    //是否拥有触发技能
    public isBloodthirsty: boolean = false;//是否拥有技能：嗜血
    public isArrowLightning: boolean = false;//是否拥有技能： 闪电
    public isArrowLaunch: boolean = false;//是否拥有技能：弹射

    //当前"数值技能"值
    public curAttackPower: number = 20;//当前攻击力
    public curDefensePower: number = 1;//当前防御力
    public curAttackSpeed: number = 1;//当前攻击速度
    public curDodgeRate: number = 0;//当前闪避率
    public curCriticalHitRate: number = 0;//当前暴击率，0为不暴击
    public curCriticalHitDamage: number = 0;//当前暴击伤害
    public curHpLimit: number = 0;//当前玩家生命值上限（这个是上限，是生命上限，不是当前生命值）
    public set curMoveSpeed (v: number) {
        this._curMoveSpeed = v;
        this.scriptCharacterRigid.initSpeed(v);
    }

    public get curMoveSpeed () {
        return this._curMoveSpeed;
    }

    //技能数组
    private _arrFormChangeSkill: string[] = [];//玩家当前拥有的形态变化技能10x
    private _arrValueChangeSkill: string[] = [];//玩家数值变化技能20x
    private _arrBuffSkill: string[] = [];//玩家buff技能30x
    private _arrTriggerSkill: string[] = [];//玩家触发技能40x

    private _hp: number = 0;//玩家当前生命值
    private _isDie: boolean = false;//主角是否阵亡
    private _horizontal: number = 0;//水平移动距离
    private _vertical: number = 0;//垂直移动距离
    private _targetAngle: Vec3 = new Vec3();//目标旋转角度
    private _curAngleY: number = 0;//当前Y分量旋转角度
    private _ndTarget: Node = null!;//目标小怪
    private _throwArrowSpeed: number = 30;//弓箭速30
    private _arrowPos: Vec3 = new Vec3();//箭初始化位置
    private _bloodTipOffsetPos: Vec3 = new Vec3(-10, 150, 0);//血量提示和玩家间距
    private _playerMonsterOffset: Vec3 = new Vec3();//小怪和玩家间距
    private _isUseFullAngle: boolean = true;//是否使用360度旋转，否则使用8方向旋转
    private _oriPlayerPos: Vec3 = new Vec3(0, 1.7, 0);//玩家初始世界坐标
    private _oriPlayerScale: Vec3 = new Vec3(4, 4, 4);//玩家初始缩放倍数
    private _oriPlayerAngle: Vec3 = new Vec3(0, -90, 0);//玩家初始角度
    private _curAngle: Vec3 = new Vec3()//当前玩家旋转的角度
    private _curAngle_2: Vec3 = new Vec3();//玩家角度
    private _rotateDirection: Vec3 = new Vec3();//旋转方向
    private _curWorPos: Vec3 = new Vec3();//玩家当前世界坐标
    private _ndRunSmokeEffect: Node = null!;//烟雾特效
    private _originAngle: Vec3 = new Vec3(0, -90, 0);//玩家开始角度
    private _tempAngle: Vec3 = new Vec3();//临时变量，玩家角度
    private _forWard: Vec3 = new Vec3();//朝向
    private _range: number = 0.01;//
    private _curMoveSpeed: number = 0;//当前玩家移动速度
    private _curBlood: number = 0;//当前血量

    onEnable () {
        clientEvent.on(constant.EVENT_TYPE.PARSE_PLAYER_SKILL, this._parsePlayerSkill, this);
        clientEvent.on(constant.EVENT_TYPE.ON_REVIVE, this._onRevive, this);
    }

    onDisable () {
        clientEvent.off(constant.EVENT_TYPE.PARSE_PLAYER_SKILL, this._parsePlayerSkill, this);
        clientEvent.off(constant.EVENT_TYPE.ON_REVIVE, this._onRevive, this);

        if (this.scriptBloodBar) {
            this._curBlood = this.scriptBloodBar.curBlood;
            this.scriptBloodBar.node.destroy();
            this.scriptBloodBar = null!;
        }
    }

    start () {

    }

    public init() {
        this.isMoving = false;
        this.isDie = false;
        this.isPlayRotate = false;

        this.isArrowDouble = false;
        this.isArrowPenetrate = false;
        // this.isArrowRebound = false;
        this.isArrowContinuous = false;
        this.isArrowIce = false;
        this.isArrowFire = false;
        this.isBloodthirsty = false;
        this.isArrowLightning = false;
        this.isArrowLaunch = false;

        this._horizontal = 0;
        this._vertical = 0;

        this._curBlood = 0;
        this._ndTarget = null!;

        this.scriptCharacterRigid = this.node.getComponent(CharacterRigid) as CharacterRigid;

        //获取玩家基础数据
        this.playerBaseInfo = localConfig.instance.queryByID("base", constant.BASE.PLAYER_01);
        
        if (this.playerBaseInfo) {
            //设置玩家大小
            let arrScale = util.parseStringData(this.playerBaseInfo.scale, ",");
            this._oriPlayerScale.set(arrScale[0], arrScale[1], arrScale[2]);
            this.node.setScale(this._oriPlayerScale);

            this.resetPlayerWorPos();

            //设置角度
            let arrAngle = util.parseStringData(this.playerBaseInfo.angle, ",");
            this._oriPlayerAngle.set(arrAngle[0], arrAngle[1], arrAngle[2]);
            this.node.eulerAngles = this._oriPlayerAngle;

            this.curAttackPower = this.playerBaseInfo.attackPower;
            this.curDefensePower = this.playerBaseInfo.defensePower;
            this.curAttackSpeed = this.playerBaseInfo.attackSpeed;
            this.curMoveSpeed = this.playerBaseInfo.moveSpeed;
            this.curDodgeRate = this.playerBaseInfo.dodgeRate;
            this.curCriticalHitRate = this.playerBaseInfo.criticalHitRate;
            this.curCriticalHitDamage = this.playerBaseInfo.criticalHitDamage;
            this.curHpLimit = this.playerBaseInfo.hp;

            this._hp = this.playerBaseInfo.hp;
        }

        this._parsePlayerSkill(true);

        //展示血条
        uiManager.instance.showPlayerBloodBar(this, this._hp, this._hp, ()=>{
            // if (GameManager.isTesting) {
            //     this.addBlood(2000, true);
            // }
        }, this._bloodTipOffsetPos);

        this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.IDLE, true);

        this.scriptPlayerModel.init();

        this.rigidComPlayer.clearState();
    }

    /**
     * 每次成功进入新的一层则更新玩家状态
     *
     * @memberof Player
     */
    public resetPlayerState () {
        this.node.active = true;
        this.rigidComPlayer.clearState();
        this.resetPlayerWorPos();
        this.node.eulerAngles = this._originAngle;
        this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.IDLE, true);
        //将未播放结束的特效节点隐藏，避免到下一层还在展示特效
        this.node.children.forEach((ndChild: Node)=>{
            if (ndChild.name !== "body") {
                ndChild.active = false;
            }
        })

        if (!this.scriptBloodBar) {
            uiManager.instance.showPlayerBloodBar(this, this.curHpLimit, this._curBlood, ()=>{
            }, this._bloodTipOffsetPos);
        }
    }

    /**
     * 根据an、anS两张图设置不同的玩家初始位置
     */
    private resetPlayerWorPos () {
        let arrPosition = util.parseStringData(this.playerBaseInfo.position, ",");

        if (MapManager.isMapAnS) {
            this._oriPlayerPos.set(-16.742, arrPosition[1], -0.719);
        } else {
            //设置坐标
            this._oriPlayerPos.set(arrPosition[0], arrPosition[1], arrPosition[2]);            
        }

        this.node.setPosition(this._oriPlayerPos);
    }

    /**
     * 解析玩家当前技能
     * 
     * @param {boolean} isCoverSkill 是否重新覆盖技能，主角初始化的要，其他时候不需要
     * @memberof Player
     */
    private _parsePlayerSkill (isCoverSkill: boolean = false) {
        let arrSkill = playerData.instance.playerInfo.arrSkill;

        let arrFormChangeSkill: string[] = [];
        let arrValueChangeSkill: string[] = [];
        let arrBuffSkill: string[] = [];
        let arrTriggerSkill: string[] = [];

        if (arrSkill.length) {
            arrSkill.forEach((item: string) => {
                if (item.startsWith(constant.PLAYER_SKILL_USE.FORM_CHANGE)) {
                    arrFormChangeSkill.push(item);
                } else if (item.startsWith(constant.PLAYER_SKILL_USE.VALUE)) {
                    arrValueChangeSkill.push(item);
                } else if (item.startsWith(constant.PLAYER_SKILL_USE.BUFF)) {
                    arrBuffSkill.push(item);
                } else if (item.startsWith(constant.PLAYER_SKILL_USE.TRIGGER)) {
                    arrTriggerSkill.push(item);
                }
            });
        }

        this._arrFormChangeSkill = arrFormChangeSkill;
        this._arrValueChangeSkill = arrValueChangeSkill;
        this._arrBuffSkill = arrBuffSkill;
        this._arrTriggerSkill = arrTriggerSkill;

        // console.log("###_arrFormChangeSkill", this._arrFormChangeSkill);
        // console.log("###_arrValueChangeSkill", this._arrValueChangeSkill);
        // console.log("###_arrBuffSkill", this._arrBuffSkill);
        // console.log("###_arrTriggerSkill", this._arrTriggerSkill);

        if (this._arrFormChangeSkill.length) {
            this.isArrowDouble = this._arrFormChangeSkill.indexOf(constant.PLAYER_SKILL.ARROW_DOUBLE) !== -1;
            this.isArrowPenetrate = this._arrFormChangeSkill.indexOf(constant.PLAYER_SKILL.ARROW_PENETRATE) !== -1;
            // this.isArrowRebound = this._arrFormChangeSkill.indexOf(constant.PLAYER_SKILL.ARROW_REBOUND) !== -1;
            this.isArrowContinuous = this._arrFormChangeSkill.indexOf(constant.PLAYER_SKILL.ARROW_CONTINUOUS) !== -1;
        } else {
            this.isArrowDouble = false;
            this.isArrowPenetrate = false;
            // this.isArrowRebound = false;
            this.isArrowContinuous = false;
        }

        //数值技能只使用一次, 注意：每次获得到需用乘法都是用当前值去乘，而不是乘以最开始的值
        if (this._arrValueChangeSkill.length) {
            //攻击力提升百分比
            let oriAttackPower = this.playerBaseInfo.attackPower;
            let curAttackPower = oriAttackPower;
            //攻击力1
            let raiseAttackPowerRate_1 = this.getValueSkillRate(constant.PLAYER_SKILL.RAISE_ATTACK_01);
            curAttackPower = oriAttackPower * (1 + raiseAttackPowerRate_1);
            //攻击力2
            let raiseAttackPowerRate_2 = this.getValueSkillRate(constant.PLAYER_SKILL.RAISE_ATTACK_02);
            this.curAttackPower = curAttackPower * (1 + raiseAttackPowerRate_2);
            
            //闪避率提升百分比
            let oriDodgeRate = this.playerBaseInfo.dodgeRate;
            let raiseDodgeRate = this.getValueSkillRate(constant.PLAYER_SKILL.RAISE_DODGE);
            this.curDodgeRate = oriDodgeRate + raiseDodgeRate;//注：以加法形式增加

            //攻速提升百分比
            let oriAttackSpeed = this.playerBaseInfo.attackSpeed;
            let curAttackSpeed = oriAttackSpeed;
            //攻速1
            let raiseAttackSpeedRate_1 = this.getValueSkillRate(constant.PLAYER_SKILL.RAISE_ATTACK_SPEED_01);
            curAttackSpeed = oriAttackSpeed * (1 + raiseAttackSpeedRate_1);
            //攻速2
            let raiseAttackSpeedRate_2 = this.getValueSkillRate(constant.PLAYER_SKILL.RAISE_ATTACK_SPEED_02);
            this.curAttackSpeed = curAttackSpeed * (1 + raiseAttackSpeedRate_2);

            if (!isCoverSkill) {
                let oriHpLimit = this.playerBaseInfo.hp;
                let raiseHpLimitRate = this.getValueSkillRate(constant.PLAYER_SKILL.RAISE_HP_LIMIT);
                let offsetHp = oriHpLimit * raiseHpLimitRate;
                let curHpLimit = oriHpLimit + offsetHp;

                if (curHpLimit > this.curHpLimit) {
                    this.addBlood(offsetHp, true);
                    this.curHpLimit = curHpLimit;
                    this._hp += offsetHp;
                }
            }

            //移速提升百分比
            let oriMoveSpeed = this.playerBaseInfo.moveSpeed;
            let raiseMoveSpeedRate = this.getValueSkillRate(constant.PLAYER_SKILL.MOVE_SPEED);
            this.curMoveSpeed = oriMoveSpeed * (1 + raiseMoveSpeedRate);

            //暴击+爆伤提升百分比
            let oriCriticalHitRate = this.playerBaseInfo.criticalHitRate;
            let oriCriticalHitDamage = this.playerBaseInfo.criticalHitDamage;
            let arrCritical_1: any = [0, 0];//暴击率,暴击伤害比
            let arrCritical_2: any = [0, 0];//暴击率,暴击伤害比
            arrCritical_1 = this.getValueSkillRateArr(constant.PLAYER_SKILL.RAISE_CRITICAL_HIT_DAMAGE_01);
            arrCritical_2 = this.getValueSkillRateArr(constant.PLAYER_SKILL.RAISE_CRITICAL_HIT_DAMAGE_02);

            let raiseCriticalHitRate = arrCritical_1[0] + arrCritical_2[0];
            let raiseCriticalHitDamage = arrCritical_1[1] + arrCritical_2[1];

            if (raiseCriticalHitRate) {
                this.curCriticalHitRate = oriCriticalHitRate + raiseCriticalHitRate;//注：以加法形式增加
            }
            
            if (raiseCriticalHitDamage) {
                this.curCriticalHitDamage = oriCriticalHitDamage + raiseCriticalHitDamage;//注：以加法形式增加
            }
        } else {
            this.curAttackPower = this.playerBaseInfo.attackPower;
            this.curAttackSpeed = this.playerBaseInfo.attackSpeed;
            this.curMoveSpeed = this.playerBaseInfo.moveSpeed;
            this.curDodgeRate = this.playerBaseInfo.dodgeRate;
            this.curCriticalHitRate = this.playerBaseInfo.criticalHitRate;
            this.curCriticalHitDamage = this.playerBaseInfo.criticalHitDamage;
            this.curHpLimit = this.playerBaseInfo.hp;
        }

        if (this._arrBuffSkill.length) {
            this.isArrowIce = this._arrBuffSkill.indexOf(constant.PLAYER_SKILL.ARROW_ICE) !== -1;
            this.isArrowFire = this._arrBuffSkill.indexOf(constant.PLAYER_SKILL.ARROW_FIRE) !== -1;
        } else {
            this.isArrowIce = false;
            this.isArrowFire = false;
        }

        if (this._arrTriggerSkill.length) {
            this.isArrowLightning = this._arrTriggerSkill.indexOf(constant.PLAYER_SKILL.ARROW_LIGHTNING) !== -1;
            this.isArrowLaunch = this._arrTriggerSkill.indexOf(constant.PLAYER_SKILL.ARROW_LAUNCH) !== -1;
            this.isBloodthirsty = this._arrTriggerSkill.indexOf(constant.PLAYER_SKILL.BLOODTHIRSTY) !== -1;
        } else {
            this.isArrowLightning = false;  
            this.isArrowLaunch = false;
            this.isBloodthirsty = false;
        }
    }

    /**
     * 返回当前数值技能提升比例
     */
    private getValueSkillRate (key: string) {
        let rate = 0;//百分比

        if (this._arrValueChangeSkill.indexOf(key) !== -1) {
            let skillInfo = localConfig.instance.queryByID("playerSkill", key);
            rate = Number(skillInfo.value);
        }

        return rate ?? 0;
    }

    /**
     * 返回当前数值技能提升比例数组
     */
     private getValueSkillRateArr (key: string) {
        let arrRate: any[] = [];

        if (this._arrValueChangeSkill.indexOf(key) !== -1) {
            let skillInfo = localConfig.instance.queryByID("playerSkill", key);
            arrRate = skillInfo.value.split("#");
        }

        arrRate = arrRate.map((item: number)=>{
            return item ? Number(item) : 0;
        })

        if (arrRate.length === 0) {
            arrRate = [0, 0];
        }

        return arrRate;
    }

    /**
     * 玩家行为
     *
     * @param {*} obj
     * @memberof Player
     */
    public playAction (obj: any) {
        if (this.isDie) {
            return;
        }

        switch (obj.action) {
            case constant.PLAYER_ACTION.MOVE:
                let angle = obj.value + 135;

                let radian = angle * macro.RAD;
                this._horizontal = Math.round(Math.cos(radian) * 1);
                this._vertical = Math.round(Math.sin(radian) * 1);  
                this.isMoving = true;
                this._curAngleY = obj.value;
                this._curAngleY = this._curAngleY < 0 ? this._curAngleY + 360 : this._curAngleY > 360 ? this._curAngleY - 360 : this._curAngleY;
                break;
            case constant.PLAYER_ACTION.STOP_MOVE:
                this._horizontal = 0;
                this._vertical = 0;
                this._onPlayerStopMove();
                this.isMoving = false;
                this.rigidComPlayer.clearState();
                this.scriptCharacterRigid.stopMove();
                break;
            default:
                break;
        }
    }

    /**
     * 玩家不移动时：a) 地图上没有怪物：在原地待机。b) 地图上有怪物：向怪物方向攻击。
     *
     * @private
     * @memberof Player
     */
    private _onPlayerStopMove () {
        if (!GameManager.isGameOver && GameManager.isGameStart) {
            if (GameManager.arrMonster.length) {
                let isMonsterSurvive = GameManager.arrMonster.some((item: Node)=>{
                    return item.parent !== null; 
                })
                
                if (isMonsterSurvive) {
                    this._attackMonster();
                }
            } else {
                this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.IDLE, true);
            }
        }
    }

    /**
     * 向怪物方向攻击
     */
    private _attackMonster () {
        this._ndTarget = GameManager.getNearestMonster()!;

        if (!this._ndTarget || this.isDie) {
            return;
        }

        //先转向目标小怪
        let screenPos1 = GameManager.mainCamera?.worldToScreen(this._ndTarget.worldPosition) as Vec3;
        let screenPos2 = GameManager.mainCamera?.worldToScreen(this.node.worldPosition) as Vec3;
        Vec3.subtract(this._playerMonsterOffset, screenPos1, screenPos2);
        let angleY = Math.round(Math.atan2(this._playerMonsterOffset.y, this._playerMonsterOffset.x) * 180 / Math.PI);
        // if (angleY !== this._curAngleY) {
            this.playAction({action: constant.PLAYER_ACTION.MOVE, value: angleY});
        // }
        
        this.isMoving = false;

        //再播放攻击动画
        this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.ATTACK, false, ()=>{
            if (!this.scriptPlayerModel.isRunning) {
                this._attackMonster();                
            }
        });
    }

    /**
     * 向敌人射箭
     *
     * @returns
     * @memberof Player
     */
    public throwArrowToEnemy () {
        //todo：射击摇摆
        this.node.forward = Vec3.subtract(this._forWard, this.node.worldPosition, this._ndTarget.worldPosition).normalize().negative();

        //使用形态变换技能
        if (this._arrFormChangeSkill.length) {
            //使用技能
            if (this.isArrowDouble) {
                if (this.isArrowContinuous) {
                    this._initArrow("arrowDoubleContinuous");
                } else {
                    this._initArrow("arrowDouble");
                }
            } else {
                if (this.isArrowContinuous) {
                    this._initArrow("arrowSingleContinuous");
                } else {
                    this._initArrow("arrowSingle");
                }
            } 
            
            this._arrFormChangeSkill.forEach((item: string)=>{
                let skillInfo = localConfig.instance.queryByID("playerSkill", String(item));

                if (item === constant.PLAYER_SKILL.ARROW_REVERSE || item === constant.PLAYER_SKILL.ARROW_SIDE || item === constant.PLAYER_SKILL.ARROW_UMBRELLA) {
                    this._initArrow(skillInfo.resName);
                }
            })
        } else {
            //没有技能则默认连续射单只箭
            this._initArrow("arrowSingle");
        }
    }

    /**
     * 初始化箭
     *
     * @private
     * @param {string} arrowName
     * @memberof Player
     */
    private _initArrow (arrowName: string) {
        resourceUtil.loadModelRes(`weapon/arrow/${arrowName}`).then((prefab: any)=>{
            if (this.isMoving) {
                return;
            }
            let ndArrow = poolManager.instance.getNode(prefab, GameManager.ndGameManager as Node) as Node;
            let playerWorPos = this.node.worldPosition;
            this._arrowPos.set(playerWorPos.x, 3, playerWorPos.z);

            // if (GameManager.isTesting) {
            //     this._arrowPos.set(playerWorPos.x, -3, playerWorPos.z);
            // }
            
            ndArrow.setWorldPosition(this._arrowPos);
            // ndArrow.eulerAngles = Vec3.ZERO;
            // ndArrow.eulerAngles = ndArrow.eulerAngles.add(this.node.eulerAngles);
            ndArrow.eulerAngles = this.node.eulerAngles;
            
            ndArrow.children.forEach((ndArrowItem: Node)=>{
                let scriptArrowItem = ndArrowItem.getComponent(Arrow) as Arrow;
                
                scriptArrowItem.init(this._throwArrowSpeed, this.node.worldPosition);
            })
        })
    }

    /**
     * 玩家加血、增加血量上限
     *
     * @param {number} bloodNum
     * @param {boolean} [isIncreaseLimit]
     * @memberof Player
     */
    public addBlood (bloodNum: number, isIncreaseLimit?: boolean) {
        EffectManager.instance.playEffect(this.node,"recovery/recovery", false, true);
        uiManager.instance.showBloodTips(this, constant.FIGHT_TIP.ADD_BLOOD, bloodNum, this._bloodTipOffsetPos);
        this.scriptBloodBar.refreshBlood(bloodNum, isIncreaseLimit);

        AudioManager.instance.playSound(constant.SOUND.RECOVERY);
    }

    /**
     * 玩家扣血
     *
     * @param {*} baseInfo 敌人基础信息
     * @return {*} 
     * @memberof Player
     */
    public reduceBlood (baseInfo: any) {
        if (this.isDie) {
            return;
        }

        AudioManager.instance.playSound(constant.SOUND.HIT_PLAYER);  
        
        if (Math.random() > this.playerBaseInfo.dodgeRate) {
            //扣血
            let tipType = constant.FIGHT_TIP.REDUCE_BLOOD;
            //敌人扣到
            let damage = baseInfo.attackPower * GameManager.attackAddition * (1 - this.playerBaseInfo.defensePower / (this.playerBaseInfo.defensePower + 400));
            let isCriticalHit = Math.random() <= baseInfo.criticalHitRate;//是否暴击
            if (isCriticalHit) {
                damage = damage * baseInfo.criticalHitDamage;
                tipType = constant.FIGHT_TIP.CRITICAL_HIT;
            }

            uiManager.instance.showBloodTips(this, tipType, -damage, this._bloodTipOffsetPos);
            this.scriptBloodBar.refreshBlood(-damage);
        }
    }

    /**
     * 奔跑的时候加个烟雾
     *
     * @memberof Player
     */
    public playRunSmoke () {
        // console.log("展示烟雾");

        if (!this._ndRunSmokeEffect) {
            resourceUtil.loadEffectRes("runSmoke/runSmoke").then((pf: any)=>{
                this._ndRunSmokeEffect = poolManager.instance.getNode(pf, this.node);
                this._ndRunSmokeEffect.active = true;    
                EffectManager.instance.playTrail(this._ndRunSmokeEffect);
            });
        } else {
            this._ndRunSmokeEffect.active = true;
            EffectManager.instance.playTrail(this._ndRunSmokeEffect);
        }
    }

    /**
     * 攻击的时候隐藏烟雾
     *
     * @memberof Player
     */
    public hideRunSmoke () {
        if (this._ndRunSmokeEffect && this._ndRunSmokeEffect.active) {
            this._ndRunSmokeEffect.active = false;
            // console.log("隐藏烟雾");
        }
    }

    /**
     * 预加载箭
     *
     * @private
     * @memberof GameManager
     */
    public preloadArrow (callback: Function) {
        let loadNum = 1;
        let loadArrow = (arrowName: string) => {
            resourceUtil.loadModelRes(`weapon/arrow/${arrowName}`).then((prefab: any)=>{
                let ndArrow = poolManager.instance.getNode(prefab, GameManager.ndGameManager as Node) as Node;
                ndArrow.setWorldPosition(new Vec3(0, 30, 0));

                ndArrow.children.forEach((ndArrowItem: Node)=>{
                    let scriptArrowItem = ndArrowItem.getComponent(Arrow) as Arrow;
                    scriptArrowItem.init(this._throwArrowSpeed, this.node.worldPosition);
                })

                loadNum -= 1;
                if (loadNum === 0) {
                    callback();
                }
            })
        }

        //没有技能,默认单只箭
        if (this._arrFormChangeSkill.length) {
            //使用技能
            if (this.isArrowDouble) {
                if (this.isArrowContinuous) {
                    loadArrow("arrowDoubleContinuous");
                } else {
                    loadArrow("arrowDouble");
                }
            } else {
                if (this.isArrowContinuous) {
                    loadArrow("arrowSingleContinuous");
                } else {
                    loadArrow("arrowSingle");
                }
            } 
            
            this._arrFormChangeSkill.forEach((item: string)=>{
                let skillInfo = localConfig.instance.queryByID("playerSkill", String(item));
                if (item === constant.PLAYER_SKILL.ARROW_REVERSE || item === constant.PLAYER_SKILL.ARROW_SIDE || item === constant.PLAYER_SKILL.ARROW_UMBRELLA) {
                    loadNum += 1;
                    loadArrow(skillInfo.resName);
                }
            })
        } else {
            //默认连续射单只箭
            loadArrow("arrowSingle");
        }
    }

    private _showDie () {
        this.scriptCharacterRigid.stopMove();
        AudioManager.instance.playSound(constant.SOUND.PLAYER_01_DIE);

        this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.DIE, false, ()=>{
            GameManager.isWin = false;
        });
    }

    /**
     * 玩家复活
     */
     private _onRevive () {
        GameManager.isGamePause = false;
        this.addBlood(this.curHpLimit * 0.5);
        this.scriptBloodBar.node.active = true;

        this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.REVIVE, false, ()=>{
            this.isDie = false;
            this.playAction({action: constant.PLAYER_ACTION.STOP_MOVE});
            clientEvent.dispatchEvent(constant.EVENT_TYPE.MONSTER_MOVE);
        });

        AudioManager.instance.playSound(constant.SOUND.REVIVE);  
    }

    update (deltaTime: number) {
        if (!GameManager.isGameStart || GameManager.isGameOver || GameManager.isGamePause || this.isDie) {
            return;
        }

        //玩家旋转
        if (this.isPlayRotate) {
            //当前玩家角度
            this._tempAngle.set(this.node.eulerAngles);
            this._tempAngle.y = this._tempAngle.y < 0 ? this._tempAngle.y + 360 : this._tempAngle.y;

            this.node.eulerAngles = this._tempAngle;

            this._curAngle.set(0, this._tempAngle.y, 0);

            if (this._horizontal === 0 && this._vertical === 0) {
                this._range = 0.1;
            } else {
                this._range = 0.01;
            }

            //第二个参数越小朝向敌人越精确
            let isEqual = this._curAngle.equals(this._targetAngle, this._range);

            if (!isEqual) {
                Vec3.lerp(this._curAngle, this._curAngle, this._targetAngle, 0.167);
                this.node.eulerAngles = this._curAngle;
            } else {
                this.isPlayRotate = false;
                this.node.eulerAngles = this._targetAngle;
            }
        }

        if (this._horizontal !== 0 || this._vertical !== 0) {
            //计算出旋转角度
            this._rotateDirection.set(this._horizontal, 0, -this._vertical);
            this._rotateDirection.normalize();
            Quat.fromViewUp(qt_0, this._rotateDirection);
            Quat.toEuler(v3_0, qt_0);
            v3_0.y = v3_0.y < 0 ? v3_0.y + 360 : v3_0.y;

            // console.log("v3_0", v3_0.y);

            this.isPlayRotate = true;
            
            //设置当前玩家角度为正数
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
                    this._targetAngle.set(0, this._targetAngle.y, 0);

                    if (Math.abs(this._targetAngle.y - this._curAngle_2.y) > 180) {
                        if (this._targetAngle.y > this._curAngle_2.y) {
                            this._targetAngle.y -= 360;
                        } else {
                            this._targetAngle.y += 360;
                        }
                    }

                    // console.log("this._targetAngle.y", this._targetAngle.y);
            } else {
                this.isPlayRotate = false;
                this.node.eulerAngles = v3_0;
            }

            if (!this.isMoving) {
                return;
            }

            this.scriptCharacterRigid.move(this._rotateDirection.x * this.curMoveSpeed * 0.5 * deltaTime, this._rotateDirection.z * this.curMoveSpeed * 0.5 * deltaTime);

            if (!this.scriptPlayerModel.isRunning && !this.isDie) {
                this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.RUN, true);
            }
        } else {
            if (!this.isDie && !this.scriptPlayerModel.isIdle && !this.scriptPlayerModel.isAttacking) {
                this.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.IDLE, true);
                this.scriptCharacterRigid.stopMove();
            }
        }
    }

    //检查玩家和四周meshRenderer是否碰撞
    // private _checkIsHitWall () {
    //     let isHitObstacle = false;
    //     let aabb1: geometry.AABB = this.meshComPlayer.model?.modelBounds as geometry.AABB;
        
    //     for (let i = 0; i < GameManager.arrMeshComAn.length; i++) {
    //         const element = GameManager.arrMeshComAn[i];
    //         let aabb2: geometry.AABB = element.model?.modelBounds as geometry.AABB;
    //         let obb1: geometry.OBB = new geometry.OBB();
    //         let obb2: geometry.OBB = new geometry.OBB();
    //         obb1.halfExtents = aabb1.halfExtents;
    //         obb2.halfExtents = aabb2.halfExtents;
    //         obb1.translateAndRotate(this.meshComPlayer.node.worldMatrix, this.meshComPlayer.node.worldRotation, obb1);
    //         obb2.translateAndRotate(element.node.worldMatrix, element.node.worldRotation, obb2);
    //         console.log(geometry.intersect.obbWithOBB(obb1, obb2));  
    //         isHitObstacle = Boolean(geometry.intersect.obbWithOBB(obb1, obb2));
    //         if (isHitObstacle) {
    //             break;
    //         }
    //     }
    //     this._isHitObstacle = isHitObstacle;
    // }
}
