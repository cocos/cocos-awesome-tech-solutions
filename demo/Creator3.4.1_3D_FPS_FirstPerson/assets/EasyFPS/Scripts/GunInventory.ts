
import { _decorator, Component, Node, input, Input, KeyCode, EventKeyboard, AudioSource, animation, resources, instantiate, CCObject, Prefab, find } from 'cc';
const { ccclass, property } = _decorator;

import { GunScript } from './GunScript';
import { InputEx } from './Utils/InputEx';
import { TimeEx } from './Utils/TimeEx';

@ccclass('GunInventory')
export class GunInventory extends Component {
    @property(Node)
    public currentGun: Node = null!;

    @property([Prefab])
    public gunsIHave: Prefab[] = [];

    private currentHAndsAnimator: animation.AnimationController = null!;
    private switchWeaponCooldown: number = 0;
    private currentGunCounter: number = 0;
    private weaponChanging: AudioSource;

    start() {
        this.switchWeaponCooldown = 0;
        this.currentGunCounter++;
        if (this.currentGunCounter > this.gunsIHave.length - 1) {
            this.currentGunCounter = 0;
        }
        this.Spawn(this.currentGunCounter);
    }

    Create_Weapon() {
        if (InputEx.GetAxis("Mouse ScrollWheel") > 0) {
            this.switchWeaponCooldown = 0;
            this.currentGunCounter++;
            if (this.currentGunCounter > this.gunsIHave.length - 1) {
                this.currentGunCounter = 0;
            }
            this.Spawn(this.currentGunCounter);
        }
    }

    AssignHandsAnimator(gun: Node) {
        if(this.currentGun.name.indexOf("Gun") >= 0){
			this.currentHAndsAnimator = this.currentGun.getComponent(GunScript).handsAnimator;
		}
    }

    async Spawn(idx: number) {
        if (!this.weaponChanging){
            this.weaponChanging = find("_playerSounds/_waeponChangingSound", this.node).getComponent(AudioSource);
        } else {
            this.weaponChanging.play();
        }
        // if (this.weaponChanging) {
            
        // }

        if (this.currentGun) {
            if (this.currentGun.name.indexOf("Gun") >= 0) {
                this.currentHAndsAnimator.setValue("changingWeapon", true);

                //0.8 time to change waepon, but since there is no change weapon animation there is no need to wait fo weapon taken down
                await new Promise((reslove, reject) => {
                    setTimeout(() => {
                        reslove(true);
                    }, 200);
                });
                this.currentGun.destroy();

                this.currentGun = instantiate(this.gunsIHave[idx]);
                this.AssignHandsAnimator(this.currentGun);
                this.currentGun.parent = this.node.parent;
                this.currentGun.setSiblingIndex(this.currentGun.getSiblingIndex() - 2);
            }
        }
        else {
            this.currentGun = instantiate(this.gunsIHave[idx]);
            this.AssignHandsAnimator(this.currentGun);
            this.currentGun.parent = this.node.parent;
            this.currentGun.setSiblingIndex(this.currentGun.getSiblingIndex() - 2);
        }
    }

    update(deltaTime: number) {
        this.switchWeaponCooldown += 1 * TimeEx.deltaTime;
        if (this.switchWeaponCooldown > 1.2 && !InputEx.GetKeyDown(KeyCode.SHIFT_LEFT)) {
            this.Create_Weapon();
        }
    }
}
