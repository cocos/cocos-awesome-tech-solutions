
import { _decorator, Component, Node, animation, KeyCode, CameraComponent, Vec3, Vec2, math, quat, Quat, AudioSource, instantiate, Texture2D, Prefab, PhysicsSystem, Label, MeshRenderer, find, LabelComponent, ccenum } from 'cc';
import { InputEx } from './Utils/InputEx';
import { SmoothDamp, SmoothDampV3 } from './Utils/MathEx';
import { MouseLookScript } from './MouseLookScript';
import { PlayerMovementScript } from './PlayerMovementScript';
import { TimeEx } from './Utils/TimeEx';
const { ccclass, property } = _decorator;

enum GunStyles {
    nonautomatic,
    automatic
}
ccenum(GunStyles);

@ccclass('GunScript')
export class GunScript extends Component {
    @property([Prefab])
    public muzzelFlash: Prefab[] = [];
    @property(Node)
    public muzzelSpawn: Node = null!;
    private holdFlash: Node = null!;
    @property(AudioSource)
    public reloadSound_source: AudioSource = null!;
    @property(AudioSource)
    public shoot_sound_source: AudioSource = null!;
    @property(AudioSource)
    public arm_hit_sound: AudioSource = null;

    @property({ type: GunStyles })
    public currentStyle: GunStyles = GunStyles.nonautomatic;

    public reloading: boolean = false;
    public meeleAttack: boolean = false;
    public aiming: boolean = false;

    @property(animation.AnimationController)
    public handsAnimator: animation.AnimationController = null!;
    public lastAnimStatusText: string = "";
    public currentAnimationName: string = "";
    public reloadAnimationName: string = "Player_Reload";
    public aimingAnimationName: string = "Player_AImpose";
    public meeleAnimationName: string = "Character_Malee";

    public secondCamera: CameraComponent = null!;
    public currentGunPosition: Vec3 = new Vec3();
    private velV: Vec3 = new Vec3();
    private currentRecoilZPos: number = 0;
    private currentRecoilXPos: number = 0;
    private currentRecoilYPos: number = 0;
    public velocity_z_recoil: number[] = [0];
    public velocity_x_recoil: number[] = [0];
    public velocity_y_recoil: number[] = [0];

    // 后座力
    public recoilAmount_z: number = 0.5;
    public recoilAmount_x: number = 0.5;
    public recoilAmount_y: number = 0.5;
    @property
    public recoilAmount_z_non: number = 0.02;
    @property
    public recoilAmount_x_non: number = 0.02;
    @property
    public recoilAmount_y_non: number = 0.02;
    @property
    public recoilAmount_z_: number = 0.01;
    @property
    public recoilAmount_x_: number = 0.005;
    @property
    public recoilAmount_y_: number = 0.005;
    @property
    public recoilOverTime_z: number = 0.1;
    @property
    public recoilOverTime_x: number = 0.1;
    @property
    public recoilOverTime_y: number = 0.1;

    // 瞄准镜

    @property(Vec3)
    public restPlacePosition: Vec3 = new Vec3(-0.07, -0.06, 0.4);
    @property(Vec3)
    public aimPlacePosition: Vec3 = new Vec3(0.0, -0.05, 0.29);

    public gunAimTime: number = 0.1;

    private gunPosVelocity: Vec3 = new Vec3();
    private cameraZoomVelocity: number[] = [0];
    private secondCameraZoomVelocity: number[] = [0];

    // Gun Precision

    public gunPrecision_notAiming: number = 200.0;
    public gunPrecision_aiming: number = 100.0;
    public cameraZoomRatio_notAiming: number = 60;
    public cameraZoomRatio_aiming: number = 40;
    public secondCameraZoomRatio_notAiming: number = 60;
    public secondCameraZoomRatio_aiming: number = 40;
    public gunPrecision;

    // Rotation
    private velocityGunRotateX: number[] = [0];
    private velocityGunRotateY: number[] = [0];
    private gunWeightX: number = 0.0;
    private gunWeightY: number = 0.0;
    private rotationLagTime: number = 0.0;
    private rotationLastY: number = 0.0;
    private rotationDeltaY: number = 0.0;
    private angularVelocityY: number = 0.0;
    private rotationLastX: number = 0.0;
    private rotationDeltaX: number = 0.0;
    private angularVelocityX: number = 0.0;
    public forwardRotationAmount: Vec2 = new Vec2(1, 1);

