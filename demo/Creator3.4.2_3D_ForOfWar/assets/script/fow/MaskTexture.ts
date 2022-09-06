import { Color, math, Texture2D } from "cc";
import { FieldData } from "./FieldData";

/**
 * Predefined variables
 * Name = FowMaskTexture
 * DateTime = Fri Aug 12 2022 17:12:10 GMT+0800 (中国标准时间)
 * Author = linruimin
 * FileBasename = FowMaskTexture.ts
 * FileBasenameNoExtension = FowMaskTexture
 * URL = db://assets/script/FowMaskTexture.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
enum UpdateMark
{
    None,
    Changed,
    EndUpdate,
}
 
export class MaskTexture  {
    width =100;
    height = 100;
    maskCache : number[][] = null!;
    colorBuffer : Color[][] = null!;
    updateMark : UpdateMark = UpdateMark.None;
    texture2d : Texture2D = null!;
    buffer : ArrayBuffer = null!;
    pixelColor : Uint8Array = null!;

    constructor(width : number, height : number)
    {
        this.width = width;
        this.height = height;
        this.updateMark = UpdateMark.None;

        this.maskCache = [];
        this.colorBuffer = [];
        for (let i = 0; i < this.width; i++)
        {
            this.maskCache[i] = [];
            this.colorBuffer[i] = [];
            for (let j = 0; j < this.height; j++)
            {
                this.maskCache[i][j] = 0;
                this.colorBuffer[i][j] = new Color(0, 0, 0, 255);
            }
        }

        this.texture2d = new Texture2D();
        this.texture2d.reset({
            width : 20,
            height : 20,
            format : Texture2D.PixelFormat.RGBA8888,
        });
        this.texture2d.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);
    
        this.buffer = new ArrayBuffer(20 * 20 * 4);
        this.pixelColor = new Uint8Array(this.buffer);
        this.pixelColor.fill(0);
    }

    setAsVisiable(x : number, y : number)
    {
        this.maskCache[x][y] = 1;
        this.updateMark = UpdateMark.Changed;
    }

    markAsUpdated()
    {
        if (this.updateMark != UpdateMark.Changed)
        {
            this.updateMark = UpdateMark.EndUpdate;
        }
        else
        {
            // 战争迷雾纹理：R通道叠加所有已探索区域，G通道为当前更新的可见区域，B通道为上一次更新的可见区域
            // 一开始为绿色的；移动后，上一次更新的可见区域会变成白色的，新更新的可见区域是绿色的；再移动后，已探索区域会变成红色。
            for (let i = 0; i < this.width; i++)
            {
                for (let j = 0; j < this.height; j++)
                {
                    let isVisible = this.maskCache[i][j] == 1;
                    let origin = this.colorBuffer[i][j];
                    origin.r = Math.max(0, Math.min(origin.r + origin.g, 255));
                    origin.b = origin.g;
                    origin.g = isVisible ? 255 : 0;
                    this.colorBuffer[i][j] = origin;

                    this.maskCache[i][j] = 0;
                }
            }
        }
    }

    refresh(beginX : number, endX : number, beginZ : number, endZ : number)
    {
        if (this.updateMark == UpdateMark.None)
            return false;

        if (this.updateMark == UpdateMark.EndUpdate)
            return true;

        let index = 0;
        let color = Color.BLACK;
        for (let i = beginZ; i < endZ; i++)
        {
            for (let j = beginX; j < endX; j++)
            {
                if (i < 0 || i >= this.width || j < 0 || j >= this.height)
                {
                    color = Color.BLACK;
                }
                else
                {
                    color = this.colorBuffer[j][i];
                }

                // 直接导出迷雾
                // if (color.r == 255)
                // {
                //     if (color.g == 255)
                //     {
                //         color = new Color(0, 0, 0, 0);
                //     }
                //     else
                //     {
                //         color = new Color(0, 0, 0, 85);
                //     }
                // }
                // else
                // {
                //     color = new Color(0, 0, 0, 255);
                // }

                this.pixelColor[index] = color.r;
                this.pixelColor[index + 1] = color.g;
                this.pixelColor[index + 2] = color.b;
                this.pixelColor[index + 3] = color.a;
                index += 4;
            }
        }
        this.texture2d.uploadData(this.pixelColor);

        this.updateMark = UpdateMark.None;

        return true;
    }


}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
