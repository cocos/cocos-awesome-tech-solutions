import { _decorator, Component, Node, Vec3, Vec4, Vec2, Material, director, mat4, Mat4, PhysicsSystem, clamp01, Quat, lerp } from 'cc';
import { BuoyancyPoint } from './buoyancy-point';
import { BuoyancyObject } from './buoyancy-object';
import { gerstnerWaves } from './gerstner';
const { ccclass, property, type } = _decorator;

let tempVec3_1 = new Vec3;
let tempVec3_2 = new Vec3;

let tempWorldPos = new Vec3;
let tempForce = new Vec3;
let tempWolrdMatrix = new Mat4;

let waveOffset = new Vec3;
let waveNormal = new Vec3;

let tempRotation = new Quat;

@ccclass('BuoyancyManager')
export class BuoyancyManager extends Component {
    private static _instance: BuoyancyManager | null = null;
    static get instance () {
        return this._instance;
    }

    @type(Material)
    waterMaterial: Material | null = null;

    @type(Node)
    water: Node | null = null;

    @property
    waterDensity = 1;

    buoyancyObjects: BuoyancyObject[] = [];

    @property
    waveForce = 10;

    @property
    waveOffset = 0;

    visuals = new Vec4;
    directions = new Vec4;

    addObject (point: BuoyancyObject) {
        if (this.buoyancyObjects.indexOf(point) === -1) {
            this.buoyancyObjects.push(point);
        }
    }
    removeObject (point: BuoyancyObject) {
        let index = this.buoyancyObjects.indexOf(point);
        if (index !== -1) {
            this.buoyancyObjects.splice(index, 1);
        }
    }

    __preload () {
        BuoyancyManager._instance = this;
    }
    onDestroy () {
        BuoyancyManager._instance = null;
    }

    start () {
        if (this.waterMaterial) {
            let visuals = this.waterMaterial.getProperty('waveVisuals');
            if (visuals) {
                this.visuals.set(visuals as Vec4);
            }

            let directions = this.waterMaterial.getProperty('waveDirections');
            if (directions) {
                this.directions.set(directions as Vec4);
            }
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.

        let time = director.root?.cumulativeTime!;

        let gravity = PhysicsSystem.instance.gravity.y;
        let waterDensity = this.waterDensity;

        let objects = this.buoyancyObjects;
        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            let body = object.body;
            if (!body) {
                continue;
            }

            let points = object.points;

            let maxForce = waterDensity / object.density * object.body!.mass * -gravity;
            let forcePerPoint = maxForce / points.length;

            let submergedVolume = 0;

            for (let pi = 0; pi < points.length; pi++) {
                let point = points[pi];
                let worldPos = point.node.worldPosition;

                let waveWorldPos = tempWorldPos;
                waveWorldPos.set(worldPos.x, this.water?.worldPosition.y, worldPos.z);
                gerstnerWaves(waveWorldPos, this.visuals, this.directions, time, waveOffset, waveNormal);
                waveWorldPos.add(waveOffset);

                let waterLevel = waveWorldPos.y;
                let deepLevel = waterLevel - worldPos.y + point.voxelSize / 2;
                let submergedFactor = clamp01(deepLevel / point.voxelSize);
                submergedVolume += submergedFactor;

                Quat.fromViewUp(tempRotation, Vec3.UP, waveNormal);
                Quat.slerp(tempRotation, tempRotation, Quat.IDENTITY, submergedFactor);

                tempForce.set(Vec3.UP);
                tempForce.multiplyScalar(forcePerPoint * submergedFactor);
                Vec3.transformQuat(tempForce, tempForce, tempRotation);

                Mat4.invert(tempWolrdMatrix, body.node.worldMatrix);
                let localPoint = Vec3.transformMat4(tempVec3_1, worldPos, tempWolrdMatrix);

                body.applyForce(tempForce, localPoint);
            }

            submergedVolume /= points.length;

            body.linearDamping = lerp(object.initDrag, object.dragInWater, submergedVolume);
            body.angularDamping = lerp(object.initAngularDrag, object.angularDragInWater, submergedVolume);
        }

    }
}
