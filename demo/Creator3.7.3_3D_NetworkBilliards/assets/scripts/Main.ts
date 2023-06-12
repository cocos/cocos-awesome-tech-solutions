
import { _decorator, Component, Node, EditBox, Label, PhysicsSystem, Vec3, director, RigidBody, Director, game } from 'cc';
import { BilliardTableControl } from './component/BilliardTableControl';
import GCmd from './config/GCmd';
import GEvent from './config/GEvent';
import NetWork from './network/NetWork';
import EventDispatch from './utils/EventDispatch';
import Utils from './utils/utils';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    //#region 
    @property(Label)
    userId: Label = null!;
    //#endregion

    //#region 全局共享静态变量
    public static loginData: any;
    public static userId = "";
    public static currentPlayer = "";
    public static _subStepCount = 0;
    public static _accumulator = 0;
    public static _postUpdateStepCount = 0;
    //#endregion

    private tableCtrl:BilliardTableControl;
    //#region 组件第一次激活前执行，也就是第一次执行 update 之前触发
    start() {
        if (!Main.userId) {
            director.loadScene('login');
            return;
        }
        this.tableCtrl = this.node.getComponent(BilliardTableControl);
        this.initUser();
        this.initEventListener();
    }

    onDestroy() {
        EventDispatch.inst.off(GEvent.HIT_BALL_SYNC, this);
        EventDispatch.inst.off(GEvent.HIT_BALL_COMPLETE_SYNC, this);
        EventDispatch.inst.off(GEvent.CUE_SYNC, this);
    }
    //#endregion

    //#region 用户信息初始化
    initUser() {
        this.userId.string = "用户ID: " + Main.userId;
        Main.currentPlayer = Main.loginData.currentPlayer;
        this.updateCtrlUI();
    }
    //#endregion

    //#region 开始注册监听事件
    initEventListener() {
        EventDispatch.inst.on(GEvent.HIT_BALL_SYNC, this.onHitBallSync, this);
        EventDispatch.inst.on(GEvent.HIT_BALL_COMPLETE_SYNC, this.onHitBallCompleteSync, this);
        EventDispatch.inst.on(GEvent.CUE_SYNC, this.onCueSync, this);
    }
    //#endregion

    updateCtrlUI(){
        let isSelfTurn = Main.currentPlayer == Main.userId;
        this.tableCtrl.cue.active = true;
        this.tableCtrl.powerSlider.node.active = isSelfTurn;
        this.tableCtrl.directionSlider.node.active = isSelfTurn;
        this.tableCtrl.hitButton.node.active = isSelfTurn;
    }


    onHitBallSync(data){
        this.tableCtrl.cue.active = false;
        this.tableCtrl.powerSlider.node.active = false;
        this.tableCtrl.directionSlider.node.active = false;
        this.tableCtrl.hitButton.node.active = false;
        this.tableCtrl.doBallsSync(data, this.onBallsSyncFinish.bind(this));
    }

    onHitBallCompleteSync(data){
        Main.currentPlayer = data.currentPlayer;
        this.updateCtrlUI();
        this.tableCtrl.doBallsSync(data, null);
    }

    onBallsSyncFinish() {
        Main._postUpdateStepCount = 0;
        this.schedule(Main.postUpdate.bind(this, 0.0166667), 0.0166667, 119, 0.0166667);
    }
    //#endregion

    //#region CUE_SYNC 事件回调
    onCueSync(data) {
        if (Main.userId !== data.userId) {
            this.tableCtrl.doCueSync(data);
        }
    }
    //#endregion

    //#region 可动态调度的物理刷新接口
    public static postUpdate(deltaTime: number) {
        if (!PhysicsSystem.instance.physicsWorld) return;
        if (!PhysicsSystem.instance.enable) {
            PhysicsSystem.instance.physicsWorld.syncSceneToPhysics();
            return;
        }
        Main._subStepCount = 0;
        Main._accumulator += deltaTime;
        director.emit(Director.EVENT_BEFORE_PHYSICS);
        while (Main._subStepCount < PhysicsSystem.instance.maxSubSteps) {
            if (Main._accumulator >= PhysicsSystem.instance.fixedTimeStep) {
                PhysicsSystem.instance.physicsWorld.syncSceneToPhysics();
                PhysicsSystem.instance.physicsWorld.step(PhysicsSystem.instance.fixedTimeStep);
                PhysicsSystem.instance.physicsWorld.emitEvents();
                PhysicsSystem.instance.physicsWorld.syncAfterEvents();
                Main._accumulator -= PhysicsSystem.instance.fixedTimeStep;
                Main._subStepCount++;
            } else {
                PhysicsSystem.instance.physicsWorld.syncSceneToPhysics();
                break;
            }
        }
        Main._postUpdateStepCount++;
        if (Main._postUpdateStepCount === 120) {
            EventDispatch.inst.emit("postUpdateEnd");
        }
        director.emit(Director.EVENT_AFTER_PHYSICS);
    }
    //#endregion
}
