import { _decorator, Component, Node, Animation, ParticleSystem2D, game, director, Canvas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Particle2DPlayControl')
export class Particle extends Component {

    @property(Animation)
    particle2DAnim: Animation = null;

    @property(ParticleSystem2D)
    water: ParticleSystem2D = null;

    @property(ParticleSystem2D)
    smoke: ParticleSystem2D = null;

    @property(ParticleSystem2D)
    fire: ParticleSystem2D = null;

    playParticle2DAnim () {
        this.particle2DAnim.play();
        console.log(director.getScene().getChildByName("Canvas"))
        console.log(Canvas)
    }
}

