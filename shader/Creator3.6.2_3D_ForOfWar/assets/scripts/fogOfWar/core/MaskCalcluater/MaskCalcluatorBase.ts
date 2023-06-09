import { _decorator } from 'cc';
import { FOWFieldData } from '../../FogOfWarEffect';
import { FOWMap } from '../FOWMap';
const { ccclass, property } = _decorator;

// 战争迷雾蒙版计算器基类 - 将蒙版计算抽象出来，方便替换算法
@ccclass('MaskCalcluatorBase')
export class MaskCalcluatorBase {
    Calculate (field: FOWFieldData, map: FOWMap) {
        this.RealtimeCalculate(field, map);
    }

    RealtimeCalculate (field: FOWFieldData, map: FOWMap) {}

    Release () {}
}