    // Sensitvity of the gun
    public mouseSensitvity_notAiming: number = 3;
    public mouseSensitvity_aiming: number = 1;
    public mouseSensitvity_running: number = 4;

    // Shooting setup - MUSTDO
    @property({ type: Prefab, tooltip: "子弹" })
    public bullet: Prefab = null!;
    @property({ tooltip: "1秒射出几发子弹" })
    public roundsPerSecond: number = 100.0;
    private waitTillNextFire: number = 0.0;

    // Bullet properties
    @property({ tooltip: "总弹药数" })
    public bulletsIHave: number = 99999;
    @property({ tooltip: "弹夹弹药数" })
    public bulletsInTheGun: number = 5;
    @property({ tooltip: "每次填充弹药个数" })
    public amountOfBulletsPerLoad: number = 20;

    // Crosshair properties
    public horizontal_crosshair: Texture2D = null!;
    public vertical_crosshair: Texture2D = null!;
    public top_pos_crosshair: Vec2 = new Vec2();
    public bottom_pos_crosshair: Vec2 = new Vec2();
    public left_pos_crosshair: Vec2 = new Vec2();
    public right_pos_crosshair: Vec2 = new Vec2();
    public size_crosshair_vertical: Vec2 = new Vec2(1, 1);
    public size_crosshair_horizontal: Vec2 = new Vec2(1, 1);
    public expandValues_crosshair: Vec2 = new Vec2(0, 0);
    private fadeout_value: number = 1;

    // Player movement properties
    public walkingSpeed: number = 3;
    public runningSpeed: number = 5;

    // Lock camera while melee
    private startLook: number = 0;
    private startAim: number = 0;
    private startRun: number = 0;

    // reload time after anima
    public reloadChangeBulletsTime: number = 0;

    // 角色视角数据
    public pmS: PlayerMovementScript = null!;
    public mls: MouseLookScript = null!;
    public mainCamera: CameraComponent = null!;
    public bulletSpawnPlace: Node = null!;
    public bulletInfo: Label = null!;
    public bulletInfo3D: MeshRenderer = null!;

    start() {
        this.pmS = find("Player")!.getComponent(PlayerMovementScript);
        this.mls = find("Player")!.getComponent(MouseLookScript)!;
        this.bulletInfo = find("Canvas/BulletInfo")!.getComponent(LabelComponent);
        this.mainCamera = this.mls.myCamera;
        this.bulletSpawnPlace = this.mainCamera.node.getChildByName("BulletSpawn");
        this.bulletInfo3D = this.mainCamera.node.getChildByName("BulletInfo")!.getComponent(MeshRenderer)!;

        this.startLook = this.mouseSensitvity_notAiming;
        this.startAim = this.mouseSensitvity_aiming;
        this.startRun = this.mouseSensitvity_running;
        this.rotationLastY = this.mls.currentYRotation;
        this.rotationLastX = this.mls.currentCameraXRotation;
        this.bulletInfo.string = `${this.bulletsIHave} - ${this.bulletsInTheGun}`

        this.currentGunPosition = this.restPlacePosition.clone();
    }

    PositionGun() {
        this.node.setWorldPosition(SmoothDampV3(this.node.getWorldPosition(),
            this.mainCamera.node.getWorldPosition().
                subtract(this.mainCamera.node.right.clone().multiplyScalar(this.currentGunPosition.x + this.currentRecoilXPos).
                    add(this.mainCamera.node.up.clone().multiplyScalar(this.currentGunPosition.y + this.currentRecoilYPos)).
                    add(this.mainCamera.node.forward.clone().multiplyScalar(this.currentGunPosition.z + this.currentRecoilZPos))),
            this.velV, 0));
        this.currentRecoilZPos = SmoothDamp(this.currentRecoilZPos, 0, this.velocity_z_recoil, this.recoilOverTime_z);
        this.currentRecoilXPos = SmoothDamp(this.currentRecoilXPos, 0, this.velocity_x_recoil, this.recoilOverTime_x);
        this.currentRecoilYPos = SmoothDamp(this.currentRecoilYPos, 0, this.velocity_y_recoil, this.recoilOverTime_y);

    }

