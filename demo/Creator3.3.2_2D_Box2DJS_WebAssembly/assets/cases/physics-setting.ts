import { PhysicsSystem2D, game, Game, EPhysics2DDrawFlags } from "cc";

game.on(Game.EVENT_GAME_INITED, () => {
    PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape | EPhysics2DDrawFlags.Joint
})
