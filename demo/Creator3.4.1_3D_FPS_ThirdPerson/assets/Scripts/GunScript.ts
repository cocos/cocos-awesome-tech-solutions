
import { _decorator, Component, Node, animation, KeyCode, CameraComponent, Vec3, Vec2, math, quat, Quat, AudioSource, instantiate, Texture2D, Prefab } from 'cc';
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

@ccclass('GunScript')
export class GunScript extends Component {
    public muzzelFlash: Node[] = [];
    public muzzelSpawn: Node = null!;
    private holdFlash: Node = null!;
    @property(AudioSource)
    public reloadSound_source: AudioSource = null!;
    @property(AudioSource)
    public shoot_sound_source: AudioSource = null!;
    public currentStyle: GunStyles = GunStyles.nonautomatic;

    @property(MouseLookScript)
    public mls: MouseLookScript = null!;
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

    @property(PlayerMovementScript)
    public pmS: PlayerMovementScript = null!;

    @property(CameraComponent)
    public mainCamera: CameraComponent = null!;
    public secondCamera: CameraComponent = null!;
    public currentGunPosition: Vec3 = new Vec3();
    private velV: Vec3 = new Vec3();
    private currentRecoilZPos: number = 0;
    private currentRecoilXPos: number = 0;
    private currentRecoilYPos: number = 0;
    public velocity_z_recoil: number[] = [0];
    public velocity_x_recoil: number[] = [0];
    public velocity_y_recoil: number[] = [0];

    //Gun Recoil

    public recoilOverTime_z: number = 0.1;
    public recoilOverTime_x: number = 0.1;
    public recoilOverTime_y: number = 0.1;
    public recoilAmount_z: number = 0.5;
    public recoilAmount_x: number = 0.5;
    public recoilAmount_y: number = 0.5;
    public recoilAmount_z_non: number = 0.02;
    public recoilAmount_x_non: number = 0.02;
    public recoilAmount_y_non: number = 0.02;
    public recoilAmount_z_: number = 0.01;
    public recoilAmount_x_: number = 0.005;
    public recoilAmount_y_: number = 0.005;

    public restPlacePosition: Vec3 = new Vec3();
    public aimPlacePosition: Vec3 = new Vec3();
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
    public mouseSensitvity_notAiming: number = 4;
    public mouseSensitvity_aiming: number = 5;
    public mouseSensitvity_running: number = 4;

    // Shooting setup - MUSTDO
    @property({ type: Node, tooltip: "子弹射出位置" })
    public bulletSpawnPlace: Node = null!;
    @property({ type: Prefab, tooltip: "子弹" })
    public bullet: Prefab = null!;
    @property
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

    start() {
        this.startLook = this.mouseSensitvity_notAiming;
        this.startAim = this.mouseSensitvity_aiming;
        this.startRun = this.mouseSensitvity_running;
        this.rotationLastY = this.mls.currentYRotation;
        this.rotationLastX = this.mls.currentCameraXRotation;
    }

    PositionGun() {
        this.node.setWorldPosition(SmoothDampV3(this.node.getWorldPosition(),
            this.mainCamera.node.getWorldPosition().
                subtract(Vec3.RIGHT.clone().multiplyScalar(this.currentGunPosition.x + this.currentRecoilXPos).
                    add(Vec3.UP.clone().multiplyScalar(this.currentGunPosition.y + this.currentRecoilYPos)).
                    add(Vec3.FORWARD.clone().multiplyScalar(this.currentGunPosition.z + this.currentRecoilZPos))),
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

        let quat = new Quat();
        this.node.setRotation(Quat.fromEuler(quat, this.gunWeightX + (this.angularVelocityX * this.forwardRotationAmount.x), this.gunWeightY + (this.angularVelocityY * this.forwardRotationAmount.y), 0));
    }

    RecoilMath() {
        this.currentRecoilZPos -= this.recoilAmount_z;
        this.currentRecoilXPos -= (Math.random() - 0.5) * this.recoilAmount_x;
        this.currentRecoilYPos -= (Math.random() - 0.5) * this.recoilAmount_y;
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
            await this.AnimationMeeleAttack();;
        }
    }

    async ShootMethod() {
        if (this.waitTillNextFire <= 0 && !this.reloading && this.pmS.maxSpeed < 5) {
            if (this.bulletsInTheGun > 0) {
                let randomNumberForMuzzelFlash = Math.random() * 5;
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
                    this.holdFlash.position = this.muzzelSpawn.position;

                    let quat0 = new Quat(), quat1 = new Quat();
                    this.holdFlash.setRotation(Quat.multiply(quat0, this.muzzelSpawn.rotation, Quat.fromEuler(quat1, 0, 0, 90)));

                    this.holdFlash.parent = this.muzzelSpawn;
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
            if (InputEx.GetKeyDown(KeyCode.KEY_LShift)) {
                if (this.pmS.maxSpeed == this.walkingSpeed) {
                    this.pmS.maxSpeed = this.runningSpeed;//sets player movement peed to max

                } else {
                    this.pmS.maxSpeed = this.walkingSpeed;
                }
            }
        } else {
            this.pmS.maxSpeed = this.walkingSpeed;
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
        this.GiveCameraScriptMySensitvity();
        this.PositionGun();
        this.Shooting();
        //this.MeeleAttack();
        this.LockCameraWhileMelee();
        //this.Sprint();
        //this.CrossHairExpansionWhenWalking();
    }

    lateUpdate() {
        this.Animations();
        this.RotationGun();
        this.MeeleAnimationsStates();

        if (InputEx.GetAxis("Fire2") != 0 && !this.reloading && !this.meeleAttack) {
            this.gunPrecision = this.gunPrecision_aiming;
            this.recoilAmount_x = this.recoilAmount_x_;
            this.recoilAmount_y = this.recoilAmount_y_;
            this.recoilAmount_z = this.recoilAmount_z_;
            this.currentGunPosition = SmoothDampV3(this.currentGunPosition, this.aimPlacePosition, this.gunPosVelocity, this.gunAimTime);
            this.mainCamera.fov = SmoothDamp(this.mainCamera.fov, this.cameraZoomRatio_aiming, this.cameraZoomVelocity, this.gunAimTime);
            //this.secondCamera.fov = SmoothDamp(this.secondCamera.fov, this.secondCameraZoomRatio_aiming, this.secondCameraZoomVelocity, this.gunAimTime);
        }
        else {
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
