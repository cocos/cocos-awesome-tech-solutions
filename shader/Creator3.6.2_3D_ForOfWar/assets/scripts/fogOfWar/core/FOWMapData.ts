import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FOWMapData')
export class FogOfWarMapData {

    m_Width: number = 0;
    m_Height: number = 0;

    mMapData: boolean[][] = [];

    constructor (width: number, height: number) {
        for (var i = 0; i < width; i++) {
            this.mMapData[i] = [];
            for (var j = 0; j < height; j++) {
                this.mMapData[i][j] = false;
            }
        }
        this.m_Width = width;
        this.m_Height = height;
    }
}

