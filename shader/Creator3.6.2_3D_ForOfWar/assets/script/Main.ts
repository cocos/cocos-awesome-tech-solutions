import { _decorator, Touch, Node, Component, geometry, math, Camera, Material, NodePool, Vec3, v3, EventKeyboard, macro, resources, Toggle, Asset, MeshRenderer, RenderableComponent, Vec2, instantiate, RenderTexture, Sprite, Texture2D, ImageAsset, view, UITransform, SpriteFrame, color, Color, Enum } from 'cc';
import RecastDetourManager from "./recastdetourjs/tool/RecastDetourManager";
import { FogMap } from './fow/FogMap';
import { FieldData } from './fow/FieldData';
import GameEnum from './component/config/GEnum';

const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    private recastDetourManager!: RecastDetourManager;

    @property(Node)
    roleNode: Node = null!;

    @property(Node)
    nodesMap: Node = null!;

    @property(Camera)
    camera: Camera = null!;

    @property(Material)
    debugMaterial: Material = null!;

    @property
    debugMeshShow: boolean = false;

    public static _debugMeshShow: boolean = false;

    fogMap: FogMap = null!;

    fieldData: FieldData = null!;

    @property({ type: Sprite, tooltip: "迷雾渲染器" })
    fogWar: Sprite = null!;

    public static _fogEffectType = GameEnum.FogMaskType.Circular;

    @property({ type: GameEnum.FogMaskType, tooltip: "迷雾蒙版类型" })
    fogEffectType = GameEnum.FogMaskType.Circular;

    private radius = 3;

    private isFieldDataUpdated = false;

    private mixTime = 0;
    private refreshTime = 0;

    private dispearSpeed = 100;
    private refreshTextureSpeed = 10;

    onLoad () {
        Main._fogEffectType = this.fogEffectType;
        Main._debugMeshShow = this.debugMeshShow;
    }

    async start() {
        this.recastDetourManager = await RecastDetourManager.getInstanceByNode(this.nodesMap, this.debugMaterial, 1, this.nodesMap);

        this.node.on(Node.EventType.TOUCH_END, this.onTouch, this);

        let id = this.recastDetourManager.addAgents(new Vec3(30, 0, 40));

        let comp = this.roleNode.getComponent(RenderableComponent)!;
        comp.unscheduleAllCallbacks();
        comp.schedule(() => {
            this.roleNode.setWorldPosition(this.recastDetourManager.crowd!.getAgentPosition(id));
            this.roleNode.setPosition(this.roleNode.position.x, this.roleNode.position.y + 0.5, this.roleNode.position.z);
        });

        this.init();
    }

    init() {
        this.fogMap = new FogMap();
        this.fieldData = new FieldData(this.node.position, this.radius);
        this.fogWar.customMaterial?.setProperty('fowTexture', this.fogMap.getMaskTexture());
    }


    onTouch(touch: Touch) {
        let ray = this.camera.screenPointToRay(touch.getLocationX(), touch.getLocationY());
        let comps = this.nodesMap.getComponentsInChildren(MeshRenderer);
        let distance = Number.MAX_VALUE;
        for (let i = 0; i < comps.length; ++i) {
            let dis = geometry.intersect.rayModel(ray, comps[i].model!, { mode: geometry.ERaycastMode.CLOSEST, doubleSided: false, distance: Number.MAX_SAFE_INTEGER });
            if (dis && dis < distance) {
                distance = dis;
            }
        }
        if (distance == Number.MIN_VALUE) {
            return;
        }
        let out = v3();
        ray.computeHit(out, distance);

        this.recastDetourManager.agentGoto(out);
    }

    update(deltaTime: number) {
        if (this.recastDetourManager) {
            this.recastDetourManager.update(deltaTime);
        }

        if (this.fogMap) {
            let pos = this.fogMap.getPosition(this.roleNode.position);
            this.updateFog(deltaTime);
        }

        if (this.fieldData) {
            this.fieldData.position = this.roleNode.position;
            this.updateFieldData(this.fieldData);
        }
    }

    updateFieldData(fieldData: FieldData) {
        if (!this.isFieldDataUpdated) {
            this.fogMap.setVisiable(fieldData);

            this.isFieldDataUpdated = true;
        }
    }

    updateFog(deltaTime: number) {
        if (this.mixTime >= 1.0) {
            if (this.refreshTime >= 1.0) {
                this.refreshTime = 0;
                if (this.fogMap.refreshTexture(this.fieldData)) {
                    // this.setFogFade(0);
                    this.mixTime = 0;
                    this.isFieldDataUpdated = false;
                }
            }
            else {
                this.refreshTime += deltaTime * this.refreshTextureSpeed;
            }
        }
        else {
            this.mixTime += deltaTime * this.dispearSpeed;
            // this.setFogFade(this.mixTime);
        }
    }

}
