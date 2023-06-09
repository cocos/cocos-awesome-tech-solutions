import { _decorator, Vec3, math, geometry, PhysicsSystem } from 'cc';
import { FOWFieldData } from '../../FogOfWarEffect';
import { FOWMap } from '../FOWMap';
import { MaskCalcluatorBase } from './MaskCalcluatorBase';
const { ccclass, property } = _decorator;

@ccclass('CircularMask')
export class CircularMask extends MaskCalcluatorBase {
    RealtimeCalculate(field: FOWFieldData, map: FOWMap): void {
        var worldPosition: Vec3 = field.position;
        var rx: number = Math.floor(field.radius);
        var rz: number = Math.floor(field.radius);
        var rs: number = rx * rx;

        var x = Math.floor((worldPosition.x - map.beginPosition.x));
        var z = Math.floor((worldPosition.z - map.beginPosition.z));

        var beginX = Math.max(0, x - rx);
        var beginZ = Math.max(0, z - rz);
        var endX = Math.min(map.fogWidth, x + rx);
        var endZ = Math.min(map.fogHeight, z + rz);

        for (var i = beginX; i < endX; i++) {
            for (var j = beginZ; j < endZ; j++) {
                var dx = i - x;
                var dy = j - z;
                var rads = dx * dx + dy * dy;
                if (map.m_FOVCalculator) {
                    if (rads <= rs && !map.mapData[i][j]) {
                        if ((i > field.FOVMinX && i < field.FOVMaxX) && (j > field.FOVMinY && j < field.FOVMaxY)) {
                            map.maskTexture.SetAsVisible(i, j);
                        }
                    }
                } else {
                    if (rads <= rs) {
                        map.maskTexture.SetAsVisible(i, j);
                    }
                }
                
            }
        }
    }

    Release () {

    }
}