    RotationGun() {
        this.rotationDeltaY = this.mls.currentYRotation - this.rotationLastY;
        this.rotationDeltaX = this.mls.currentCameraXRotation - this.rotationLastX;

        this.rotationLastY = this.mls.currentYRotation;
        this.rotationLastX = this.mls.currentCameraXRotation;

        this.angularVelocityY = math.lerp(this.angularVelocityY, this.rotationDeltaY, TimeEx.deltaTime * 5);
        this.angularVelocityX = math.lerp(this.angularVelocityX, this.rotationDeltaX, TimeEx.deltaTime * 5);

        this.gunWeightX = SmoothDamp(this.gunWeightX, this.mls.currentCameraXRotation, this.velocityGunRotateX, this.rotationLagTime);
        this.gunWeightY = SmoothDamp(this.gunWeightY, this.mls.currentYRotation, this.velocityGunRotateY, this.rotationLagTime);

        this.node.setWorldRotationFromEuler(this.gunWeightX + (this.angularVelocityX * this.forwardRotationAmount.x), this.gunWeightY + (this.angularVelocityY * this.forwardRotationAmount.y), 0);
    }

    RecoilMath() {
        this.currentRecoilZPos += this.recoilAmount_z;
        this.currentRecoilXPos += (Math.random() - 0.5) * this.recoilAmount_x;
        this.currentRecoilYPos += (Math.random() - 0.5) * this.recoilAmount_y;
        this.mls.wantedCameraXRotation -= Math.abs(this.currentRecoilYPos * this.gunPrecision);
        this.mls.wantedYRotation -= (this.currentRecoilXPos * this.gunPrecision);
        this.expandValues_crosshair = this.expandValues_crosshair.add(new Vec2(6, 12));
    }

    async AnimationMeeleAttack() {
        this.handsAnimator.setValue("meeleAttack", true);
        await TimeEx.WaitForSeconds(0.1);
        this.handsAnimator.setValue("meeleAttack", false);
    }

    async MeeleAttack() {
        if (InputEx.GetKeyDown(KeyCode.KEY_Q) && !this.meeleAttack) {
            this.arm_hit_sound.play();
            await this.AnimationMeeleAttack();
        }
    }

    async ShootMethod() {
        if (this.waitTillNextFire <= 0 && !this.reloading && this.pmS.maxSpeed < 5) {
            if (this.bulletsInTheGun > 0) {
                let randomNumberForMuzzelFlash = Math.floor(Math.random() * 3.9);
                if (this.bullet) {
                    let bullet = instantiate(this.bullet);
                    bullet.parent = this.node.parent;
                    bullet.setWorldPosition(this.bulletSpawnPlace.getWorldPosition());
                    bullet.setWorldRotation(this.bulletSpawnPlace.getWorldRotation());
                }
                else {
                    console.log("Missing the bullet prefab");
                    return;
                }

                if (this.muzzelFlash.length > 0) {
                    this.holdFlash = instantiate(this.muzzelFlash[randomNumberForMuzzelFlash]);
                    this.muzzelSpawn.removeAllChildren();
                    this.holdFlash.parent = this.muzzelSpawn;
                    this.scheduleOnce(()=>{
                        this.holdFlash.destroy();
                    })
                    if (this.shoot_sound_source) {
                        this.shoot_sound_source.play();
                    }
                    else {
                        console.log("Missing 'Shoot Sound Source'.");
                    }
                }

                this.RecoilMath();
                this.waitTillNextFire = 1;
                this.bulletsInTheGun -= 1;

                this.bulletInfo.string = `${this.bulletsIHave} - ${this.bulletsInTheGun}`
            }
            else {
                await this.Reload_Animation();
            }

        }
    }

    Shooting() {
        if (!this.meeleAttack) {            
            if (this.currentStyle == GunStyles.nonautomatic) {
                if (InputEx.GetButtonDown("Fire1")) {
                    this.ShootMethod();
                }
            }
            if (this.currentStyle == GunStyles.automatic) {
                if (InputEx.GetButton("Fire1")) {
                    this.ShootMethod();
                }
            }
        }
        this.waitTillNextFire -= this.roundsPerSecond * TimeEx.deltaTime;
    }

