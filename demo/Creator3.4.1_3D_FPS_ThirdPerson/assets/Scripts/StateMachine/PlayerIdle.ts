import { _decorator, animation, ParticleSystem } from "cc";
import { GunScript } from "../GunScript";

const { ccclass, property } = _decorator;

@ccclass("CharacterIdle")
export class CharacterMalee extends animation.StateMachineComponent {
    
    onMotionStateEnter (controller: animation.AnimationController) {
        // let name = this.handsAnimator.getCurrentStateStatus(0).__DEBUG_ID__;
        controller.node.parent.getComponent(GunScript)!.currentAnimationName = "Character_Idle";
    }
  
    onMotionStateExit (controller: animation.AnimationController) {

    }
}
