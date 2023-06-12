
import { _decorator, Component, PhysicsSystem2D, EPhysics2DDrawFlags, Node, game, Prefab, instantiate, RigidBody2D, profiler, NodePool, Vec2, Label } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PerformanceTest
 * DateTime = Mon Nov 08 2021 14:24:24 GMT+0800 (中国标准时间)
 * Author = zzf520
 * FileBasename = performanceTest.ts
 * FileBasenameNoExtension = performanceTest
 * URL = db://assets/cases/performanceTest/performanceTest.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('PerformanceTest')
export class PerformanceTest extends Component {

    @property(Prefab)
    ball: Prefab = null!;

    @property(Node)
    ballParentLeft: Node = null!;

    @property(Node)
    ballParentRight: Node = null!;

    newBallLength: number = 0;

    @property(Label)
    isSupportWASM: Label = null!;

    ballspool: NodePool = null!;

    onLoad () {
        this.ballspool = new NodePool();
        for (let i = 0; i < 10000; i++) {
            var newball = instantiate(this.ball);
            this.ballspool.put(newball);
            if ( i === 9999) {
                profiler.showStats();
            }
        }
    }

    onEnable () {
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.None;

        if (this.iswebasm()) {
            this.isSupportWASM.string = `This platform supports WebAssembly`;
        } else {
            this.isSupportWASM.string = `This platform no supports WebAssembly`;
        }
    }

    onShootClicked () {
        if (this.ballspool.size() <= 0) {
            profiler.hideStats();
            return;
        }
        this.newBallLength += 100;
        var nowLeftLength = this.ballParentLeft.children.length;
        var nowRightLength = this.ballParentRight.children.length;
        var marginLeftLength = this.newBallLength - nowLeftLength;
        var marginRightLength = this.newBallLength - nowRightLength;
        this.schedule(()=>{
            var newball = this.ballspool.get();
            if (!newball) return;
            var rigidBody2d = newball.getComponent(RigidBody2D);
            rigidBody2d!.linearVelocity = new Vec2(10, 0);
            this.ballParentLeft.addChild(newball);
        }, 0.25, marginLeftLength - 1, 0.25)
        this.schedule(()=>{
            var newball = this.ballspool.get();
            if (!newball) return;
            var rigidBody2d = newball.getComponent(RigidBody2D);
            rigidBody2d!.linearVelocity = new Vec2(-10, 0);
            this.ballParentRight.addChild(newball);
        }, 0.25, marginRightLength - 1, 0.25)
    }

    iswebasm () {
        var useWasm = false;
        var webAsmObj = window["WebAssembly"];
        if (typeof webAsmObj === "object") {
            if (typeof webAsmObj["Memory"] === "function")
            {
                if ((typeof webAsmObj["instantiateStreaming"] === "function") || (typeof webAsmObj["instantiate"] === "function"))
                useWasm = true;
            }
        }
        return useWasm;  
    }

    onDisable () {
        PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Shape | EPhysics2DDrawFlags.Joint;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/zh/scripting/life-cycle-callbacks.html
 */
