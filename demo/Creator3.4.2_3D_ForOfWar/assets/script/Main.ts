import { _decorator, Touch, Node, Component, geometry, math, Camera, Material, NodePool, Vec3, v3, EventKeyboard, macro, resources, Toggle, Asset, MeshRenderer, RenderableComponent, Vec2, instantiate, RenderTexture, Sprite, Texture2D, ImageAsset, view, UITransform, SpriteFrame, color, Color, Enum } from 'cc';
import RecastDetourManager from "./recastdetourjs/tool/RecastDetourManager";
import { FogMap } from './fow/FogMap';
import { FieldData } from './fow/FieldData';
import GameEnum from './component/config/GEnum';

const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    private recastDetourManager!: RecastDetourManager;

    @property
    roleNode: Node = null!;

    @property
    camera: Camera = null!;

    @property
    debugMaterial: Material = null!;

    fogMap: FogMap = null!;

    fieldData: FieldData = null!;

    @property({ tooltip: "迷雾渲染器" })
    fogWar: Sprite = null!;

    @property({ tooltip: "迷雾纹理宽度" })
    fogTextureWidth: number = 960;

    @property({ tooltip: "迷雾纹理长度" })
    fogTextureHeight: number = 640;

    // @property({ tooltip: "迷雾区域宽度" })
    // fogXSize: number = 0;

    // @property({ tooltip: "迷雾区域高度" })
    // fogZSize: number = 0;

    // @property({ tooltip: "迷雾区域中心坐标" })
    // centerPosition: Vec3 = new Vec3(0, 0, 0);

    // @property
    // heightRange: number = 0;

    public static _fogEffectType = GameEnum.FogMaskType.Circular;

    @property({ type: GameEnum.FogMaskType, tooltip: "迷雾蒙版类型" })
    fogEffectType = GameEnum.FogMaskType.Circular;

    // @property({ tooltip: "战争迷雾颜色（RGB 迷雾颜色，Alpha 为已探索的区域透明度）" })
    // fogColor: Color = new Color();

    // @property({ tooltip: "模糊偏移量" })
    // blurOffset: number = 0;

    // @property({ tooltip: "模糊迭代次数" })
    // blurInteration: number = 0;

    private fogImageAsset: ImageAsset = null!;

    private fogTexture: Texture2D = null!;
    /**存储像素数据的内存块 */
    private buffer: ArrayBuffer = null!;
    /**颜色分量一维数组，供渲染使用 */
    private pixelColor: Uint8Array = null!;

    private radius = 5;

    private isFieldDataUpdated = false;

    private mixTime = 0;
    private refreshTime = 0;

    private DeltaX = 0;
    private DeltaZ = 0;
    private invDeltaX = 0;
    private invDeltaZ = 0;

    private dispearSpeed = 100;
    private refreshTextureSpeed = 10;

    private mapPosition: Vec2 = new Vec2();
    private beginPos: Vec3 = new Vec3();

    private isFiledDatasUpdated: boolean = false;

    onLoad () {
        Main._fogEffectType = this.fogEffectType;
    }

    async start() {
        this.recastDetourManager = await RecastDetourManager.getInstanceByNode(this.node, this.debugMaterial, 1, this.node);

        this.node.on(Node.EventType.TOUCH_END, this.onTouch, this);

        let id = this.recastDetourManager.addAgents(new Vec3(0, 0, 0));

        let comp = this.roleNode.getComponent(RenderableComponent)!;
        comp.unscheduleAllCallbacks();
        comp.schedule(() => {
            this.roleNode.setWorldPosition(this.recastDetourManager.crowd!.getAgentPosition(id));
            this.roleNode.setPosition(this.roleNode.position.x, this.roleNode.position.y + 0.5, this.roleNode.position.z);
        });

        this.init();
    }

    init() {
        // if (this.fogXSize <= 0 || this.fogZSize <=0 || this.fogTextureWidth <=0 || this.fogTextureHeight <= 0) {
        //     return false;
        // }
        // this.DeltaX = this.fogXSize / this.fogTextureWidth;
        // this.DeltaZ = this.fogZSize / this.fogTextureHeight;
        // this.invDeltaX = 1.0 / this.DeltaX;
        // this.invDeltaZ = 1.0 / this.DeltaZ;
        // this.beginPos = this.centerPosition.subtract(new Vec3(this.fogXSize * 0.5, 0, this.fogZSize * 0.5));
        this.fogMap = new FogMap();
        this.fieldData = new FieldData(this.node.position, this.radius);
        this.fogWar.customMaterial?.setProperty('fowTexture', this.fogMap.getMaskTexture());
    }


    onTouch(touch: Touch) {
        let ray = this.camera.screenPointToRay(touch.getLocationX(), touch.getLocationY());
        let comps = this.node.getComponentsInChildren(MeshRenderer);
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
            this.mapPosition = pos;
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

    // setFogFade(fade: number) {
    //     if (fade < 1) {
    //         this.fogWar.customMaterial?.setProperty('mixValue', fade);
    //     }
    // }

}
