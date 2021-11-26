
import { _decorator, Component, Node, Button, setDisplayStats, isDisplayStats, director, Size, Vec2, Toggle, gfx, game, sys } from 'cc';
import { GrassBenderRenderer } from '../grass/grass-bender-renderer';
import { Config } from '../utils/config';
const { ccclass, property, type } = _decorator;

enum PCF_TYPE {
    Hard,
    X5,
    X9,
    X25
}

@ccclass('Settings')
export class Settings extends Component {
    @type(Node)
    settings: Node | null = null

    @type(Toggle)
    lodToggle: Toggle | null = null;

    @type(Toggle)
    debugToggle: Toggle | null = null;

    @type(Toggle)
    fpsToggle: Toggle | null = null;

    @type(Toggle)
    qualityToggle: Toggle | null = null;

    @type(Toggle)
    bendGrassToggle: Toggle | null = null;

    @type(Button)
    bendGrassButton: Button | null = null;

    @type(GrassBenderRenderer)
    grassBenderRenderer: GrassBenderRenderer | null = null;

    start () {
        this.node.on(Node.EventType.TOUCH_END, this.showSettings, this);

        if (this.bendGrassToggle) {
            if (this.bendGrassButton) {
                this.bendGrassButton.interactable = Config.supportBendGrass;
            }
            this.bendGrassToggle.interactable = Config.supportBendGrass;
            this.bendGrassToggle.setIsCheckedWithoutNotify(Config.bendGrass);
        }
        if (this.lodToggle) {
            this.lodToggle.setIsCheckedWithoutNotify(Config.lod);
        }
        if (this.debugToggle) {
            this.debugToggle.setIsCheckedWithoutNotify(Config.debug);
        }
        if (this.qualityToggle) {
            this.qualityToggle.setIsCheckedWithoutNotify(Config.highQuality);
        }
        if (this.fpsToggle) {
            this.fpsToggle.setIsCheckedWithoutNotify(Config.highFps);
        }

        setDisplayStats(Config.debug);
        this.setHighQuality(Config.highQuality);
        this.setHighFps(Config.highFps);

        if (this.grassBenderRenderer) {
            this.grassBenderRenderer.node.active = Config.bendGrass;
        }
    }

    showSettings () {
        if (this.settings) {
            this.settings.active = !this.settings.active;
        }
    }

    toggleLod () {
        Config.lod = !Config.lod;
    }

    toggleDebug () {
        Config.debug = !Config.debug;
        setDisplayStats(Config.debug);
    }

    toggleQuality () {
        Config.highQuality = !Config.highQuality;
        this.setHighQuality(Config.highQuality);
    }

    toggleHighFps () {
        Config.highFps = !Config.highFps;
        this.setHighFps(Config.highFps);
    }

    toggleBendGrass () {
        Config.bendGrass = !Config.bendGrass;
        if (this.grassBenderRenderer) {
            this.grassBenderRenderer.node.active = Config.bendGrass;
        }
    }

    setHighQuality (highQuality: boolean) {
        const globals = director.getScene()!.globals;
        if (highQuality) {
            globals.shadows.shadowMapSize = new Vec2(4096, 4096);
            // globals.shadows.pcf = PCF_TYPE.X25;
        }
        else {
            globals.shadows.shadowMapSize = new Vec2(512, 512);
            // globals.shadows.pcf = PCF_TYPE.X5;
        }

        // hack, TODO: remove when engine fixed dirty flag 
        this.scheduleOnce(() => {
            director.root!.pipeline.pipelineSceneData.shadows.shadowMapDirty = false;
        })
    }

    setHighFps (highFps) {
        if (highFps) {
            game.setFrameRate(60)
        }
        else {
            game.setFrameRate(30)
        }
    }
}
