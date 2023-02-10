import { Vec2, Vec3 } from "cc";
import { FieldData } from "./FieldData";
import { MaskCalculator } from "./MaskCalculator";
import { MaskTexture } from "./MaskTexture";
import { Main } from "../Main";
import GameEnum from "../component/config/GEnum";

export class FogMap {
    
    maskTexture : MaskTexture = null!;
    maskCalculator : MaskCalculator = null!;

    width = 100;
    height = 100;
    beginPosition = Vec3.ZERO;

    constructor()
    {
        this.width = 100;
        this.height = 100;
        this.beginPosition = new Vec3(0, 0, 0);
        this.maskTexture = new MaskTexture(this.width, this.height);
        
        if (Main._fogEffectType === GameEnum.FogMaskType.Circular) {
            this.maskCalculator = new MaskCalculator();
        } else {
            console.log("暂不支持 FOV 遮罩，恢复使用圆形遮罩");
            this.maskCalculator = new MaskCalculator();
        }
    }

    refreshTexture(fieldData : FieldData)
    {
        let explorerPosition = this.getPosition(fieldData.position);
        let x = explorerPosition.x;
        let z = explorerPosition.y;

        let beginX = x-10;
        let endX = x+10;
        let beginZ = z-10;
        let endZ = z+10;
        
        return this.maskTexture.refresh(beginX, endX, beginZ, endZ);
    }

    getMaskTexture()
    {
        return this.maskTexture.texture2d;
    }

    setVisiable(fieldData : FieldData)
    {
        this.maskCalculator.calculate(fieldData, this);
        this.maskTexture.markAsUpdated();
    }

    getPosition(position : Vec3)
    {
        let x = Math.floor(position.x - this.beginPosition.x);
        let y = Math.floor(position.z - this.beginPosition.z);

        return new Vec2(x, y);
    }
}

