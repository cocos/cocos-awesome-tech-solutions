import { _decorator, Component, Label, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WindManager')
export class WindManager extends Component {

    @property({type: CCFloat})
    wind_num: number = 1;
    @property({type: Label})
    wind_label: Label = null!;

    update (dt: any) {
        this.wind_label.string = "风力: " + this.wind_num;
    }

    on_change_wind (slider: any, customEventData: any) {
        this.wind_num = slider.progress * 10 - 5;
    }
}