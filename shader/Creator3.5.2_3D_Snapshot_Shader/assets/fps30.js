cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
    cc.game.frameRate = 60;
})