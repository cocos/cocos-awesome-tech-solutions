
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
    public static userId = "";
    public static _subStepCount = 0;
    public static _accumulator = 0;
    public static _postUpdateStepCount = 0;
    //#endregion

    //#region 组件第一次激活前执行，也就是第一次执行 update 之前触发
    start(){
        this.initUser();
        this.initEventListener();
    }
    //#endregion

    //#region 用户信息初始化
    initUser () {
        var idNum = Math.round(Math.random() * 10000);
        this.userId.string = "用户ID: " + idNum.toString();
        Main.userId = idNum.toString();

        NetWork.connectToWsserver();
    }
    //#endregion

    //#region 开始注册监听事件
    initEventListener () {
        EventDispatch.instance().on(GEvent.BALLS_SYNC, this.onBallsSyncEvent, this);
        EventDispatch.instance().on(GEvent.CUE_SYNC, this.onCueSync, this);
    }
    //#endregion

    //#region BALLS_SYNC 事件回调
    onBallsSyncEvent (data)
    {
        BilliardTableControl.doBallsSync(data, this.onBallsSyncFinish.bind(this));
    }

    onBallsSyncFinish () {
        Main._postUpdateStepCount = 0;
        this.schedule(Main.postUpdate.bind(this, 0.0166667), 0.0166667, 119, 0.0166667);
    }
    //#endregion

    //#region CUE_SYNC 事件回调
    onCueSync (data) {
        if (Main.userId !== data.userId) { 
            BilliardTableControl.doCueSync(data);
        }
    }
    //#endregion

    //#region 可动态调度的物理刷新接口
    public static postUpdate (deltaTime: number) {
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
            EventDispatch.instance().emit("postUpdateEnd");
        }
        director.emit(Director.EVENT_AFTER_PHYSICS);
    }
    //#endregion
}
