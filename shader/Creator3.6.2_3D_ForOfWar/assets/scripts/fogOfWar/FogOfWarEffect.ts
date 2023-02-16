import { _decorator, Component, Node, Color, Vec3, Texture2D, Enum, Camera, Vec2, Material, Touch, MeshRenderer, geometry, v3, RenderableComponent, CCBoolean, Sprite, Quat } from 'cc';
const { ccclass, property } = _decorator;
import RecastDetourManager from '../recastdetourjs/RecastDetourManager';
import { FOWMap } from './core/FOWMap';
import { FogOfWarMapData } from './core/FOWMapData';

export class FowMapPos {
    x: number = 0;
    y: number = 0;

    constructor (x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class FogMaskType {
    public static Type = Enum({
        Circular: 0,
        FOVCircular: 1,
    })
}

export class FOWFieldData {
    position: Vec3 = new Vec3();
    downPos: Vec3 = new Vec3();
    radius: number = 0;
    radiuSquare: number = 0;
    FOVMaxX: number = 0;
    FOVMaxY: number = 0;
    FOVMinX: number = 0;
    FOVMinY: number = 0;

    constructor (targetNode: Node, radius: number) {
        this.position = new Vec3(-10000, -10000, -10000);
        this.downPos = targetNode.up.clone();
        this.downPos.y *= -1;
        this.radius = radius;
        this.radiuSquare = radius * radius;
    }
}

@ccclass('FogOfWarEffect')
export class FogOfWarEffect extends Component {
    private recastDetourManager!: RecastDetourManager;

    //战争迷雾地图对象
    m_Map: FOWMap = null!;

    @property(Node)
    directorNode: Node = null!;

    @property(Node)
    mapNode: Node = null!;

    @property(Camera)
    camera: Camera = null!;

    public static _debugMeshShow: boolean = false;

    @property({ type: CCBoolean, tooltip: "是否初始化时显示寻路网格调试材质"})
    debugMeshShow: boolean = false;

    @property(Material)
    debugMaterial: Material = null!;

    @property({ type: Sprite, tooltip: "迷雾纹理渲染器"})
    fogRender: Sprite = null!;

    @property({ type: FogMaskType.Type, tooltip: "迷雾蒙版类型" })
    fogMaskType = FogMaskType.Type.Circular;

    @property({tooltip: "视野半径"})
    fogRadius: number = 0;

    @property({type: Color, tooltip: "战争迷雾颜色(RGB迷雾颜色, Alpha已探索区域透明度)"})
    fogColor: Color = null!;

    @property({tooltip: "迷雾区域宽度"})
    fogWidth: number = 100;

    @property({tooltip: "迷雾区域高度"})
    fogHeight: number = 100;

    @property({tooltip: "迷雾贴图宽度"})
    texWidth: number = 20;

    @property({tooltip: "迷雾贴图高度"})
    texHeight: number = 20;

    @property({type:Vec3, tooltip: "迷雾区域中心坐标"})
    centerPostion: Vec3 = new Vec3();

    @property
    heightRange: number = 2;

    _fowMaskTexture: Texture2D = new Texture2D();

    get fowMaskTexture () {
        if (this.m_Map !== null) {
            return this.m_Map.getFOWTexture();
        }
        return null;
    }

    m_MixTime: number = 0.0;
    m_RefreshTime: number = 0;

    kDispearSpeed: number = 1000.0;
    kRefreshTextureSpeed: number = 10.0;

    static m_BeginPos: Vec3 = new Vec3(0, 0, 0);

    m_FieldData: FOWFieldData = null!;

    m_IsFieldDatasUpdated: boolean = false;

    onLoad () {
        FogOfWarEffect._debugMeshShow = this.debugMeshShow;
        var tempPos = this.centerPostion.clone();
        FogOfWarEffect.m_BeginPos = tempPos.subtract(new Vec3(this.fogWidth * 0.5, 0, this.fogHeight * 0.5));
    }

    async start() {
        this.init();
        this.recastDetourManager = await RecastDetourManager.getInstanceByNode(this.mapNode, this.debugMaterial, 1, this.mapNode);

        this.node.on(Node.EventType.TOUCH_END, this.onTouch, this);

        var id = this.recastDetourManager.addAgents(this.directorNode.worldPosition);

        var comp = this.directorNode.getComponent(RenderableComponent);
        comp?.unscheduleAllCallbacks();
        comp?.schedule(()=>{
            this.directorNode.setWorldPosition(this.recastDetourManager.crowd!.getAgentPosition(id));
            this.directorNode.setPosition(this.directorNode.position.x, this.directorNode.position.y + 0.5, this.directorNode.position.z);
        });
    }

    init () {
        this.m_Map = new FOWMap(this.fogMaskType, FogOfWarEffect.m_BeginPos, this.fogWidth, this.fogHeight, this.texWidth, this.texHeight);
        var fowMapData = new FogOfWarMapData(this.fogWidth, this.fogHeight);
        this.m_FieldData = new FOWFieldData(this.directorNode, this.fogRadius);

        if (this.fogMaskType === FogMaskType.Type.FOVCircular) {
            this.m_Map.setMapData(fowMapData.mMapData);
            this.m_Map.generateMapData(this.heightRange, this.m_FieldData.downPos);
        }

        this.fogRender.customMaterial?.setProperty("fowTexture", this.m_Map.getFOWTexture());
        this.fogRender.customMaterial?.setProperty("texSize", new Vec2(this.texWidth, this.texHeight));
        this.fogRender.customMaterial?.setProperty("fog_color", this.fogColor);
    }

    onTouch (touch: Touch) {
        var ray = this.camera.screenPointToRay(touch.getLocationX(), touch.getLocationY());
        var meshComp = this.mapNode.getComponent(MeshRenderer);
        var distance = Number.MAX_VALUE;
        var dis = geometry.intersect.rayMesh(ray, meshComp?.mesh!, { mode: geometry.ERaycastMode.CLOSEST, doubleSided: false, distance: Number.MAX_SAFE_INTEGER });
        if (dis && dis < distance) {
            distance = dis;
        }
        if (distance === Number.MIN_VALUE) {
            return;
        }
        var out = v3();
        ray.computeHit(out, distance);

        this.recastDetourManager.agentGoto(out);
    }

    public static worldPositionToFOW (position: Vec3) {
        var x: number = Math.floor((position.x - this.m_BeginPos.x));
        var z: number = Math.floor((position.z - this.m_BeginPos.z));

        return new FowMapPos(x, z);
    }

    updateFOVXY (field: FOWFieldData) {
        var x = Math.floor(field.position.x);
        var z = Math.floor(field.position.z);

        field.FOVMaxX = Math.min(x + field.radius, this.fogWidth - 1);
        field.FOVMinX = Math.min(x - field.radius, this.fogWidth - 1);
        field.FOVMaxY = Math.min(z + field.radius, this.fogHeight - 1);
        field.FOVMinY = Math.min(z - field.radius, this.fogHeight - 1);

        if (this.fogMaskType === FogMaskType.Type.FOVCircular) {
            for (var i = 1; i < field.radius + 1; i++) {
                var xIndex = Math.min(this.fogWidth - 1,  x + i);
                if (this.m_Map.mapData[xIndex][z]) {
                    field.FOVMaxX = xIndex;
                    break;
                }
            }
            for (var j = 1; j < field.radius + 1; j++) {
                var xIndex = Math.max(0, x - j);
                if (this.m_Map.mapData[xIndex][z]) {
                    field.FOVMinX = xIndex;
                    break;
                }
            }
            for (var o = 1; o < field.radius + 1; o++) {
                var zIndex = Math.min(this.fogHeight - 1,  z + o);
                if (this.m_Map.mapData[x][zIndex]) {
                    field.FOVMaxY = zIndex;
                    break;
                }
            }
            for (var p = 1; p < field.radius + 1; p++) {
                var zIndex = Math.max(0, z - p);
                if (this.m_Map.mapData[x][zIndex]) {
                    field.FOVMinY = zIndex;
                    break;
                }
            }
        }
    }

    update(deltaTime: number) {
        if (this.recastDetourManager) {
            this.recastDetourManager.update(deltaTime);
        }

        //更新迷雾纹理
        if (this.m_MixTime >= 1.0) {
            if (this.m_RefreshTime >= 1.0) {
                this.m_RefreshTime = 0.0;
                if (this.m_FieldData) {
                    if (this.fogRadius <= 0 || this.m_FieldData.position.equals(this.directorNode.position)) return;
                    this.m_FieldData.position = this.directorNode.position.clone();
                    this.updateFOVXY(this.m_FieldData);
                    this.m_Map.setVisiable(this.m_FieldData);
                    if (this.m_Map.refreshFOWTexture(this.m_FieldData)) {
                        this.m_MixTime = 0;
                    }
                }
            } else {
                this.m_RefreshTime += deltaTime * this.kRefreshTextureSpeed;
            }
        } else {
            this.m_MixTime += deltaTime * this.kDispearSpeed;
        }
    }
}

