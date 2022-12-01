
import { _decorator, Component, Node, Slider, Vec3, RigidBody, misc, PhysicsSystem, Quat, SphereCollider, Button } from 'cc';
import NetWork from '../network/NetWork';
import GCmd from '../config/GCmd';
import { Main } from '../Main';
import EventDispatch from '../utils/EventDispatch';
const { ccclass, property } = _decorator;

@ccclass('BilliardTableControl')
export class BilliardTableControl extends Component {

    //#region 编辑器序列化变量
    @property(Slider)
    powerSlider: Slider = null!;

    @property(Slider)
    directionSlider: Slider = null!;

    @property(Button)
    hitButton: Button = null!;

    @property(Node)
    cue: Node = null!;

    @property(Node)
    ball: Node = null;

    @property(Node)
    beHitBalls: Node = null;
    //#endregion

    private _cueRot:Vec3;

    //#region 私有变量
    private _impulse: Vec3 = new Vec3();
    private _hitBallRot: Vec3 = new Vec3();
    private _hitBallFirstPos: Vec3 = new Vec3();
    private _hitBallFirstScale: Vec3 = new Vec3();
    private _cuePos: Vec3 = new Vec3();
    private _beHitBallsPos = [];
    private _beHitBallsQuat = [];
    //#endregion

    //#region 组件第一次激活前执行，也就是第一次执行 update 之前触发
    start() {
        this.cue.getPosition(this._cuePos);
        this.ball.getPosition(this._hitBallFirstPos);
        this.ball.getScale(this._hitBallFirstScale);
        this.initPhysicUpdateEventListener();

        if (Main.loginData && Main.loginData.ballsData) {
            this.doBallsSync(Main.loginData.ballsData, null, true);
        }
    }

    onDestroy() {
        EventDispatch.inst.off("postUpdateEnd", this);
    }
    //#endregion

    //#region 初始化物理刷新事件监听
    initPhysicUpdateEventListener() {
        EventDispatch.inst.on("postUpdateEnd", this.onPostUpdateEnd, this);
    }
    //#endregion

    //#region 物理刷新结束的回调
    onPostUpdateEnd() {
        if (Vec3.equals(this.ball.scale, Vec3.ZERO)) {
            this.ball.setPosition(this._hitBallFirstPos);
            this.ball.setScale(this._hitBallFirstScale);
            PhysicsSystem.instance.physicsWorld.syncSceneToPhysics();
        }
//        this.cue.active = true;
        this.ball.eulerAngles = new Vec3(0, 0, 0);
//        this.powerSlider.node.active = true;
//        this.directionSlider.node.active = true;

        if(this._isBallMoveByHit){
            this.syncBalls(false);
        }
        this._isBallMoveByHit = false;
    }
    //#endregion

    //#region 控制球杆击球力度
    powerAdjust(slider: Slider) {
        var addPosX = this._cuePos.x * slider.progress;
        var addPosY = this._cuePos.y * slider.progress;
        var newCuePos = new Vec3(this._cuePos.x + addPosX, this._cuePos.y + addPosY,
            this._cuePos.z)
        this.cue.setPosition(newCuePos);
        const powerData = {
            userId: Main.userId,
            power: { x: newCuePos.x, y: newCuePos.y, z: newCuePos.z }
        };
        NetWork.sendDataToServer(null, GCmd.C2S.INITIATE_CUE_SYNC, powerData);
    }
    //#endregion

    //#region 控制球杆击球方向
    directionAdjust(slider: Slider) {
        //此滑块必须是 vertical 类型的，slider._handleLocalPos.y 才会有数值变化
        // var factor = slider._handleLocalPos.y > 0 ? 1 : -1;

        var addRotationY = 360 * slider.progress * 1;
        var newHitBallRot = new Vec3(this._hitBallRot.x, this._hitBallRot.y + addRotationY,
            this._hitBallRot.z);
        this.ball.eulerAngles = newHitBallRot;
        this._cueRot = newHitBallRot;
        const directionData = {
            userId: Main.userId,
            direction: { x: newHitBallRot.x, y: newHitBallRot.y, z: newHitBallRot.z }
        };
        NetWork.sendDataToServer(null, GCmd.C2S.INITIATE_CUE_SYNC, directionData);
    }
    //#endregion

