import { director, Game, game, gfx, sys } from 'cc'

export const Config = {
    lod: true,
    debug: false,
    highFps: true,
    highQuality: false,
    supportBendGrass: false,
    bendGrass: false
}

game.on(Game.EVENT_ENGINE_INITED, () => {
    if (director.root && director.root.device.hasFeature(gfx.Feature.TEXTURE_HALF_FLOAT)) {
        Config.supportBendGrass = true;
        if (!sys.isMobile) {
            Config.bendGrass = true
        }
    }

    if (!sys.isMobile) {
        Config.highFps = true
        Config.highQuality = true
    }
})
