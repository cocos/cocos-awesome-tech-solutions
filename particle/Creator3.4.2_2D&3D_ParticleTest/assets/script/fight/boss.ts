import { Monster } from './monster';
import { clientEvent } from './../framework/clientEvent';
import { uiManager } from './../framework/uiManager';
import { Node, ParticleSystemComponent, Vec3, _decorator, AnimationComponent, AnimationState, Material, MeshColliderComponent, MeshRenderer } from 'cc';
import { constant } from '../framework/constant';
import { EffectManager } from '../framework/effectManager';
import { poolManager } from '../framework/poolManager';
import { GameManager } from './gameManager';
import { resourceUtil } from '../framework/resourceUtil';
import { JetFires } from './monsterSkill/jetFires';
import { MonsterModel } from './monsterModel';
import { EnergyBall } from './monsterSkill/energyBall';
import { FireBall } from './monsterSkill/fireBall';
import { Dispersion } from './monsterSkill/dispersion';
import { Tornado } from './monsterSkill/tornado';
import { FireBallBig } from './monsterSkill/fireBallBig';
import { DispersionSurround } from './monsterSkill/dispersionSurround';
import { Laser } from './monsterSkill/laser';
import { AudioManager } from '../framework/audioManager';
import { CharacterRigid } from './characterRigid';
import { util } from '../framework/util';
const { ccclass, property } = _decorator;
//大龙boss组件, 继承monster怪物组件
@ccclass('Boss')
export class Boss extends Monster {
    @property(Node)
    public ndSocketDragonHead: Node = null!;//龙头    

    @property(Material)
    public matDragon: Material = null!;//大龙默认材质

    @property(Material)
    public matDragonHit: Material = null!;//大龙受击后材质变白

    @property(MeshRenderer)
    public meshDragon: MeshRenderer = null!;

    private _countdown: number = 0.2;//闪白倒计时
    private _oriSkillEuler: Vec3 = new Vec3();//技能默认角度
    private _isSkillReleasing: boolean = false;//是否正在释放技能 

    onEnable () {
        clientEvent.on(constant.EVENT_TYPE.MONSTER_MOVE, this._monsterMove, this);
    }

    onDisable () {
        clientEvent.off(constant.EVENT_TYPE.MONSTER_MOVE, this._monsterMove, this);

        //回收预警节点
        this.recycleWarning();
    }

    public init(baseInfo: any, layerInfo: any) {
        this._bloodTipOffsetPos.set(0, 50, 0);
        this._hitEffectPos.set(0, 0.04, 0);

        this.baseInfo = baseInfo;
        this.layerInfo = layerInfo;
        this.isDie = false;

        this.scriptMonsterModel = this.node.getChildByName("body")?.getComponent(MonsterModel) as MonsterModel;
        this.scriptMonsterModel.playAni(constant.MONSTER_ANI_TYPE.IDLE, true);
        this.scriptCharacterRigid = this.node.getComponent(CharacterRigid) as CharacterRigid;

        this._isAllowToAttack = false;
        this._isSkillReleasing = false;
        this._countdown = 0.2;
        
        this.recycleWarning();
        this._refreshSkill();

        this.scriptMonsterModel.scriptMonster = this;

        this.curAttackSpeed = this.baseInfo.attackSpeed;
        this.curMoveSpeed = this.baseInfo.moveSpeed;

        this.meshDragon?.setMaterial(this.matDragon, 0);

        this._movePattern = layerInfo.movePattern ? layerInfo.movePattern : this.baseInfo.movePattern;

        super._getMinLength();
    }

    public refreshBlood (bloodNum: number, tipType: number) {
        clientEvent.dispatchEvent(constant.EVENT_TYPE.REFRESH_BOSS_BLOOD, bloodNum);
        uiManager.instance.showBloodTips(this, tipType, bloodNum, this._bloodTipOffsetPos);
    }

