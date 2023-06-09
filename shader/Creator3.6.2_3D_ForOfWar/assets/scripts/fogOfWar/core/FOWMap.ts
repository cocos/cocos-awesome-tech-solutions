import { Vec3, _decorator, Component, Vec2 } from 'cc';
import { FogMaskType, FOWFieldData } from '../FogOfWarEffect';
// import { FOWFieldData } from '../FogOfWarExplorer';
import { FogOfWarMapData } from './FOWMapData';
import { FOWMaskTexture } from './FOWMaskTexture';
import { FOWUtils } from './FOWUtils';
import { CircularMask } from './MaskCalcluater/CircularMask';
import { MaskCalcluatorBase } from './MaskCalcluater/MaskCalcluatorBase';
const { ccclass, property } = _decorator;

@ccclass('FOWMap')
export class FOWMap {

    m_MapData: FogOfWarMapData["mMapData"] = [];
    get mapData () {
        return this.m_MapData;
    }

    m_MaskTexture: FOWMaskTexture = null!;
    get maskTexture () {
        return this.m_MaskTexture;
    }

    m_BeginPosition: Vec3 = new Vec3();
    get beginPosition () {
        return this.m_BeginPosition;
    }

    m_fogWidth: number = 0;
    get fogWidth () {
        return this.m_fogWidth;
    }

    m_fogHeight: number = 0;
    get fogHeight () {
        return this.m_fogHeight;
    }

    m_TexWidth: number = 0;
    get texWidth () {
        return this.m_TexWidth;
    }

    m_TexHeight: number = 0;
    get texHeight () {
        return this.m_TexHeight;
    }

    //开启可视范围遮挡检测效果
    m_FOVCalculator: boolean = false;

    
    m_CalculaterBase: MaskCalcluatorBase;

    m_Lock: any;

    constructor (fogMaskType: number, beginPosition: Vec3, fogWidth: number, fogHeight: number, texWidth: number, texHeight: number) {
        this.m_MaskTexture = new FOWMaskTexture(fogWidth, fogHeight, texWidth, texHeight);
        this.m_BeginPosition = beginPosition;
        this.m_fogWidth = fogWidth;
        this.m_fogHeight = fogHeight;
        this.m_TexWidth = texWidth;
        this.m_TexHeight = texHeight;

        this.m_CalculaterBase = this.CreateCalculator(fogMaskType)!;
    }

    setMapData (mapData: FogOfWarMapData["mMapData"]) {
        this.m_MapData = mapData;
    }

    generateMapData (heightRange: number, direction: Vec3) {
        for (var i: number = 0; i < this.fogWidth; i++) {
            for (var j: number = 0; j < this.fogHeight; j++) {
                this.m_MapData[i][j] = FOWUtils.IsObstacle(this.beginPosition.x, this.beginPosition.y, heightRange, direction, i, j);
            }
        }
    }

    refreshFOWTexture (fieldData: FOWFieldData) {
        let explorerPosition = this.getPosition(fieldData.position);
        let x = explorerPosition.x;
        let z = explorerPosition.y;
        var beginX = 0, endX = 0, beginZ = 0, endZ = 0;

        var width = Math.floor(this.texWidth / 2);
        var height = Math.round(this.texHeight / 2);
        beginX = x - width;
        endX = x + width;
        beginZ = z - height;
        endZ = z + height;

        return this.m_MaskTexture.RefreshTexture(beginX, endX, beginZ, endZ);
    }

    getFOWTexture () {
        return this.m_MaskTexture.texture;
    }

    setVisiable(fieldData : FOWFieldData)
    {
        this.m_CalculaterBase.Calculate(fieldData, this);
        this.maskTexture.MarkAsUpdate();
    }

    CreateCalculator (maskType: number) {
        this.m_FOVCalculator = maskType === FogMaskType.Type.FOVCircular;
        return new CircularMask();
    }

    getPosition(position : Vec3)
    {
        let x = Math.floor(position.x - this.beginPosition.x);
        let y = Math.floor(position.z - this.beginPosition.z);

        return new Vec2(x, y);
    }

}

