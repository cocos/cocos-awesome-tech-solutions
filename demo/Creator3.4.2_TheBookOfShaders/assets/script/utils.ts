
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = utils
 * DateTime = Fri Jun 24 2022 17:07:21 GMT+0800 (中国标准时间)
 * Author = linruimin
 * FileBasename = utils.ts
 * FileBasenameNoExtension = utils
 * URL = db://assets/script/utils.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@ccclass('utils')
export class utils {
        	
    static effectNames = [
        { name:'01_1_Uniform', desc:'统一值' }, // 0
        { name:'01_2_Uniform', desc:'统一值' }, // 1
        { name:'02_1_PlotLine', desc:'造型' }, // 2
        { name:'02_2_PlotLine', desc:'造型' }, // 3
        { name:'03_1_PlotColor', desc:'颜色' }, // 4
        { name:'03_2_PlotColor', desc:'颜色' }, // 5
        { name:'03_3_PlotColor', desc:'颜色' }, // 6
        { name:'03_4_PlotColor', desc:'颜色' }, // 7
        { name:'04_1_PlotRect', desc:'形状' }, // 8
        { name:'04_2_PlotRect', desc:'形状' }, // 9
        { name:'04_3_Circle', desc:'形状' }, // 10
        { name:'04_4_Circle', desc:'形状' }, // 11
        { name:'04_5_Circle', desc:'形状' }, // 12
        { name:'05_1_PlotMatri', desc:'矩阵' }, // 13
        { name:'05_2_MatriRotate', desc:'矩阵旋转' }, // 14
        { name:'05_3_MatriScale', desc:'矩阵缩放' }, // 15
        { name:'05_4_MatriYUV', desc:'矩阵YUV' }, // 16
        { name:'06_1_Pattern', desc:'图案' }, // 17
        { name:'06_2_Pattern', desc:'图案' }, // 18
        { name:'07_1_Random', desc:'随机' }, // 19
        { name:'07_2_Random', desc:'随机' }, // 20
        { name:'08_1_Noise', desc:'噪声' }, // 21
        { name:'09_1_Noise', desc:'网格噪声' }, // 22
        { name:'09_2_Noise', desc:'网格噪声' }, // 23
        { name:'10_1_Noise', desc:'分形布朗运动' }, // 24
        { name:'10_2_Noise', desc:'分形布朗运动' }, // 25
    ];

    static getEffectName(index)
    {
        let effectName = this.effectNames[index];
        return `${index}.  ${effectName.name} - ${effectName.desc}`;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
