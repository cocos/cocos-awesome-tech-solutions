import { poolManager } from './../framework/poolManager';
import { playerData } from './../framework/playerData';
import { uiManager } from './../framework/uiManager';
import { Monster } from './monster';
import { GameManager } from './gameManager';
import { _decorator, Component, Quat, MeshColliderComponent, Node, BoxColliderComponent, CylinderColliderComponent, ITriggerEvent, Vec3, Enum, AnimationComponent, CapsuleColliderComponent, ICollisionEvent, math } from 'cc';
import { constant } from '../framework/constant';
import { Arrow } from './arrow';
//碰撞器组件

const { ccclass, property } = _decorator;

const COLLIDER_NAME = Enum ({
    ARROW: 1,//弓箭
    HEART_BIG: 2,//大爱心, 玩家吃到后增加生命上限
    WARP_GATE: 3,//传送门
    NPC_BUSINESS_MAN: 4,//NPC商人
    NPC_WISE_MAN: 5,//NPC智慧老头
})

//管理游戏中若干碰撞器
@ccclass('ColliderItem')
export class ColliderItem extends Component {
    @property({
        type: COLLIDER_NAME,
        displayOrder: 1
    })
    public colliderName: any = COLLIDER_NAME.ARROW;//碰撞体类型名称

    public colliderCom: any = null;
    public ani: AnimationComponent = null!;
    
    public set timer (obj: any) {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }
    
    public static COLLIDER_NAME = COLLIDER_NAME;

    private _curHeartBigQuat: Quat = new Quat();//爱心旋转
    private _timer: any = null;//定时器

    onLoad () {
        this.colliderCom = this.node.getComponent(BoxColliderComponent) || this.node.getComponent(CylinderColliderComponent) || this.node.getComponent(CapsuleColliderComponent) || this.node.getComponent(MeshColliderComponent);

        if (!this.colliderCom) {
            console.error("this node does not have collider component");
        }
    }

    onEnable () {
        if (this.colliderCom.isTrigger) {
            this.colliderCom.on('onTriggerEnter', this._onTriggerEnterCb, this);
        } else {
            this.colliderCom.on('onCollisionEnter', this._onCollisionEnterCb, this);
        }
    }

    onDisable () {
        if (this.colliderCom.isTrigger) {
            this.colliderCom.off('onTriggerEnter', this._onTriggerEnterCb, this);
        } else {
            this.colliderCom.off('onCollisionEnter', this._onCollisionEnterCb, this);
        }
    }

    start () {
    }

    /**
     * 初始化
     */
    public init () {

    }   

    private _onTriggerEnterCb (event: ITriggerEvent) {
       this._hitTarget(event.otherCollider, event.selfCollider);
    }

    private _onCollisionEnterCb (event: ICollisionEvent) {
       this._hitTarget(event.otherCollider, event.selfCollider);
    }

