
import { _decorator, Component, Node, sp, Texture2D, assetManager, resources } from 'cc';
import { JSB } from 'cc/env';
const { ccclass, property } = _decorator;

/**
 * 局部换装（导入外部图片）
 * sp.spine接口、skel文件导入、换图白底
 * RegionAttachment: setRegion()、updateOffset()
 * MeshAttachment: updateUVs()
 */
@ccclass('ChangeSkin')
export class ChangeSkin extends Component {

    // @property(sp.Skeleton)
    // goblins: sp.Skeleton = null!;
    @property(sp.Skeleton)
    skin1Skel: sp.Skeleton = null!;

    private skinIdx: number = 0;

    start() {
        if (JSB) {
            // @ts-ignore
            let skeleton = cc.internal.SpineSkeleton.prototype;

            // @ts-ignore
            let spineSkeletonData = cc.internal.SpineSkeletonData.prototype;

            // 局部换装
            skeleton.updateRegion = function (attachment: any, tex2d: any) {                
                // @ts-ignore
                var jsbTex2d = new middleware.Texture2D();
                jsbTex2d.setRealTextureIndex(spineSkeletonData.recordTexture(tex2d));
                jsbTex2d.setPixelsWide(tex2d.width);
                jsbTex2d.setPixelsHigh(tex2d.height);
                sp.spine.updateRegion(attachment, jsbTex2d);
            }
        }
        else {
            // @ts-ignore
            let skeleton = cc.internal.SpineSkeleton.prototype;

            // 局部换装
            skeleton.updateRegion = function (attachment: any, tex2d: any) {
                const skeTexture = new sp.SkeletonTexture({ width: tex2d.width, height: tex2d.height } as ImageBitmap);
                skeTexture.setRealTexture(tex2d);

                const region = new sp.spine.TextureAtlasRegion();
                region.width = tex2d.width;
                region.height = tex2d.height;
                region.originalWidth = tex2d.width;
                region.originalHeight = tex2d.height;
                region.rotate = false;
                region.u = 0;
                region.v = 0;
                region.u2 = 1;
                region.v2 = 1;
                region.texture = skeTexture;
                region.renderObject = region;

                attachment.region = region;
                attachment.width = tex2d.width;
                attachment.height = tex2d.height;

                if (attachment instanceof sp.spine.MeshAttachment) {
                    attachment.updateUVs();
                } else {
                    attachment.setRegion(region);
                    attachment.updateOffset();
                }
                // 避免换装影响人物的其他动画，一般设置缓存模式PRIVATE_CACHE
                // this.goblins?.invalidAnimationCache();
                // console.log('new attachment==>\n', attachment);
            }
        }
    }

    protected async onChangeSkin() {
        if (this.skinIdx === 0) {
            this.skinIdx = 1;

            // 更换attachment
            // const gSlot = this.goblins?.findSlot('head');
            // const attachment1 = gSlot.getAttachment();

            // 更换texture2d
            this.modifyAttachment('hair_b_9');
        } else {
            this.skinIdx = 0;

            // 更换attachment后重置默认skin
            // this.goblins?.setSkin('goblin');
            // this.goblins?.setSlotsToSetupPose();

            // 更换texture2d
            this.modifyAttachment('hair_f_4');
        }
    }

    private async modifyAttachment(imgName: string) {
        let attachment = null;
        let slot = null;

        // gobli换装
        // slot = this.goblins?.findSlot('head');
        // attachment = slot.getAttachment();

        // skin1换装
        slot = this.skin1Skel?.findSlot('gun');
        attachment = slot.getAttachment();

        console.log('goblins slot==>', slot);
        console.log('goblins attachment==>', attachment);
        if (attachment === null) {
            console.log('getAttachment is null');
            return;
        }

        const tex2d = await this.loadTex2d(imgName) as Texture2D;
        if (tex2d === null) {
            return;
        }

        (<any>this.skin1Skel).updateRegion(attachment, tex2d);

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