    Sprint() {
        if (InputEx.GetAxis("Vertical") > 0 && InputEx.GetAxis("Fire2") == 0 && this.meeleAttack == false && InputEx.GetAxis("Fire1") == 0) {
            // @ts-ignore
            if (InputEx.GetKeyDown(KeyCode.SHIFT_LEFT)) {
                //@ts-ignore
                find("Player").getComponent("PlayerMovementScript").accelerationSpeed = PlayerMovementScript.speed * 2; 
                this.pmS.maxSpeed = this.runningSpeed;//sets player movement peed to max
            } else {
                this.pmS.maxSpeed = this.walkingSpeed;
                //@ts-ignore
                find("Player").getComponent("PlayerMovementScript").accelerationSpeed = PlayerMovementScript.speed; 
            }
        } else {
            this.pmS.maxSpeed = this.walkingSpeed;
            //@ts-ignore
            find("Player").getComponent("PlayerMovementScript").accelerationSpeed = PlayerMovementScript.speed; 
        }
    }

    CrossHairExpansionWhenWalking() {
        let velocity = new Vec3();
        this.pmS.rigidBody.getLinearVelocity(velocity);

        if (velocity.length() > 1 && InputEx.GetAxis("Fire1") == 0) {
            this.expandValues_crosshair = this.expandValues_crosshair.add(new Vec2(20, 40)).multiplyScalar(TimeEx.deltaTime);
            if (this.pmS.maxSpeed < this.runningSpeed) {
                this.expandValues_crosshair = new Vec2(math.clamp(this.expandValues_crosshair.x, 0, 10), math.clamp(this.expandValues_crosshair.y, 0, 20));
                this.fadeout_value = math.lerp(this.fadeout_value, 1, TimeEx.deltaTime * 2);
            }
            else {
                this.fadeout_value = math.lerp(this.fadeout_value, 0, TimeEx.deltaTime * 10);
                this.expandValues_crosshair = new Vec2(math.clamp(this.expandValues_crosshair.x, 0, 20), math.clamp(this.expandValues_crosshair.y, 0, 40));
            }
        }
        else {
            let temp = new Vec2();
            this.expandValues_crosshair = Vec2.lerp(temp, this.expandValues_crosshair, new Vec2(), TimeEx.deltaTime * 5);
            this.expandValues_crosshair = new Vec2(math.clamp(this.expandValues_crosshair.x, 0, 10), math.clamp(this.expandValues_crosshair.y, 0, 20));
            this.fadeout_value = math.lerp(this.fadeout_value, 1, TimeEx.deltaTime * 2);
        }
    }

    Animations() {
        if (this.handsAnimator) {
            this.reloading = (this.currentAnimationName == this.reloadAnimationName);
            this.handsAnimator.setValue("walkSpeed", this.pmS.currentSpeed);
            this.handsAnimator.setValue("aiming", InputEx.GetButton("Fire2"));
            this.handsAnimator.setValue("maxSpeed", this.pmS.maxSpeed);

            if (InputEx.GetKeyDown(KeyCode.KEY_R) && this.pmS.maxSpeed < 5 && !this.reloading && !this.meeleAttack/* && !aiming*/) {
                this.Reload_Animation();
            }
        }
    }

    async Reload_Animation() {
        if (this.bulletsIHave > 0 && this.bulletsInTheGun < this.amountOfBulletsPerLoad && !this.reloading/* && !aiming*/) {

            if (this.reloadSound_source.playing == false && this.reloadSound_source != null) {
                if (this.reloadSound_source) {
                    this.reloadSound_source.play();
                }
                else {
                    console.log("'Reload Sound Source' missing.");
                }
            }

            if (this.handsAnimator) {
                this.handsAnimator.setValue("reloading", true);
                await TimeEx.WaitForSeconds(0.5);
                this.handsAnimator.setValue("reloading", false);
            }

            await TimeEx.WaitForSeconds(this.reloadChangeBulletsTime - 0.5);
            if (this.meeleAttack == false && this.pmS.maxSpeed != this.runningSpeed) {
                if (this.bulletsIHave - this.amountOfBulletsPerLoad >= 0) {
                    this.bulletsIHave -= this.amountOfBulletsPerLoad - this.bulletsInTheGun;
                    this.bulletsInTheGun = this.amountOfBulletsPerLoad;
                } else if (this.bulletsIHave - this.amountOfBulletsPerLoad < 0) {
                    let valueForBoth = this.amountOfBulletsPerLoad - this.bulletsInTheGun;
                    if (this.bulletsIHave - valueForBoth < 0) {
                        this.bulletsInTheGun += this.bulletsIHave;
                        this.bulletsIHave = 0;
                    } else {
                        this.bulletsIHave -= valueForBoth;
                        this.bulletsInTheGun += valueForBoth;
                    }
                }
            } else {
                this.reloadSound_source.stop();
                console.log("Reload interrupted via meele attack");
            }

            this.bulletInfo.string = `${this.bulletsIHave} - ${this.bulletsInTheGun}`
        }
    }

