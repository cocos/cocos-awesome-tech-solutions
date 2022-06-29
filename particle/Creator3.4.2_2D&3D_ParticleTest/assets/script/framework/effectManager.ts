import { _decorator, Component, Node, Prefab, AnimationComponent, ParticleSystemComponent, Vec3, find, AnimationState, AnimationClip, math } from 'cc';
import { poolManager } from './poolManager';
import { resourceUtil } from './resourceUtil';
import { WarningCircle } from '../fight/warningSkill/warningCircle';
import { Reward } from '../fight/reward';
import { WarningStrip } from '../fight/warningSkill/warningStrip';
import { WarningLine } from '../fight/warningSkill/warningLine';

const v3_goldPos: Vec3 = new Vec3();
const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {
    private _ndParent: Node = null!;
    private _ndGoldParent: Node = null!
    public get ndParent () {
        if (!this._ndParent) {
            this._ndParent = find("effectManager") as Node;
        }

        return this._ndParent
    }

    static _instance: EffectManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new EffectManager();
        return this._instance;
    }

    start () {
       
    }

    /**
     * 播放模型的动画
     * @param {string} path 动画节点路径
     * @param {string} aniName 
     * @param {vec3} worPos 世界坐标
     * @param {boolean} isLoop 是否循环
     * @param {boolean} isRecycle 是否回收
     * @param {number} [scale=1] 缩放倍数 
     * @param {Function} [callback=()=>{}] 回调函数 
     */
    public playAni (path: string, aniName: string, worPos: Vec3 = new Vec3(),  isLoop: boolean = false,  isRecycle: boolean = false, scale: number = 1, callback: Function = ()=>{}) {
        let childName: string = path.split("/")[1];
        let ndEffect: Node | null = this.ndParent.getChildByName(childName);

        let cb = ()=>{
            ndEffect?.setScale(new Vec3(scale, scale, scale));
            ndEffect?.setWorldPosition(worPos); 
            let ani: AnimationComponent= ndEffect?.getComponent(AnimationComponent) as AnimationComponent;
            ani.play(aniName);
            let aniState: AnimationState= ani.getState(aniName) as AnimationState;
            if (aniState) {
                if (isLoop) {
                    aniState.wrapMode = AnimationClip.WrapMode.Loop;    
                } else {
                    aniState.wrapMode = AnimationClip.WrapMode.Normal;    
                }
            }

            ani.once(AnimationComponent.EventType.FINISHED, ()=>{
                callback && callback();
                if (isRecycle && ndEffect) {
                    poolManager.instance.putNode(ndEffect);
                }
            })
        }

        if (!ndEffect) {
            resourceUtil.loadModelRes(path).then((prefab: any)=>{
                ndEffect = poolManager.instance.getNode(prefab as Prefab, this.ndParent) as Node;
                ndEffect.setScale(new Vec3(scale, scale, scale));
                ndEffect.setWorldPosition(worPos);                
                cb();
            })
        } else {
          cb();
        }
    }

    /**
     * 移除特效
     * @param {string} name  特效名称
     * @param {Node}} ndParent 特效父节点
     */
    public removeEffect (name: string, ndParent: Node = this.ndParent) {
        let ndEffect: Node | null = ndParent.getChildByName(name);
        if (ndEffect) {
            let arrAni: AnimationComponent[] = ndEffect.getComponentsInChildren(AnimationComponent);
            arrAni.forEach((element: AnimationComponent)=>{    
                element.stop();
            })

            let arrParticle: [] = ndEffect?.getComponentsInChildren(ParticleSystemComponent) as any;
            arrParticle.forEach((element:ParticleSystemComponent)=>{
                element?.clear();
                element?.stop();
            })
            poolManager.instance.putNode(ndEffect);        
        }
    }

    /**
     * 播放粒子特效
     * @param {string} path 特效路径
     * @param {vec3}worPos 特效世界坐标 
     * @param {number} [recycleTime=0] 特效节点回收时间，如果为0，则使用默认duration
     * @param  {number} [scale=1] 缩放倍数
     * @param {vec3} eulerAngles 特效角度
     * @param {Function} [callback=()=>{}] 回调函数
     */
    public playParticle (path: string, worPos: Vec3,  recycleTime: number = 0, scale: number = 1, eulerAngles?: Vec3 | null, callback?: Function) {
        resourceUtil.loadEffectRes(path).then((prefab: any)=>{
            let ndEffect: Node = poolManager.instance.getNode(prefab as Prefab, this.ndParent) as Node;
            ndEffect.setScale(new Vec3(scale, scale, scale));
            ndEffect.setWorldPosition(worPos);  
            
            if (eulerAngles) {
                ndEffect.eulerAngles = eulerAngles;
            }
            
            let maxDuration: number = 0;

            let arrParticle:  ParticleSystemComponent[]= ndEffect.getComponentsInChildren(ParticleSystemComponent);
            arrParticle.forEach((item: ParticleSystemComponent)=>{
                item.simulationSpeed = 1;
                item?.clear();
                item?.stop();
                item?.play()

                let duration: number= item.duration;
                maxDuration = duration > maxDuration ? duration : maxDuration;
            })

            let seconds: number = recycleTime && recycleTime > 0 ? recycleTime : maxDuration;

            setTimeout(()=>{
                if (ndEffect.parent) {
                    poolManager.instance.putNode(ndEffect);
                    callback && callback();
                }
            }, seconds * 1000)  
        })
    }

    /**
     * 播放节点下面的动画和粒子
     *
     * @param {Node} targetNode 特效挂载节点
     * @param {string} effectPath 特效路径
     * @param {boolean} [isPlayAni=true] 是否播放动画
     * @param {boolean} [isPlayParticle=true] 是否播放特效
     * @param {number} [recycleTime=0] 特效节点回收时间，如果为0，则使用默认duration
     * @param {number} [scale=1] 缩放倍数
     * @param {Vec3} [pos=new Vec3()] 位移
     * @param {Function} [callback=()=>{}] 回调函数
     * @returns
     * @memberof EffectManager
     */
    public playEffect (targetNode: Node, effectPath: string, isPlayAni: boolean = true, isPlayParticle: boolean = true, recycleTime: number = 0, scale: number = 1, pos?: Vec3 | null, eulerAngles?: Vec3 | null, callback?: Function) {
        if (!targetNode.parent) {//父节点被回收的时候不播放
            return;
        }

        resourceUtil.loadEffectRes(effectPath).then((prefab: any)=>{
            let ndEffect: Node = poolManager.instance.getNode(prefab as Prefab, targetNode) as Node;
            ndEffect.setScale(new Vec3(scale, scale, scale));

            if (pos) {
                ndEffect.setPosition(pos);
            }

            if (eulerAngles) {
                ndEffect.eulerAngles = eulerAngles;
            }

            let maxDuration: number = 0;

            if (isPlayAni) {
                let arrAni: AnimationComponent[] = ndEffect.getComponentsInChildren(AnimationComponent);
    
                arrAni.forEach((element: AnimationComponent, idx: number)=>{
                    element?.play();
                    
                    let aniName = element?.defaultClip?.name;
                    if (aniName) {
                        let aniState = element.getState(aniName);
                        if (aniState) {
                            let duration = aniState.duration;
                            maxDuration = duration > maxDuration ? duration : maxDuration;

                            aniState.speed = 1;
                        }
                    }
                })
            }
    
            if (isPlayParticle) {
                let arrParticle: ParticleSystemComponent[]= ndEffect.getComponentsInChildren(ParticleSystemComponent);
                arrParticle.forEach((element:ParticleSystemComponent)=>{
                    element.simulationSpeed = 1;
                    element?.clear();
                    element?.stop();
                    element?.play()
    
                    let duration: number= element.duration;
                    maxDuration = duration > maxDuration ? duration : maxDuration;
                })
            }
    
            let seconds: number = recycleTime && recycleTime > 0 ? recycleTime : maxDuration;
            
            setTimeout(()=>{
                if (ndEffect.parent) {
                    poolManager.instance.putNode(ndEffect);
                    callback && callback();
                }
            }, seconds * 1000)  
        })
    }

    /**
     * 展示奖励(金币、爱心)弹跳
     *
     * @param {Node} ndMonster
     * @param {string} modelPath
     * @param {number} [rewardNum=1]
     * @param {Function} [callback=()=>{}]
     * @memberof EffectManager
     */
    public showRewardBounce (ndMonster: Node, modelPath: string, rewardNum: number = 1, callback: Function = ()=>{}) {
        let time = rewardNum <= 10 ? 0.15 : 0.07;
        resourceUtil.loadModelRes(modelPath).then((pf: any)=>{
            for (let i = 0; i < rewardNum; i++) {
                let ndReward = poolManager.instance.getNode(pf, this.ndParent) as Node;
                ndReward.setWorldPosition(ndMonster.worldPosition.x, 1.65, ndMonster.worldPosition.z);
                ndReward.active = false;
                let scriptReward = ndReward.getComponent(Reward) as Reward;
                scriptReward.init((i+1) * time, this.ndParent);
            }

            callback && callback();
        });
    }

    /**
     * 播放拖尾特效
     *
     * @param {Node} ndParent
     * @memberof EffectManager
     */
    public playTrail (ndParent: Node, recycleTime:number = 0, callback?:Function, speed: number = 1) {
        let maxDuration: number = 0;

        let arrParticle: ParticleSystemComponent[]= ndParent.getComponentsInChildren(ParticleSystemComponent);
        arrParticle.forEach((element:ParticleSystemComponent)=>{
            element.simulationSpeed = speed;
            element?.clear();
            element?.stop();
            element?.play();

            let duration: number= element.duration;
            maxDuration = duration > maxDuration ? duration : maxDuration;
        })

        let seconds: number = recycleTime && recycleTime > 0 ? recycleTime : maxDuration;

        setTimeout(()=>{
            callback && callback();
        }, seconds * 1000)  
    }

    /**
     * 展示预警
     *
     * @param {string} warningName
     * @param {number} scale
     * @param {*} scriptParent
     * @memberof EffectManager
     */
    public showWarning (warningName: string, scale: number, scriptParent: any, callback?: Function) {
        resourceUtil.loadEffectRes(`warning/${warningName}`).then((pf: any)=>{
            let ndWarning = poolManager.instance.getNode(pf, this.ndParent) as Node;

            let scriptWarning: any = null; 
            if (warningName === "warningLine") {
                scriptWarning = ndWarning.getComponent(WarningLine) as WarningLine;
            } else if (warningName === "warningStrip") {
                scriptWarning = ndWarning.getComponent(WarningStrip) as WarningStrip;
            } else if (warningName === "warningCircle") {
                scriptWarning = ndWarning.getComponent(WarningCircle) as WarningCircle;
            }

            scriptWarning.init(scale, scriptParent);

            scriptParent.scriptWarning = scriptWarning;

            callback && callback();
        });
    }

    public showLightningChain (ndParent: Node, ndTarget: Node) {
        resourceUtil.loadEffectRes(`lightningChain/lightningChain`).then((pf: any)=>{
            let ndEffect = poolManager.instance.getNode(pf, ndParent) as Node;
            ndEffect.setWorldPosition(new Vec3(ndParent.worldPosition.x, 2.3, ndParent.worldPosition.z));

            let offsetPos: Vec3 = new Vec3();

            Vec3.subtract(offsetPos, ndTarget.worldPosition, ndParent.worldPosition);
            ndEffect.setWorldScale(1, offsetPos.length(), 1);
            ndEffect.forward = offsetPos.normalize().negative();
            
            setTimeout(()=>{
                poolManager.instance.putNode(ndEffect);
            }, 100)
        });
    }
}
