import { _decorator, Component, Vec3, Quat, Node, Prefab, ParticleSystemComponent } from 'cc';
import { AudioManager } from '../../framework/audioManager';
import { constant } from '../../framework/constant';
import { EffectManager } from '../../framework/effectManager';
import { poolManager } from '../../framework/poolManager';
import { resourceUtil } from '../../framework/resourceUtil';
import { GameManager } from '../gameManager';
//小火球组件：抛物线，只有落地(播放爆炸)才有伤害, 所以碰撞器在hitFireBall1里面
const { ccclass, property } = _decorator;
@ccclass('FireBall')
export class FireBall extends Component {
    public isPlayHitFireBall: boolean = false;//是否播放火球
    public groundWorPosY: number = 1.8;//地面相对世界原点高度
    public scriptWarning: any = null!;//预警技能脚本
    public skillInfo: any = null!;//技能信息
    public baseInfo: any = null!;//敌人基本信息

    private _isAutoRotate: boolean = true;//方向是否自动调整
    private _posStart: Vec3 = new Vec3();//开始位置
    private _posEnd: Vec3 = new Vec3();//结束位置
    private _posOffset: Vec3 = new Vec3();//开始和结束位置差
    private _totalFlyTime: number = 0;//弓箭飞行时间
    private _maxFlyHeight: number =0;//弓箭最大飞行高度
    private _curFlyTime: number = 0;//当前飞行时间
    private _rotateCoolTime: number = 0;//每隔0.1秒调整角度
    private _oriScale: Vec3 = new Vec3();//初始缩放大小
    private _posNextTarget: Vec3 = new Vec3();//下次的目标位置
    private _scriptParent: any = null!;

    start () {

    }

    /**
    * 初始化 
    */
    public init (skillInfo: any, baseInfo: any, scriptParent?: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        this._scriptParent = scriptParent;
        this._totalFlyTime = 0;
        this._maxFlyHeight = 0;
        this._curFlyTime = 0;
        this._posStart.set(this.node.worldPosition.x, this.groundWorPosY, this.node.worldPosition.z);
        this._posEnd.set(scriptParent.attackPos);
        Vec3.subtract(this._posOffset, this._posEnd, this._posStart);
        this._totalFlyTime = this._posOffset.length() / skillInfo.flySpeed;
        this._maxFlyHeight = this._totalFlyTime * 3;//最大飞行高度跟飞行距离成正比     
        this.isPlayHitFireBall = false;

        this.node.children.forEach((ndChild: Node)=>{
            ndChild.active = true;
        })

        EffectManager.instance.playTrail(this.node);

        AudioManager.instance.playSound(constant.SOUND.FIRE_BALL);
    }

    update (deltaTime: number) {
        if (!this.node.parent || !GameManager.ndPlayer || GameManager.isGameOver || GameManager.isGamePause) {
            return;
        }

        //向指定目标飞行
        if (this._totalFlyTime > 0 && this.node.parent) {
            if (this._curFlyTime <  this._totalFlyTime) {
                this._curFlyTime += deltaTime;
                this._curFlyTime = this._curFlyTime >= this._totalFlyTime ? this._totalFlyTime : this._curFlyTime;
 
                let percent = Number((this._curFlyTime / this._totalFlyTime).toFixed(2));
                //曲线飞行
                let height = this._maxFlyHeight * Math.cos(percent * Math.PI - Math.PI/2);
                let posTarget = new Vec3(this._posStart.x + this._posOffset.x * percent, this._posStart.y + height, this._posStart.z + this._posOffset.z * percent);

                this.node.setWorldPosition(posTarget);

                if (this._isAutoRotate) {
                    this._rotateCoolTime -= deltaTime;
                    if (this._rotateCoolTime < 0) {
                        this._rotateCoolTime = 0.1;
                        percent = Number(((this._curFlyTime + deltaTime) / this._totalFlyTime).toFixed(2));
                        if (percent < 1) {
                            //曲线飞行
                            height = this._maxFlyHeight * Math.cos(percent*Math.PI - Math.PI/2);
                            this._posNextTarget.set(this._posStart.x + this._posOffset.x*percent, this._posStart.y + height,this._posStart.z + this._posOffset.z*percent)
                            this.node.forward = this._posNextTarget.subtract(posTarget).normalize();
                        }
                    }
                }

                //小火球碰到地面
                if (Number((this.node.position.y).toFixed(2)) <= this.groundWorPosY && !this.isPlayHitFireBall && this._curFlyTime > 0) {
                    this.isPlayHitFireBall = true;

                    //关闭预警
                    this._scriptParent.scriptWarning?.hideWarning();   
                    
                    this.node.children.forEach((ndChild: Node)=>{
                        ndChild.active = false;
                    })

                    //展示火焰爆炸
                    resourceUtil.loadEffectRes("hit/hitFireBall1").then((prefab: any)=>{
                        let ndEffect: Node = poolManager.instance.getNode(prefab as Prefab, this.node) as Node;
                        ndEffect.setWorldPosition(this.node.worldPosition);

                        EffectManager.instance.playTrail(ndEffect, 2, ()=>{
                            poolManager.instance.putNode(ndEffect);
                            poolManager.instance.putNode(this.node);
                        });
                    })
                }
            }
        }
    }
}