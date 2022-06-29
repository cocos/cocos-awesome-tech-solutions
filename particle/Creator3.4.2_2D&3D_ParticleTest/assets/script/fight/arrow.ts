import { AudioManager } from './../framework/audioManager';
import { util } from './../framework/util';
import { GameManager } from './gameManager';
import { poolManager } from './../framework/poolManager';
import { _decorator, Component, Node, Vec3, Quat, ParticleSystemComponent, math } from 'cc';
import { resourceUtil } from '../framework/resourceUtil';
import { constant } from '../framework/constant';
//单只弓箭组件
const { ccclass, property } = _decorator;
@ccclass('Arrow')
export class Arrow extends Component {
    public isAutoRotate: boolean = true;//箭是否自动调整角度
    public isArrowLaunch: boolean = false;//箭是否弹射
    // public isArrowRebound: boolean = false;//箭是否在墙上反弹
    // public arrowReboundTimes: number = 0;//箭反弹次数
    
    private _ndBody: Node = null!;//放弓箭特效的节点
    private _curSpeed: number = 0;//当前速度
    private _targetSpeed: number = 0;//目标速度
    private _oriPos: Vec3 = null!;//初始默认位置
    private _oriEulerAngles: Vec3 = null!//初始默认角度
    private _offsetPos: Vec3 = new Vec3();//和玩家之间的向量差
    private _curWorPos: Vec3 = new Vec3();//当前节点世界坐标
    private _disappearRange: number = 25;//箭节点超过玩家这个范围则隐藏
    private _isLoadEffectOver: boolean = false;//是否已经加载完所有特效
    private _isNeedShowEffect: boolean = false;//是否需要特效
    private _targetWorPos: Vec3 = new Vec3();//箭的下次目标位置
    private _curEulerAngles: Vec3 = new Vec3();//当前角度
    private _oriForward: Vec3 = null!;//初始朝向
    private _curForward: Vec3 = new Vec3();//当前朝向
    private _releaseWorPos: Vec3 = new Vec3();//技能释放位置的世界坐标
    private _offsetPos_1: Vec3 = new Vec3();//向量差
    private _offsetPos_2: Vec3 = new Vec3();//向量差
    private _cross: Vec3 = new Vec3();//两个向量叉乘
    
    start () {
        // [3]
    }

    /**
    * 初始化 
    */
    public init (speed: number, releaseWorPos: Vec3) {
        this._releaseWorPos.set(releaseWorPos);

        if (!this._ndBody) {
            this._ndBody = this.node.getChildByName("body") as Node;
        }

        this._isLoadEffectOver = false;
        this._isNeedShowEffect = false;
        
        this.isArrowLaunch = false;
        // this.isArrowRebound = false;
        // this.arrowReboundTimes = 0;

        if (!this._oriPos) {
            this._oriPos = this.node.position.clone();
        }

        if (!this._oriEulerAngles) {
            this._oriEulerAngles = this.node.eulerAngles.clone();
        }

        if (!this._oriForward) {
            this._oriForward = this.node.forward.clone();
        }

        this.node.active = false;
        this.node.setPosition(this._oriPos);
        this.node.eulerAngles = this._oriEulerAngles;
        this._curForward.set(this._oriForward);

        this._targetSpeed = speed;
        this._curSpeed = speed * 0.5;

        this._ndBody.children.forEach((ndChild: Node)=>{
            if (ndChild.name.startsWith("arrow") ) {
                ndChild.active = false;
            }
        })

        let isHasIce = GameManager.scriptPlayer.isArrowIce;
        let isHasFire = GameManager.scriptPlayer.isArrowFire;
        let isHasLightning = GameManager.scriptPlayer.isArrowLightning;

        //根据玩家拥有的不同技能展示对应特效
        if (isHasFire || isHasIce || isHasLightning) {
            this._isNeedShowEffect = true;
           
            if (isHasFire && isHasIce && isHasLightning) {
                this._showTrail("arrowAll");
            } else {
                if (isHasFire && isHasIce || isHasFire && isHasLightning || isHasIce && isHasLightning) {
                    if (isHasFire && isHasIce) {
                        this._showTrail("arrowFireIce");
                        AudioManager.instance.playSound(constant.SOUND.FIRE);  
                    } else if (isHasLightning && isHasFire) {
                        this._showTrail("arrowLightningFire");
                        AudioManager.instance.playSound(constant.SOUND.LIGHTNING);  
                    } else if (isHasLightning && isHasIce) {
                        this._showTrail("arrowLightningIce");
                        AudioManager.instance.playSound(constant.SOUND.ICE);  
                    }
                } else {
                    if (isHasFire) {
                        this._showTrail("arrowFire");
                        AudioManager.instance.playSound(constant.SOUND.FIRE);  
                    } else if (isHasIce) {
                        this._showTrail("arrowIce");
                        AudioManager.instance.playSound(constant.SOUND.ICE);  
                    } else if (isHasLightning) {
                        this._showTrail("arrowLightning");
                        AudioManager.instance.playSound(constant.SOUND.LIGHTNING);  
                    }
                }
            }
        } else {
            //不展示特效
            this._ndBody.children.forEach((ndChild: Node)=>{
                if (ndChild.name.startsWith("arrow")) {
                    ndChild.active = false;
                }
            })

            this.node.active = true;
            
            if (GameManager.isGameStart) {
                AudioManager.instance.playSound(constant.SOUND.LOOSE);  
            }
        }
    }

