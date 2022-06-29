import { poolManager } from './../../framework/poolManager';
import { EffectManager } from './../../framework/effectManager';
import { _decorator, Component, Node } from 'cc';
import { constant } from '../../framework/constant';
import { AudioManager } from '../../framework/audioManager';
const { ccclass, property } = _decorator;
//激光技能组件
@ccclass('Laser')
export class Laser extends Component {
    public skillInfo: any = null!;//技能信息
    public baseInfo: any = null!;//基础信息
    public scriptWarning: any = null!;//预警技能脚本

    private timer: any = null!;//

    start () {
        // [3]
    }

    public init (skillInfo: any, baseInfo: any, scriptParent?: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        this.node.active = false;
        this._closeTimer();

        this.timer = setTimeout(()=>{
            if (!scriptParent.isDie) {
                AudioManager.instance.playSound(constant.SOUND.LASER);  
                this.node.active = true;
                scriptParent?.scriptWarning?.hideWarning();
                EffectManager.instance.playTrail(this.node, 0, ()=>{
                    this._closeTimer();
                    poolManager.instance.putNode(this.node);
                }, skillInfo.flySpeed);
            } else {
                this._closeTimer();
            }
        }, 400)
    }

    private _closeTimer () {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null!;
        }
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}