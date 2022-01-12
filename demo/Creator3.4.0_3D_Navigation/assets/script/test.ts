/**
@class test
@author YI ZHANG
@date 2021/3/31
@desc
**/
import {_decorator,systemEvent, Touch, Node,Component, geometry, math, Camera, Material, NodePool, Vec3, v3, EventKeyboard, macro, resources, Toggle, Asset, MeshRenderer, RenderableComponent, Vec2, instantiate, SystemEventType} from 'cc';
import RecastDetourManager from "./recastdetourjs/tool/RecastDetourManager";
import {IObstacle} from "./navigation/INavigationEngine";
import {RecastJSPlugin} from "./navigation/recastJsPlugin";

const { ccclass, property } = _decorator;
@ccclass('Test')
export class Test extends Component {
    private recastDetourManager!: RecastDetourManager;
    @property(Node)
    roleNode : Node = null!;
    @property(Node)
    cylinderObstacleNode : Node = null!;
    @property(Node)
    boxObstacleNode : Node = null!;
    @property(Camera)
    camera : Camera = null!;
    @property(Material)
    debugMaterial : Material = null!;
    private pool !: NodePool;
    private cylinderObstaclePool !: NodePool;
    private boxObstaclePool !: NodePool;
    private roleNodeRoot!: Node;
    private type: number = 1;
    private obstacleList: {node : Node,obstacle : IObstacle}[] = [];
    private yKey: number = 0;
    private xKey: number = 0;
    private startLinkPos?: Vec3;
    private moveDis!: number;
    private boss: number = 0;
    async start () {
        this.pool = new NodePool();
        this.roleNodeRoot = this.roleNode.parent!;
        this.roleNode.removeFromParent();
        this.cylinderObstacleNode.removeFromParent();
        this.boxObstacleNode.removeFromParent();
        this.moveDis = 0;
        this.recastDetourManager = await RecastDetourManager.getInstanceByNode(this.node,this.debugMaterial,1,this.node);


        this.node.on(Node.EventType.TOUCH_END,this.onTouch,this);
        this.node.on(Node.EventType.TOUCH_MOVE,this.onMove,this);
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown,this);
        systemEvent.on(SystemEventType.KEY_UP,this.onKeyUp,this);
        this.cylinderObstaclePool = new NodePool();
        this.boxObstaclePool = new NodePool();
        //this.node.children[0].active = false;
    }

    getRandomPos(){
        return v3((Math.random() - 0.5) * 100,2,(Math.random() - 0.5) * 100).add(this.node.getWorldPosition());
    }

    onKeyDown(event : EventKeyboard){
        switch (event.keyCode) {
            case macro.KEY.w:
            case macro.KEY.s:
                this.yKey = event.keyCode;
                break;
            case macro.KEY.a:
            case macro.KEY.d:
                this.xKey = event.keyCode;
                break;
        }
    }

    onKeyUp(event : EventKeyboard){
        if(event.keyCode == this.yKey){
            this.yKey = 0;
            return;
        }
        if (event.keyCode == this.xKey){
            this.xKey = 0;
        }
    }

    toggleClick(e : Toggle): void{
        this.type = Number(e.node.name[e.node.name.length - 1]);
    }

    loadBin(){
        resources.load("solo_navmesh",Asset,(err : any,asset : any)=> {
            this.loadRecast(asset._buffer);
        })
    }

    async loadRecast(assetBuffer : ArrayBuffer)
    {
        this.recastDetourManager = await RecastDetourManager.getInstanceByBin(assetBuffer,this.debugMaterial,1);
    }

    saveBin(){
        this.saveFile("solo_navmesh.bin",this.recastDetourManager.navigationPlugin.getNavmeshData());
    }

    exportObj(){
        let comps = this.node.getComponentsInChildren(MeshRenderer);
        let str = RecastJSPlugin.exportObj(comps);
        this.saveFile("scene.obj",str);
    }

    saveFile(name : string,asset : ArrayBuffer | string){
        let blob  = new Blob([asset],{type: 'application/octet-stream'});
        let a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
    }



    onTouch(touch : Touch){
        if(this.moveDis > 50){
            this.moveDis = 0;
            return;
        }
        let ray = this.camera.screenPointToRay(touch.getLocationX(), touch.getLocationY());
        let comps = this.node.getComponentsInChildren(MeshRenderer);
        let distance = Number.MAX_VALUE;
        for(let i = 0;i < comps.length;++i){
            let dis = geometry.intersect.rayModel(ray, comps[i].model!,{mode : geometry.ERaycastMode.CLOSEST,doubleSided : false,distance : Number.MAX_SAFE_INTEGER});
            if(dis && dis < distance){
                distance = dis;
            }
        }
        if(distance == Number.MIN_VALUE){
            return;
        }
        let out = v3();
        ray.computeHit(out,distance);
        switch (this.type) {
            case 1 :
                let id = this.recastDetourManager.addAgents(out);
                let role = this.get(this.pool,this.roleNode);
                let comp = role.getComponent(RenderableComponent)!;
                comp.unscheduleAllCallbacks();
                comp.schedule(()=>{
                    role.setWorldPosition(this.recastDetourManager.crowd!.getAgentPosition(id));
                });
                break;
            case 2:
                this.recastDetourManager.agentGoto(out);
                break;
            case 3:
                let node = this.get(this.cylinderObstaclePool,this.cylinderObstacleNode);
                this.recastDetourManager.addCylinderObstacle(node,out,1,2);
                break;
            case 4:
                let node1 = this.get(this.boxObstaclePool,this.boxObstacleNode);
                this.recastDetourManager.addBoxObstacle(node1,out,v3(1,1,1),0);
                break;
            case 5:
                if(!this.startLinkPos){
                    this.startLinkPos = out;
                    break;
                }
                this.roleNodeRoot.removeAllChildren();
                this.recastDetourManager.addLink(this.startLinkPos,out);
                this.startLinkPos = undefined;
                break;
        }
        if(this.type != 5){
            this.startLinkPos = undefined;
        }
    }

    onMove(touch : Touch){
        let movePos = touch.getLocation().subtract(touch.getPreviousLocation());
        this.moveDis += movePos.length();
        this.updateRotation(movePos);
    }

    updateRotation(movePos : Vec2){
        let rotation = this.camera.node.eulerAngles;
        let y = rotation.y + -movePos.x / 5;
        let x = rotation.x + movePos.y / 5;
        this.camera.node.setRotationFromEuler(x,y,0);
    }

    removeAllObstacle(){
       this.recastDetourManager.removeAllObstacle();
    }

    removeAllLink(){
        this.recastDetourManager.removeAllLink();
    }

    protected onEnable(): void {
    }

    get(pool : NodePool,node : Node){
        let item = pool.get() || instantiate(node);
        item.parent = this.roleNodeRoot;
        return item;
    }

    put(node : Node){
        this.pool.put(node);
    }

    update (deltaTime: number) {
        if(!this.recastDetourManager){
            return;
        }
        this.recastDetourManager.update(deltaTime);
        let ySpeed = this.yKey ? (this.yKey == macro.KEY.w ? 1 : -1) : 0;
        let xSpeed = this.xKey ? (this.xKey == macro.KEY.d ? 1 : -1) : 0;
        if(ySpeed && xSpeed){
            xSpeed *= 0.7;
            ySpeed *= 0.7;
        }
        let speed = v3();
        if(ySpeed){
            speed.add(this.camera.node.forward.multiplyScalar(ySpeed));
        }
        if(xSpeed){
            let worldRotation = this.camera.node.getWorldRotation();
            math.Quat.rotateY(worldRotation,worldRotation,Math.PI / 2);
            speed.add( Vec3.transformQuat(new Vec3(), Vec3.FORWARD, worldRotation).multiplyScalar(-xSpeed));
        }
        this.camera.node.getWorldRotation();
        let pos = this.camera.node.getPosition();
        this.camera.node.setPosition(pos.add(speed));
        //console.log(this.recastDetourManager.CrowdSimApp.agents);
    }
}
