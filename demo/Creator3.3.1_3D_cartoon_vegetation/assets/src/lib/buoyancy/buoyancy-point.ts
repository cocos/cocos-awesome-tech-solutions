import { _decorator, Component, Node, RigidBody } from 'cc';
import { BuoyancyManager } from './buoyancy-manager';
const { ccclass, property } = _decorator;

@ccclass('BuoyancyPoint')
export class BuoyancyPoint extends Component {
    @property
    forceMultiply = 1;

    @property
    voxelSize = 1;
}
