import { FogMap } from "./FogMap";
import { FieldData } from "./FieldData";
import { Vec2, Vec3 } from "cc";

export class FovCalculator {

    queue : Vec2[] = [];
    arrives : number[] = [];

    calculate(fieldData : FieldData, fogMap : FogMap)
    {
        var radiusSq = fieldData.radiusSquare;

        let explorerPosition = fogMap.getPosition(fieldData.position);
        let x = explorerPosition.x;
        let z = explorerPosition.y;

        if (x < 0 || x >= fogMap.width)
        return;
        if (z < 0 || z >= fogMap.height)
            return;
        if (fogMap.maskTexture.maskCache[x][z])
        {
            return;
        }
        
        this.queue.push(new Vec2(x, z))
        this.arrives.push(z * fogMap.width + x);
        fogMap.maskTexture.setAsVisiable(x, z);

        while (this.queue.length > 0) {
            var root = this.queue.shift()!;
            if (fogMap.maskTexture.maskCache[x][z]) {
                if (this.PreRayCast(fogMap, root, x, z)) {
                    var index = root.y * fogMap.width + root.x;
                    if (!this.arrives.indexOf(index)) {
                        this.arrives.push(index);
                    }
                    fogMap.maskTexture.setAsVisiable(root.x, root.y);
                } else {
                    this.PreRayCast(fogMap, root, x, z)
                }
            }
        }
    }

    PreRayCast(map: FogMap, pos: Vec2, centX: number, centZ: number)
    {
        return false;
    }
}

