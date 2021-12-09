import { _decorator, Component, Label, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WindManager')
export class WindManager extends Component {

    @property({type: CCFloat})
    wind_num: number = 1;
    @property({type: Label})
    wind_label: Label = null!;

    onLoad () {
        //globalThis.WeatherManager = this;
    }

    start () {
    }

    update (dt: any) {
        this.wind_label.string = "风力: " + this.wind_num;
    }

    on_change_wind (slider: any, customEventData: any) {
        this.wind_num = slider.progress * 10 - 5;
    }

}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */

// cc.Class({
//     extends: cc.Component,
// 
//     properties: {
//         wind_num: 1,
// 
//         wind_label: {
//             default: null,
//             type: cc.Label,
//             tooltip: "风力描述label"
//         }
//     },
// 
//     // LIFE-CYCLE CALLBACKS:
//     onLoad() {
//         globalThis.WeatherManager = this;
//     },
// 
//     start() {
//     },
// 
//     update(dt) {
//         this.wind_label.string = "风力: " + this.wind_num;
//     },
// 
// 
//     on_change_wind: function (slider, customEventData) {
//         this.wind_num = slider.progress * 10 - 5;
//     }
// });
