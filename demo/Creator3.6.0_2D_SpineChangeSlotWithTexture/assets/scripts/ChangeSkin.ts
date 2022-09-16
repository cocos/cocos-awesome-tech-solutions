
import { _decorator, Component, Node, sp, Texture2D, assetManager, resources } from 'cc';
import { JSB } from 'cc/env';
const { ccclass, property } = _decorator;

/**
 * 局部换装（导入外部图片
 */
@ccclass('ChangeSkin')
export class ChangeSkin extends Component {
    @property(sp.Skeleton)
    skin1Skel: sp.Skeleton = null!;
    @property(sp.Skeleton)
    skin2Skel: sp.Skeleton = null!;

    private skinIdx1: number = 0;
    private skinIdx2: number = 0;

    start() {
        // if (JSB) {
        //     // @ts-ignore
        //     let skeleton = cc.internal.SpineSkeleton.prototype;

        //     // @ts-ignore
        //     let spineSkeletonData = cc.internal.SpineSkeletonData.prototype;

        //     // 局部换装
        //     skeleton.updateRegion = function (attachment: any, tex2d: any) {                
        //         // @ts-ignore
        //         var jsbTex2d = new middleware.Texture2D();
        //         jsbTex2d.setRealTextureIndex(spineSkeletonData.recordTexture(tex2d));
        //         jsbTex2d.setPixelsWide(tex2d.width);
        //         jsbTex2d.setPixelsHigh(tex2d.height);
        //         sp.spine.updateRegion(attachment, jsbTex2d);
        //     }
        // }
    }

    protected async onChangeSkin1() {
        if (this.skinIdx1 === 0) {
            this.skinIdx1 = 1;

            // 更换texture2d
            this.modifyAttachment(this.skin1Skel, 'hair_b_9');
        } else {
            this.skinIdx1 = 0;

            // 更换texture2d
            this.modifyAttachment(this.skin1Skel, 'hair_f_4');
        }
    }

    protected async onChangeSkin2() {
        if (this.skinIdx2 === 0) {
            this.skinIdx2 = 1;

            // 更换texture2d
            this.modifyAttachment(this.skin2Skel, 'hair_b_9');
        } else {
            this.skinIdx2 = 0;

            // 更换texture2d
            this.modifyAttachment(this.skin2Skel, 'hair_f_4');
        }
    }

    private async modifyAttachment(player: any, imgName: string) {
        let attachment = null;
        let slot = null;

        // skin1换装
        // slot = player.findSlot('gun');
        // attachment = slot.getAttachment();

        // if (attachment === null) {
        //     console.log('getAttachment is null');
        //     return;
        // }

        const tex2d = await this.loadTex2d(imgName) as Texture2D;
        if (tex2d === null) {
            return;
        }

        player.changeSlotSkin('gun', tex2d);
    }

    private loadTex2d(name: string) {
        return new Promise((resolve: Function, reject: Function) => {
            resources!.load(`role/${name}/texture`, Texture2D, (err: Error | null, tex2d: Texture2D) => {
                if (err !== null && err !== undefined) {
                    console.error(`loadTex2d ${name} error:`, err);
                    return reject(err);
                }
                // console.log(`loadTex2d ${name} success:`, tex2d);
                resolve(tex2d);
            });
        });
    }
}
