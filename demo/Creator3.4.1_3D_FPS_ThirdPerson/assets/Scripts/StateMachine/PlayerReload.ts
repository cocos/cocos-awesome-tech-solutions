import { _decorator, animation, ParticleSystem } from "cc";
import { GunScript } from "../GunScript";

const { ccclass, property } = _decorator;

@ccclass("PlayerReload")
export class PlayerReload extends animation.StateMachineComponent {
    
    onMotionStateEnter (controller: animation.AnimationController) {
        controller.node.parent.getComponent(GunScript)!.currentAnimationName = "Player_Reload";
    }
  
    onMotionStateExit (controller: animation.AnimationController) {

    }
}
