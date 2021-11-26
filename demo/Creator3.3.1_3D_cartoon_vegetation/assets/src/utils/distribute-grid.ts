import { _decorator, Component, Node, Material, ModelComponent, Prefab, instantiate,
    CCObject, Mesh, MeshRenderer } from 'cc';
import { Lod, LodConfig } from './lod';
const { ccclass, property, executeInEditMode, type } = _decorator;


function mergeMesh (node: Node, outMesh: Mesh) {
    let mr = node.getComponent(MeshRenderer);
    if (mr && mr.mesh) {
        outMesh.merge(mr.mesh, node.worldMatrix);
    }

    for (let i = 0; i < node.children.length; i++) {
        mergeMesh(node.children[i], outMesh);
    }
}


@ccclass('LodTemplate')
export class LodTemplate {
    @type(Prefab)
    template: Prefab | null = null;

    @property
    distance = 1;

    _mesh: Mesh | null = null;
    getMesh () {
        if (!this.template) {
            return null;
        }

        if (!this._mesh) {
            this._mesh = new Mesh();
            let c = instantiate(this.template);
            mergeMesh(c, this._mesh);
        }

        return this._mesh;
    }
}

@ccclass('DistributeGrid')
@executeInEditMode
export class DistributeGrid extends Component {
    @type(Material)
    _material: Material | null = null;
    @type(Material)
    get material () {
        return this._material;
    }
    set material (v) {
        this._material = v;
        this.updateMaterial();
    }

    @property
    _space = 5
    @property
    get space () {
        return this._space;
    }
    set space (v) {
        this._space = v;
        this.distribute();
    }

    @type(Prefab)
    _template: Prefab | null = null;
    @type(Prefab)
    get template () {
        return this._template;
    }
    set template (v) {
        this._template = v;
        this.distribute();
    }

    @property
    _count = 10;
    @property
    get count () {
        return this._count;
    }
    set count (v) {
        this._count = v;
        this.distribute();
    }

    @type(LodTemplate)
    lods: LodTemplate[] = [];

    @type(Node)
    lodTarget: Node | null = null;

    onEnable () {
        this.distribute();
        this.updateMaterial();
    }

    distribute () {
        if (!this.template) {
            return;
        }

        // let mesh: Mesh = new Mesh;
        // let c = instantiate(this.template);
        // mergeMesh(c, mesh);

        let lods = this.lods.map(l => {
            let lod = new LodConfig();
            lod.mesh = l.getMesh();
            lod.distance = l.distance;
            return lod;
        })

        let rowLength = Math.pow(this.count, 0.5) | 0;
        this.node.removeAllChildren();
        for (let i = 0; i < this.count; i++) {

            let c = new Node();
            let mr = c.addComponent(MeshRenderer);

            let lod = c.addComponent(Lod);
            lod.lods = lods
            lod.target = this.lodTarget;


            // mr.mesh = mesh;

            c.setPosition(i % rowLength * this.space, 0, Math.floor(i / rowLength) * this.space);
            c._objFlags |= CCObject.Flags.DontSave | CCObject.Flags.HideInHierarchy;

            c.parent = this.node;
        }
    }

    updateMaterial () {
        if (!this.material) return;

        let comps = this.node.getComponentsInChildren(ModelComponent)
        for (let i = 0; i < comps.length; i++) {
            let m = comps[i]
            m.setMaterial(this.material, 0);
        }
    }
}