    //#region 击球
    // *击球时要隐藏 UI 界面
    // *击球时要把所有球的坐标和旋转向其它客户端同步，保证所有客户端的物理世界数据一致
    // *击球之后要立即调用固定频率、固定时长的定时器对物理世界和节点树进行同步刷新
    private _isBallMoveByHit = false;
    hitBall() {
        //TODO: 把对 active 的修改变为对 position 的修改性能会更好
        //TODO: 击球后球杆消失动画需要补充
        Main._postUpdateStepCount = 0;
        this._isBallMoveByHit = true;

        this.cue.active = false;
        this.powerSlider.node.active = false;
        this.directionSlider.node.active = false;

        var rigidbodyBall = this.ball.getComponent(RigidBody);
        this._impulse = new Vec3(40 * (1 + this.powerSlider.progress), 0, 0);
        var radian = misc.degreesToRadians(this.ball.eulerAngles.y);
        Vec3.rotateY(this._impulse, this._impulse, this.ball.getComponent(SphereCollider).center, radian);

        this.syncBalls(true);

        rigidbodyBall.applyImpulse(this._impulse);

        this.schedule(Main.postUpdate.bind(this, 0.0166667), 0.0166667, 119, 0.0166667);
    }
    //#endregion

    //#region 向其它客户端同步小球的坐标和旋转角度
    syncBalls(needImpulse) {
        this._beHitBallsPos.length = 0;
        this._beHitBallsQuat.length = 0;
        this.ball.getComponent(RigidBody).clearState();
        for (let i = 0; i < this.beHitBalls.children.length; i++) {
            this._beHitBallsPos.push(this.beHitBalls.children[i].position.x);
            this._beHitBallsPos.push(this.beHitBalls.children[i].position.y);
            this._beHitBallsPos.push(this.beHitBalls.children[i].position.z);
            this._beHitBallsQuat.push(this.beHitBalls.children[i].worldRotation.x);
            this._beHitBallsQuat.push(this.beHitBalls.children[i].worldRotation.y);
            this._beHitBallsQuat.push(this.beHitBalls.children[i].worldRotation.z);
            this._beHitBallsQuat.push(this.beHitBalls.children[i].worldRotation.w);
            this.beHitBalls.children[i].getComponent(RigidBody).clearState();
        }
        PhysicsSystem.instance.physicsWorld.syncSceneToPhysics();
        var syncBallData = {
            "userId": Main.userId,
            "ballPos": { x: this.ball.position.x, y: this.ball.position.y, z: this.ball.position.z },
            "ballQuat": { x: this.ball.worldRotation.x, y: this.ball.worldRotation.y, z: this.ball.worldRotation.z, w: this.ball.worldRotation.w },
            "beHitBallsPos": this._beHitBallsPos,
            "beHitBallsQuat": this._beHitBallsQuat,
        }
        if (needImpulse) {
            syncBallData["hitImpulse"] = { x: this._impulse.x, y: this._impulse.y, z: this._impulse.z };
            NetWork.sendDataToServer(null, GCmd.C2S.HIT_BALL, syncBallData);
        }
        else{
            NetWork.sendDataToServer(null, GCmd.C2S.HIT_BALL_COMPLETE, syncBallData);
        }
    }
    //#endregion 向其它客户端同步小球的坐标和旋转角度

    //#region 共享方法，方便其它脚本执行球的同步
    public doBallsSync(data, callback, forceSync: boolean = false) {
        if (forceSync || Main.userId !== data.userId) {
            this.ball.setPosition(data.ballPos);
            this.ball.setWorldRotation(data.ballQuat);
            this.ball.getComponent(RigidBody).clearState();
            for (let i = 0, j = 0, k = 0; i < this.beHitBalls.children.length; i++, j += 3, k += 4) {
                var newPos = new Vec3(data.beHitBallsPos[j], data.beHitBallsPos[j + 1], data.beHitBallsPos[j + 2]);
                var newQuat = new Quat(data.beHitBallsQuat[k], data.beHitBallsQuat[k + 1], data.beHitBallsQuat[k + 2], data.beHitBallsQuat[k + 3]);
                this.beHitBalls.children[i].setPosition(newPos);
                // console.log(`data.beHitBallsQuat[j]: ${data.beHitBallsQuat[k]} data.beHitBallsQuat[j+1]: ${data.beHitBallsQuat[k+1]} data.beHitBallsQuat[j+2]: ${data.beHitBallsQuat[k+2]} data.beHitBallsQuat: ${data.beHitBallsQuat[k+3]}`)
                this.beHitBalls.children[i].setWorldRotation(newQuat);
                this.beHitBalls.children[i].getComponent(RigidBody).clearState();
            }
            PhysicsSystem.instance.physicsWorld.syncSceneToPhysics();
            if (data.hitImpulse) {
                var _impulse = new Vec3(data.hitImpulse.x, data.hitImpulse.y, data.hitImpulse.z);
                this.ball.getComponent(RigidBody).applyImpulse(_impulse)
            }
            if (callback) {
                callback();
            }
        }
    }
    //#endregion

    //#region 同步球杆的位置和方向
    public doCueSync(data) {
        if (data.power) {
            this.cue.setPosition(data.power);
        }
        if (data.direction) {
            this.ball.eulerAngles = data.direction;
            this._cueRot = data.direction;
        }
    }
    //#endregion
}