

/**
 * Predefined variables
 * Name = FowFieldData
 * DateTime = Fri Aug 12 2022 17:21:27 GMT+0800 (中国标准时间)
 * Author = linruimin
 * FileBasename = FowFieldData.ts
 * FileBasenameNoExtension = FowFieldData
 * URL = db://assets/script/FowFieldData.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

import { Vec3 } from "cc";

 
export class FieldData {

    position = Vec3.ZERO;
    radius = 10;
    radiusSquare = 100;
    
    constructor (position : Vec3, radius :number)
    {
        this.position = position;
        this.radius = radius;
        this.radiusSquare = radius * radius;
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
