
import { _decorator, Component, Node, Mesh, MeshRenderer, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
import { Config } from './config';
const { ccclass, property, type, executeInEditMode } = _decorator;

const vec3_tmp1 = new Vec3();
const vec3_tmp2 = new Vec3();

@ccclass('LodConfig')
export class LodConfig {
    @type(Mesh)
    mesh: Mesh | null = null;

    @property
    distance = 1;
}

@ccclass('Lod')
@executeInEditMode
export class Lod extends Component {
    @type(LodConfig)
    lods: LodConfig[] = []

    @type(Node)
    target: Node | null = null;

    meshRenderer: MeshRenderer | null = null;
    start () {
        this.meshRenderer = this.getComponent(MeshRenderer);
    }

    update () {
        if (!this.meshRenderer || !this.target) {
            return;
        }

        let lods = this.lods;
        let lodLevel = lods.length - 1;

        if (EDITOR || !Config.lod) {
            lodLevel = 0;
        }
        else {
            let distance = Vec3.distance(this.node.getWorldPosition(vec3_tmp1), this.target.getWorldPosition(vec3_tmp2));

            for (let i = 0; i < lods.length; i++) {
                if (distance < lods[i].distance) {
                    lodLevel = i;
                    break;
                }
            }
        }

        let lod = lods[lodLevel];
        if (!lod || this.meshRenderer.mesh === lod.mesh) {
            return;
        }

        this.meshRenderer.mesh = lod.mesh;
    }
}