    private _hitTarget (otherCollider: any, selfCollider: any) {
        if (GameManager.isGameOver || !GameManager.isGameStart) {
            return;
        }

        // console.log("getGroup", otherCollider.getGroup());

        if (otherCollider.getGroup() == constant.PHY_GROUP.PLAYER  && GameManager.ndPlayer) {
            switch (this.colliderName) {
                case COLLIDER_NAME.HEART_BIG:
                    GameManager.scriptPlayer.addBlood(300);
                    poolManager.instance.putNode(this.node);
                    GameManager.checkTriggerAll();
                    break;
                case COLLIDER_NAME.WARP_GATE:
                    GameManager.scriptPlayer.playAction({action: constant.PLAYER_ACTION.STOP_MOVE});
                    GameManager.scriptPlayer.scriptCharacterRigid.stopMove();
                    GameManager.ndPlayer.active = false;
                    GameManager.isWin = true;
                    break;
                case COLLIDER_NAME.NPC_BUSINESS_MAN:
                    GameManager.isGamePause = true;
                    GameManager.scriptPlayer.scriptCharacterRigid.stopMove();
                    GameManager.scriptPlayer.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.IDLE, true);
                    if (playerData.instance.isPlayerSkillAllUnlock) {
                        //防错
                        uiManager.instance.showTips("所有技能均已解锁");
                        poolManager.instance.putNode(this.node);
                        GameManager.isGamePause = false;
                    } else {
                        uiManager.instance.hideDialog("fight/fightPanel");
                        uiManager.instance.showDialog("shop/shopPanel", [()=>{
                            GameManager.isGamePause = false;
                            poolManager.instance.putNode(this.node);
                        }], ()=>{}, constant.PRIORITY.DIALOG);
                    }

                    GameManager.checkTriggerAll();
                    break;
                case COLLIDER_NAME.NPC_WISE_MAN:
                    GameManager.isGamePause = true;
                    GameManager.scriptPlayer.scriptCharacterRigid.stopMove();
                    GameManager.scriptPlayer.scriptPlayerModel.playAni(constant.PLAYER_ANI_TYPE.IDLE, true);
                    if (playerData.instance.isPlayerSkillAllUnlock) {
                        uiManager.instance.showTips("所有技能均已解锁");
                        poolManager.instance.putNode(this.node);
                        GameManager.isGamePause = false;
                    } else {
                        uiManager.instance.hideDialog("fight/fightPanel");
                        uiManager.instance.showDialog("skill/skillPanel", [()=>{
                            poolManager.instance.putNode(this.node);
                            GameManager.isGamePause = false;
                        }], ()=>{}, constant.PRIORITY.DIALOG);
                    }

                    GameManager.checkTriggerAll();
                    break;
            }

        } else if (otherCollider.getGroup() === constant.PHY_GROUP.OBSTACLE) {
            //箭碰到游戏中的障碍则回收
            switch (this.colliderName) {
                case COLLIDER_NAME.ARROW:
                    let scriptArrow = this.node.getComponent(Arrow) as Arrow;

                    // if (!GameManager.scriptPlayer.isArrowRebound) {
                        scriptArrow.hideArrow();
                    // } else {
                    //     if (scriptArrow.arrowReboundTimes < 2) {
                    //         scriptArrow.playArrowRebound(selfCollider.node, otherCollider.node);
                    //     } else {
                    //         scriptArrow.hideArrow();
                    //     }
                    // }
                    break;
                default:
                    console.warn("colliderName not found", this.colliderName);
                    break;
            }
        } else if (otherCollider.getGroup() === constant.PHY_GROUP.MONSTER) {
            //箭碰到敌人
            switch (this.colliderName) {
                case COLLIDER_NAME.ARROW:
                    let ndMonster = otherCollider.node as Node;
                    let scriptMonster = ndMonster.getComponent(Monster) as Monster;
                    let scriptArrow = this.node.getComponent(Arrow) as Arrow;

                    //箭是否弹射
                    if (GameManager.scriptPlayer.isArrowLaunch) {
                        if (!scriptArrow.isArrowLaunch) {
                            //第一次弹射
                            scriptArrow.playArrowLaunch(ndMonster);
                        } else {
                            //第二次直接隐藏
                            scriptArrow.hideArrow();
                        }
                    } else if (GameManager.scriptPlayer.isArrowPenetrate) {
                        //箭穿透
                    } else {
                        scriptArrow.hideArrow();
                    }

                    scriptMonster.playHit(scriptArrow.isArrowLaunch);

                    //龙被射到龙改变颜色
                    if (ndMonster.name === "dragon") {
                        //@ts-ignore
                        scriptMonster.changeDragonMat();
                    }
                    break;
                default:
                    console.warn("colliderName not found", this.colliderName);
                    break;
            }
        } 
    }

    update (deltaTime: number) {
        if (GameManager.isGameOver || !GameManager.ndPlayer || !this.node.parent) {
            return;    
        }

        if (this.colliderName === COLLIDER_NAME.HEART_BIG) {
            Quat.fromEuler(this._curHeartBigQuat, 0, 120 * deltaTime, 0);
            this.node.rotate(this._curHeartBigQuat);
        }

    }
}