    public showDie () {
        this.scriptCharacterRigid.stopMove();

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
                GameManager.ndBoss = null!;
                poolManager.instance.putNode(this.node);
            }
        });
    }

    public playAttackAni () {
        super.playAttackAni();
        
        this._isSkillReleasing = false;
    }

    /**
     * 向玩家释放技能
     *
     * @param {boolean} [isNormalAttack=false] 是否是普通攻击、反之喷火
     * @return {*} 
     * @memberof Boss
     */
    public releaseSkillToPlayer (isNormalAttack: boolean = false) {
        if (this._isSkillReleasing) {
            return;
        }

        // this.node.forward = Vec3.subtract(this._forWard, GameManager.ndPlayer.worldPosition, this.node.worldPosition).normalize();
        Vec3.negate(this._forWard, this.attackForward);
        this.node.forward = this._forWard;
        //boss是非近战的怪物，必须带技能，这里做个容错
        if (!this.allSkillInfo.length) {
            let offsetLength = util.getTwoNodeXZLength(this.node, GameManager.ndPlayer);
            if (offsetLength <= this._minLength * this._minLengthRatio) {
                GameManager.scriptPlayer.reduceBlood(this.baseInfo);
            }
            return;
        }

        if (isNormalAttack && this.skillInfo.ID !== constant.MONSTER_SKILL.JET_FIRES) {
            this._isSkillReleasing = true;

            resourceUtil.loadEffectRes(`${this.skillInfo.resName}/${this.skillInfo.resName}`).then((prefab: any)=>{
                if (this.isMoving) {
                    return;
                }
    
                let ndMonsterSkill = poolManager.instance.getNode(prefab, GameManager.ndGameManager as Node) as Node;
                ndMonsterSkill.setWorldPosition(this.node.worldPosition.x, 2.5, this.node.worldPosition.z);
                ndMonsterSkill.forward = this.attackForward.negative();
                
                let scriptSkillCollider: any = null!;
                //怪物技能初始化
                switch (this.skillInfo.ID) {
                    case constant.MONSTER_SKILL.ENERGY_BALL:
                        ndMonsterSkill.setWorldPosition(this.ndSocketDragonHead.worldPosition);
                        scriptSkillCollider = ndMonsterSkill.getComponent(EnergyBall) as EnergyBall;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                        break;
                    case constant.MONSTER_SKILL.FIRE_BALL: 
                        ndMonsterSkill.setWorldPosition(this.ndSocketDragonHead.worldPosition);
                        scriptSkillCollider = ndMonsterSkill.getComponent(FireBall) as FireBall;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                        break;
                    case constant.MONSTER_SKILL.DISPERSION:
                        ndMonsterSkill.children.forEach((ndChild: Node, idx: number)=>{
                            let scriptSkillCollider = ndChild.getComponent(Dispersion) as Dispersion;
                            scriptSkillCollider.init(this.skillInfo, this.baseInfo);
                        })
                        break;
                    case constant.MONSTER_SKILL.TORNADO: 
                        ndMonsterSkill.setWorldPosition(this.ndSocketDragonHead.worldPosition);
                        scriptSkillCollider = ndMonsterSkill.getComponent(Tornado) as Tornado;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                        break;
                    case constant.MONSTER_SKILL.FIRE_BALL_BIG:
                        scriptSkillCollider = ndMonsterSkill.getComponent(FireBallBig) as FireBallBig;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                        break;
                    case constant.MONSTER_SKILL.DISPERSION_SURROUND:
                        ndMonsterSkill.children.forEach((ndChild: Node)=>{
                            let scriptSkillCollider = ndChild.getComponent(DispersionSurround) as DispersionSurround;
                            scriptSkillCollider.init(this.skillInfo, this.baseInfo);
                        })
                        break;
                    case constant.MONSTER_SKILL.LASER:
                        ndMonsterSkill.setWorldPosition(this.ndSocketDragonHead.worldPosition);
                        scriptSkillCollider = ndMonsterSkill.getComponent(Laser) as Laser;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                        break;
                }
    
                this._refreshSkill();
            })
        } else if (!isNormalAttack && this.skillInfo.ID === constant.MONSTER_SKILL.JET_FIRES) {
            this._isSkillReleasing = true;

            resourceUtil.loadEffectRes(`${this.skillInfo.resName}/${this.skillInfo.resName}`).then((prefab: any)=>{
                if (this.isMoving) {
                    return;
                }
    
                let ndMonsterSkill = poolManager.instance.getNode(prefab,  this.ndSocketDragonHead) as Node;
                ndMonsterSkill.eulerAngles = this._oriSkillEuler;

                // ndMonsterSkill.forward = this.attackForward.negative();

                let ndChild = ndMonsterSkill.getChildByName("boxCollider") as Node;
                ndChild.active = true;
    
                let scriptSkillCollider = ndMonsterSkill.getComponent(JetFires) as JetFires;
                EffectManager.instance.playTrail(ndMonsterSkill);
                scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);

                AudioManager.instance.playSound(constant.SOUND.JET_FIRE);
    
                let arrParticle: ParticleSystemComponent[]= ndMonsterSkill.getComponentsInChildren(ParticleSystemComponent);
                arrParticle.forEach((element:ParticleSystemComponent)=>{
                    element.simulationSpeed = 1;
                    element?.clear();
                    element?.stop();
                    element?.play();
                })
    
                //播放触发器动画            
                let aniCom = ndMonsterSkill.getComponent(AnimationComponent) as AnimationComponent;
                let aniState: AnimationState;
                let aniName = aniCom.defaultClip?.name;
                if (aniName) {
                    aniCom.getState(aniName).time = 0;
                    aniCom.getState(aniName).sample();
                    aniCom.play();    
    
                    aniState = aniCom.getState(aniName);
                    aniState.speed = GameManager.gameSpeed;
                }
    
                aniCom.once(AnimationComponent.EventType.FINISHED, ()=>{
                    ndChild.active = false;
                })
    
                this.scriptWarning?.hideWarning();   
                
                setTimeout(()=>{
                    poolManager.instance.putNode(ndMonsterSkill);
                }, 4000)  

                this._refreshSkill();
            })
        }
        
    }

    /**
     * 先移动
     *
     * @private
     * @memberof Monster
     */
    public _monsterMove () {
        super._monsterMove();
    }

    /**
     * 大龙受击打后闪白效果
     *
     * @memberof Boss
     */
    public changeDragonMat () {
        if (this._countdown <= 0) {
            this.meshDragon?.setMaterial(this.matDragonHit, 0);
            this._countdown = 0.2;
        }
    }

    lateUpdate (deltaTime: number) {
        if (this._countdown > 0) {
            this._countdown -= deltaTime;

            if (this._countdown <= 0) {
                this.meshDragon?.setMaterial(this.matDragon, 0);
            }
        }
    }
}