    /**
     * 展示箭的特效拖尾
     *
     * @private
     * @param {string} effectName
     * @memberof Arrow
     */
    private _showTrail (effectName: string) {
        let ndTrail: Node | null = this._ndBody.getChildByName(effectName);
        if (ndTrail) {
            ndTrail.active = true;
            this.node.active = true;
            this._isLoadEffectOver = true;
        } else {
            resourceUtil.loadEffectRes(`arrow/${effectName}`).then((pf: any)=>{
                ndTrail = poolManager.instance.getNode(pf, this._ndBody);
                this.node.active = true;
                this._isLoadEffectOver = true;
            });
        }
    }

    /**
     *  回收弓箭组，在weapon/arrow下
     *
     * @memberof Arrow
     */
    public recycleArrowGroup () {
        if (this.node.parent) {
            poolManager.instance.putNode(this.node.parent);
        }
    }

    /**
     * 击中目标,隐藏箭
     *
     * @memberof Arrow
     */
    public hideArrow () {
        if (!this.node.parent) {
            return;
        }

        //清除拖尾特效残留
        let arrParticle:  ParticleSystemComponent[]= this._ndBody.getComponentsInChildren(ParticleSystemComponent);
        arrParticle.forEach((item: ParticleSystemComponent)=>{
            item.simulationSpeed = 1;
            item?.clear();
            item?.stop();
        })

        this.node.active = false;

        //如果弓箭组里所有的箭都隐藏了则回收整个弓箭组
        let isAllArrowHide = this.node.parent?.children.every((ndArrow: Node)=>{
            return ndArrow.active === false;
        })

        if (isAllArrowHide) {
            this.recycleArrowGroup();
        }
    }

    /**
     * 箭弹射给一定范围内的某个敌人
     *
     * @param {Node} ndMonster
     * @memberof Arrow
     */
    public playArrowLaunch (ndMonster: Node) {
        this.isArrowLaunch = true;

        let arrTargets =  GameManager.getNearbyMonster(ndMonster);
        
        if (arrTargets.length) {
            let ndTarget = arrTargets[0];
            this._offsetPos_1.set(this._releaseWorPos.x - this.node.worldPosition.x, 0, this._releaseWorPos.z - this.node.worldPosition.z);
            this._offsetPos_2.set(this.node.worldPosition.x - ndTarget.worldPosition.x, 0, this.node.worldPosition.z - ndTarget.worldPosition.z);
            //两个向量之间弧度
            let radian = Vec3.angle(this._offsetPos_1, this._offsetPos_2);
            //角度
            let angle = math.toDegree(radian);
            //叉乘
            Vec3.cross(this._cross, this._offsetPos_1, this._offsetPos_2);
            //判断正反角度
            if (this._cross.y > 0) {
                this._curEulerAngles.y = angle;
            } else {
                this._curEulerAngles.y = -angle;
            }

            this.node.eulerAngles = this._curEulerAngles;
        }
    }

    //箭在目标墙上反弹
    // public playArrowRebound (ndArrow: Node, ndObstacle: Node) {
    //     this.arrowReboundTimes += 1;
    //     //碰撞面对应的法向量
    //     let v_normal_1 = new Vec3();
    //     //旋转后的法向量
    //     let v_normal_2 = new Vec3();
    //     if (ndObstacle.name == "collider1" || ndObstacle.name === "collider2") {
    //         v_normal_1.set(1, 0, 0);
    //     } else {
    //         v_normal_1.set(0, 0, 1);
    //     }

    //     //旋转一定弧度后的法线
    //     Vec3.rotateY(v_normal_2, v_normal_1, new Vec3(), ndObstacle.parent!.eulerAngles.y);
    //     //箭和法线之间的弧度
    //     let radian = Vec3.angle(v_normal_2, new Vec3(ndArrow.worldPosition.x, 0, ndObstacle.parent!.worldPosition.z));
    //     let angle = math.toDegree(radian);

    //     if (angle > 90) {
    //         angle = -270 + angle;
    //     } else {
    //         angle = 90 + angle;
    //     }
        
    //     this._curEulerAngles.y = angle;
    //     this.node.eulerAngles = this._curEulerAngles;
    // }

    update (deltaTime: number) {
        if (!this.node.parent || !GameManager.ndPlayer || GameManager.isGameOver || GameManager.isGamePause || (this._isNeedShowEffect && !this._isLoadEffectOver)) {
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
            this.hideArrow();
        }
    }
}