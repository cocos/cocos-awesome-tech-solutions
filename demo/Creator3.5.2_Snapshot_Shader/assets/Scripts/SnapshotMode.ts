import { _decorator, Component, Node, Profiler, Prefab, EffectAsset, instantiate, Color, director, Camera, ModelComponent } from 'cc';
import { InputEx } from '../Scenes/Scripts/InputEx';
import { SnapshotCanvas } from './SnapshotCanvas';
import { BaseFilter, BloomFilter, BlurFilter, CRTFilter, NeonFilter, PixelFilter, SnapshotFilter } from './SnapshotFilter';
import { SnapshotRender } from './SnapshotRender';
const { ccclass, property } = _decorator;

@ccclass('SnapshotMode')
export class SnapshotMode extends Component {
    @property(ModelComponent)
    model: ModelComponent = null!;

    @property(Prefab)
    snapshotCanvasPrefab: Prefab = null!
    snapshotCanvas: Node = null;

    @property(EffectAsset)
    noneShader: EffectAsset = null!;
    @property(EffectAsset)
    greyscaleShader: EffectAsset = null!;
    @property(EffectAsset)
    sepiaShader: EffectAsset = null!;
    @property(EffectAsset)
    gaussianShader: EffectAsset = null!;
    @property(EffectAsset)
    edgeBlurShader: EffectAsset = null!;
    @property(EffectAsset)
    silhouetteShader: EffectAsset = null!;
    @property(EffectAsset)
    outlineShader: EffectAsset = null!;
    @property(EffectAsset)
    neonShader: EffectAsset = null!;
    @property(EffectAsset)
    bloomShader: EffectAsset = null!;
    @property(EffectAsset)
    crtShader: EffectAsset = null!;
    @property(EffectAsset)
    nesShader: EffectAsset = null!;
    @property(EffectAsset)
    snesShader: EffectAsset = null!;
    @property(EffectAsset)
    gbShader: EffectAsset = null!;
    @property(EffectAsset)
    paintingShader: EffectAsset = null!;
    @property(EffectAsset)
    prideShader: EffectAsset = null!;

    private filters: SnapshotFilter[] = [];
    private filterIndex: number = -1;

    start() {
        this.snapshotCanvas = instantiate(this.snapshotCanvasPrefab);
        director.getScene().addChild(this.snapshotCanvas);

        let render = this.snapshotCanvas.getComponent(SnapshotRender);
        render.setSnapshot(this.getComponent(Camera));

        this.filters.unshift(new BaseFilter("Greyscale", Color.WHITE, this.greyscaleShader));
        this.filters.unshift(new BaseFilter("Sepia Tone", new Color(1.00, 1.00, 0.79), this.sepiaShader));
        this.filters.unshift(new BlurFilter("Blur (Full)", Color.WHITE, this.gaussianShader));
        this.filters.unshift(new BlurFilter("Blur (Edge)", Color.WHITE, this.edgeBlurShader));
        this.filters.unshift(new BaseFilter("Outlines", Color.WHITE, this.outlineShader));
        this.filters.unshift(new PixelFilter("Game Boy", new Color(0.61, 0.73, 0.06), this.gbShader));
        this.filters.unshift(new BaseFilter("Pride", Color.WHITE, this.prideShader));
        this.filters.unshift(new CRTFilter("NES", new Color(0.66, 1.00, 1.00), this.crtShader, new PixelFilter("", Color.WHITE, this.nesShader)));
        this.filters.unshift(new CRTFilter("SNES", new Color(0.80, 1.00, 1.00), this.crtShader, new PixelFilter("", Color.WHITE, this.snesShader)));
        this.filters.unshift(new BloomFilter("Bloom", Color.WHITE, this.bloomShader, new BlurFilter("Blur (Full)", Color.WHITE, this.gaussianShader)));
        this.filters.unshift(new NeonFilter("Neon", Color.CYAN, this.neonShader, null!));
        this.filters.unshift(new NeonFilter("NeonBloom", Color.CYAN, this.neonShader, new BloomFilter("Bloom", Color.WHITE, this.bloomShader, new BlurFilter("Blur (Full)", Color.WHITE, this.gaussianShader))));
        this.filters.push(new BaseFilter("Painting", Color.WHITE, this.paintingShader));
        this.filters.push(new BaseFilter("Silhouette", new Color(0.89, 0.71, 0.56), this.silhouetteShader, true));
        this.filters.unshift(new BaseFilter("None", Color.WHITE, this.noneShader));

        render.model = this.model;
    }

    update(deltaTime: number) {
        let lastIndex = this.filterIndex;

        if (InputEx.GetButtonDown("Fire1")) {
            if (--this.filterIndex < 0) {
                this.filterIndex = this.filters.length - 1;
            }
        }
        else if (InputEx.GetButtonDown("Fire2")) {
            if (++this.filterIndex >= this.filters.length) {
                this.filterIndex = 0;
            }
        }

        if (lastIndex < 0) {
            this.filterIndex = 0;
        }

        let filter = this.filters[this.filterIndex];
        if (lastIndex != this.filterIndex) {
            this.snapshotCanvas.getComponent(SnapshotCanvas).SetFilterProperties(filter);
        }

        let render = this.snapshotCanvas.getComponent(SnapshotRender);
        filter.OnRenderImage(render, render.src, render.dst);
    }
}

