import { FogMap } from "./FogMap";
import { FieldData } from "./FieldData";

export class MaskCalculator {

    calculate(fieldData : FieldData, fogMap : FogMap)
    {
        let rx = Math.floor(fieldData.radius);
        let rz = Math.floor(fieldData.radius);
        let rs = rx*rx;

        let explorerPosition = fogMap.getPosition(fieldData.position);
        let x = explorerPosition.x;
        let z = explorerPosition.y;

        let beginX = Math.max(0, x - rx);
        let beginZ = Math.max(0, z - rz);
        let endX = Math.min(fogMap.width, x + rx);
        let endZ = Math.min(fogMap.height, z + rz);

        for (let i = beginX; i < endX; i++)
        {
            for (let j = beginZ; j < endZ; j++)
            {
                let dx = i -x;
                let dy = j -z;
                let rads = dx * dx + dy * dy;
                if (rads <= rs)
                {
                    fogMap.maskTexture.setAsVisiable(i, j);
                }
            }
        }
    }
}