    MeeleAnimationsStates() {
        if (this.handsAnimator) {
            this.meeleAttack = this.currentAnimationName == this.meeleAnimationName;
            this.aiming = this.currentAnimationName == this.aimingAnimationName;
        }
    }

    GiveCameraScriptMySensitvity() {
        this.mls.mouseSensitvity_notAiming = this.mouseSensitvity_notAiming;
        this.mls.mouseSensitvity_aiming = this.mouseSensitvity_aiming;
    }

    LockCameraWhileMelee() {
        if (this.meeleAttack) {
            this.mouseSensitvity_notAiming = 2;
            this.mouseSensitvity_aiming = 1.6;
            this.mouseSensitvity_running = 1;
        } else {
            this.mouseSensitvity_notAiming = this.startLook;
            this.mouseSensitvity_aiming = this.startAim;
            this.mouseSensitvity_running = this.startRun;
        }
    }

    update(deltaTime: number) {
        this.Shooting();
        this.PositionGun();
        this.RotationGun();
        this.bulletInfo.updateRenderData(true);
        // @ts-ignore
        this.bulletInfo3D.getMaterial(0).setProperty("mainTexture", this.bulletInfo.spriteFrame._texture);
    }

    lateUpdate() {
        this.GiveCameraScriptMySensitvity();
        this.MeeleAttack();
        this.LockCameraWhileMelee();
        this.Sprint();
        this.CrossHairExpansionWhenWalking();
        this.Animations();

        this.MeeleAnimationsStates();

        if (InputEx.GetAxis("Fire2") != 0 && !this.reloading && !this.meeleAttack) {
            // find("Canvas/Crosshair").active = false;
            this.gunPrecision = this.gunPrecision_aiming;
            this.recoilAmount_x = this.recoilAmount_x_;
            this.recoilAmount_y = this.recoilAmount_y_;
            this.recoilAmount_z = this.recoilAmount_z_;
            this.currentGunPosition = SmoothDampV3(this.currentGunPosition, this.aimPlacePosition, this.gunPosVelocity, this.gunAimTime);
            this.mainCamera.fov = SmoothDamp(this.mainCamera.fov, this.cameraZoomRatio_aiming, this.cameraZoomVelocity, this.gunAimTime);
            //this.secondCamera.fov = SmoothDamp(this.secondCamera.fov, this.secondCameraZoomRatio_aiming, this.secondCameraZoomVelocity, this.gunAimTime);
        }
        else {
            // find("Canvas/Crosshair").active = true;
            this.gunPrecision = this.gunPrecision_notAiming;
            this.recoilAmount_x = this.recoilAmount_x_non;
            this.recoilAmount_y = this.recoilAmount_y_non;
            this.recoilAmount_z = this.recoilAmount_z_non;
            this.currentGunPosition = SmoothDampV3(this.currentGunPosition, this.restPlacePosition, this.gunPosVelocity, this.gunAimTime);
            this.mainCamera.fov = SmoothDamp(this.mainCamera.fov, this.cameraZoomRatio_notAiming, this.cameraZoomVelocity, this.gunAimTime);
            //this.secondCamera.fov = SmoothDamp(this.secondCamera.fov, this.secondCameraZoomRatio_notAiming, this.secondCameraZoomVelocity, this.gunAimTime);
        }

        // =========================
        // animator state debug log
        // =========================

        let animStatusText = '';
        const currentStatus = this.handsAnimator.getCurrentStateStatus(0);
        if (currentStatus) {
            animStatusText += `${currentStatus.__DEBUG_ID__ ?? '<unnamed>'}`;
        }
        if (this.handsAnimator.getCurrentTransition(0)) {
            const nextStatus = this.handsAnimator.getNextStateStatus(0);
            if (nextStatus) {
                animStatusText += ` -> ${nextStatus.__DEBUG_ID__ ?? '<unnamed>'}`;
            }
        }

        if (this.lastAnimStatusText !== animStatusText) {
            this.lastAnimStatusText = animStatusText;
            console.log(`Animation status changed: ${animStatusText}`);
        }
    }
}
