import { Texture2D, Color, _decorator, Component, Game, clamp01, gfx, SpriteFrame, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;
import GameEnum from '../config/GEnum';

@ccclass('FOWMaskTexture')
export class FOWMaskTexture {

    // 战争迷雾纹理：R通道叠加所有已探索区域，G通道为当前更新的可见区域，B通道为上一次更新的可见区域
    m_MaskTexture: Texture2D = null!;
    get texture () {
        return this.m_MaskTexture;
    }

    m_MaskCache: number[][] = [];

    m_ColorBuffer: Color[][] = [];

    m_UpdateMark = GameEnum.UpdateMark.None;
    
    m_fogWidth: number = 0;
    m_fogHeight: number = 0;
    m_texWidth: number = 0;
    m_texHeight: number = 0;

    pixelColorBuffer: Uint8Array = null!;

    constructor (fogWidth: number, fogHeight: number, texWidth: number, texHeight: number) {
        this.m_fogWidth = fogWidth;
        this.m_fogHeight =  fogHeight;
        this.m_texWidth = texWidth;
        this.m_texHeight = texHeight;
        this.m_UpdateMark = GameEnum.UpdateMark.None;
        this.m_MaskCache = [];
        this.m_ColorBuffer = [];
        for (let i = 0; i < this.m_fogWidth; i++) {
            this.m_MaskCache[i] = [];
            this.m_ColorBuffer[i] = [];
            for (let j = 0; j < this.m_fogHeight; j++) {
                this.m_MaskCache[i][j] = 0;
                this.m_ColorBuffer[i][j] = new Color(0, 0, 0, 255);
            }
        }
        this.pixelColorBuffer = new Uint8Array(this.m_texWidth * this.m_texHeight * 4);
        this.pixelColorBuffer.fill(0);
        if (this.m_MaskTexture === null) {
            this.m_MaskTexture = this.GenerateTexture();
        }
    }

    SetAsVisible (x: number, y: number) {
        this.m_MaskCache[x][y] = 1;
        this.m_UpdateMark = GameEnum.UpdateMark.Changed;
    }

    MarkAsUpdate () {
        if (this.m_UpdateMark !== GameEnum.UpdateMark.Changed) {
            this.m_UpdateMark = GameEnum.UpdateMark.EndUpdate;
        } else {
            // 战争迷雾纹理：R通道为重叠探索区域，G通道为当前更新的可见区域，B通道为上次探索的无重叠区域
            for (let i = 0; i < this.m_fogWidth; i++) {
                for (let j = 0; j < this.m_fogHeight; j++) {
                    var isVisible: Boolean = this.m_MaskCache[i][j] == 1;
                    var origin: Color = this.m_ColorBuffer[i][j];
                    origin.r = Math.max(0, Math.min(origin.r + origin.g, 255));
                    origin.b = origin.g;
                    origin.g = isVisible ? 255 : 0;
                    this.m_ColorBuffer[i][j] = origin;
                    this.m_MaskCache[i][j] = 0;
                }
            }
        }
    }

    RefreshTexture (beginX: number, endX: number, beginZ: number, endZ: number) {
        if (this.m_UpdateMark === GameEnum.UpdateMark.None) {
            return false;
        } else if (this.m_UpdateMark === GameEnum.UpdateMark.EndUpdate){
            return true;
        }

        let index = 0;
        let color = Color.BLACK;
        for (let i = beginZ; i < endZ; i++) {
            for (let j = beginX; j < endX; j++) {
                if (i >= 0 && i < this.m_fogHeight && j >= 0 && j < this.m_fogWidth) {
                    color = this.m_ColorBuffer[j][i];
                } else {
                    color = Color.BLACK;
                }

                this.pixelColorBuffer[index] = color.r;
                this.pixelColorBuffer[index + 1] = color.g;
                this.pixelColorBuffer[index + 2] = color.b;
                this.pixelColorBuffer[index + 3] = color.a;
                index += 4;
            }
        }
        this.texture.uploadData(this.pixelColorBuffer);

        this.m_UpdateMark = GameEnum.UpdateMark.None;

        return true;
    }

    GenerateTexture () {
        var tex: Texture2D = new Texture2D();
        tex.reset({
            width: this.m_texWidth,
            height: this.m_texHeight,
            format: Texture2D.PixelFormat.RGBA8888
        });
        tex.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);

        return tex;
    }
}

