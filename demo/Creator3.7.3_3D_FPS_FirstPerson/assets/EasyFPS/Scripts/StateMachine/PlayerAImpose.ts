import { _decorator, animation, ParticleSystem } from "cc";
import { GunScript } from "../GunScript";

const { ccclass, property } = _decorator;

@ccclass("PlayerAImpose")
export class PlayerAImpose extends animation.StateMachineComponent {
    
    onMotionStateEnter (controller: animation.AnimationController) {
        controller.node.parent.getComponent(GunScript)!.currentAnimationName = "Player_AImpose";
    }
  
    onMotionStateExit (controller: animation.AnimationController) {

    }
}
