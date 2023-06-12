
import { _decorator, Component, Node, CCFloat, Slider, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = SliderEx
 * DateTime = Wed Oct 13 2021 14:46:37 GMT+0800 (中国标准时间)
 * Author = muxiandong
 * FileBasename = SliderEx.ts
 * FileBasenameNoExtension = SliderEx
 * URL = db://assets/Script/SliderEx.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
 
@ccclass('SliderEx')
export class SliderEx extends Component {

    @property(Label)
    currentLabel : Label | null = null;
    @property(Label)
    minLabel : Label | null = null;
    @property(Label)
    maxLabel : Label | null = null;

    min : number = 0;
    max : number = 100;
    offset : number = 0;  // 每0.01 Slider 增加的数值
    lineWidth : number = 20; // 默认为20倍

    onLoad () {
        this.offset = (this.max - this.min) / 100;

        this.minLabel.string = this.min + '';
        this.maxLabel.string = this.max + '';
    }

    onSliderEvent (slider: Slider) {
        let progress = Math.round(slider.progress * 100);
        let value = this.offset * progress;

        this.currentLabel.string = value + '';
        this.lineWidth = this.min + progress;
    }

    getLineWidth () {
        return this.lineWidth;
    }
}
