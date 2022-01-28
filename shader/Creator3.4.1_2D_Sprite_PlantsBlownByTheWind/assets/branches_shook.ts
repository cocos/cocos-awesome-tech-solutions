import { _decorator, Component, Material, CCFloat, Sprite, find } from 'cc';
import { WindManager } from './wind_manager';
const { ccclass, property } = _decorator;

@ccclass('BranchesShook')
export class BranchesShook extends Component {
    @property(Material)
    public material: Material = null!;
    @property(CCFloat)
    public time = 0;
    @property(CCFloat)
    public wind_num = 1;
    @property(CCFloat)
    public radian = 0;
    @property(CCFloat)
    public Flexibility = 1;

    angle: number = 0;
    WeatherManager : any;

    onLoad () {
        this.set_raotaion();
    }

    start () {
        this.material = this.node.getComponent(Sprite)!.getMaterial(0)!;

        this.WeatherManager = find('wind_manager')!.getComponent(WindManager)!;
    }

    update (dt: any) {
        this.time += dt;

        if (this.WeatherManager) {
           this.wind_num = this.WeatherManager.wind_num;
        }
        if (this.node.active && this.material != null) {
           this.radian = (this.node.angle) * Math.PI / 180;
           this.material.setProperty("wind_num", this.wind_num);
           this.material.setProperty("radian", this.radian);
           this.material.setProperty("Flexibility", this.Flexibility);
        }
        this.update_wind(dt);
    }

    set_raotaion () {
        this.angle = this.node.angle;
        if (this.angle < 0) {
           this.angle += 360;
        }
        this.time = Math.random() * 2;
    }

    update_wind (dt: any) {
        this.time += dt;
        var _num1 = Math.sin(this.time * (this.wind_num / 2));
        if (this.angle > 90 && this.angle < 270) {
           this.node.angle = this.angle + (this.wind_num * (_num1 + 1));
        } else {
           this.node.angle = this.angle - (this.wind_num * (_num1 + 1));
        }
        this.material.setProperty("value_1", Math.abs(this.wind_num) * (_num1 + 1) * 0.02 + 0.1);
    }

}