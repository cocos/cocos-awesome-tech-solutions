
import { _decorator, Component, Node, input, Input, KeyCode, EventKeyboard, AudioSource, animation, resources, instantiate, CCObject, Prefab } from 'cc';
import { GunScript } from './GunScript';
const { ccclass, property } = _decorator;

@ccclass('GunInventory')
export class GunInventory extends Component {
    @property(AudioSource)
    weaponChanging: AudioSource;

    @property(Node)
    public currentGun: Node = null!;

    @property(Animation)
    private currentHAndsAnimator: animation.AnimationController = null!;

    @property
    private gunsIHave: string[] = [];

    public switchWeaponCooldown: number = 0;
    private currentGunCounter: number = 0;
    private keyHold: KeyCode[] = [];
    private deltaTime: number = 0;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        if (this.keyHold.indexOf(event.keyCode) >= 0)
            return;
        this.keyHold.unshift(event.keyCode);
    }

    onKeyUp(event: EventKeyboard) {
        let pos = this.keyHold.indexOf(event.keyCode);
        if (pos < 0)
            return;
        this.keyHold.splice(pos, 1);
    }

    Create_Weapon() {
        this.switchWeaponCooldown = 0;
        this.currentGunCounter++;
        if (this.currentGunCounter > this.gunsIHave.length - 1) {
            this.currentGunCounter = 0;
        }
        this.Spawn(this.currentGunCounter);
    }

    AssignHandsAnimator(gun: Node) {
        if (gun.name.indexOf("Gun")) {
            this.currentHAndsAnimator = gun.getComponent(GunScript).handsAnimator;
        }
    }

    async Spawn(idx: number) {
        if (this.weaponChanging) {
            this.weaponChanging.play();
        }

        if (this.currentGun) {
            if (this.currentGun.name.indexOf("Gun") >= 0) {
                this.currentHAndsAnimator.setValue("changingWeapon", true);

                //0.8 time to change waepon, but since there is no change weapon animation there is no need to wait fo weapon taken down
                await new Promise((reslove, reject) => {
                    setTimeout(() => {
                        reslove(true);
                    }, 800);
                });
                this.currentGun.destroy();

                resources.load(this.gunsIHave[idx], (err, prefab: Prefab) => {
                    this.currentGun = instantiate(prefab);
                    this.currentGun.position = this.node.position;
                    this.AssignHandsAnimator(this.currentGun);
                });
            }
        }
        else {
            resources.load(this.gunsIHave[idx], (err, prefab: Prefab) => {
                this.currentGun = instantiate(prefab);
                this.currentGun.position = this.node.position;
                this.AssignHandsAnimator(this.currentGun);
            });
        }
    }

    update(deltaTime: number) {
        this.switchWeaponCooldown += 1 * deltaTime;
        if (this.switchWeaponCooldown > 1.2 && this.keyHold.indexOf(KeyCode.SHIFT_LEFT) >= 0) {
            this.Create_Weapon();
        }
    }
}
