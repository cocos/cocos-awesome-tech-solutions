/**
@class RecastDetourManager
@author YI ZHANG
@date 2021/3/19
@desc
**/

import { _decorator, Vec3, Node, Material, MeshRenderer, Line, Color, director, isValid, UIMeshRenderer, v3 } from "cc";
import { RecastConfig, RecastJSCrowd, RecastJSPlugin } from "../../navigation/recastJsPlugin";
import { INavMeshParameters, IObstacle, OffMeshLinkConfig } from "../../navigation/INavigationEngine";

const { ccclass, property } = _decorator;
let CON_LINK_ID = 1000;
@ccclass("RecastDetourManager")
export default class RecastDetourManager {

    currentMillisecond = 0;
    millisecondsBetweenFrames = 40; //40ms between frames, or 25fps
    currentTick = 0;
    navmeshdebug!: Node;
    crowd?: RecastJSCrowd;
    navigationPlugin!: RecastJSPlugin;
    private dt: number = 0;
    private debugMaterial!: Material;
    private debugLayer: number = 1;
    private static instance: RecastDetourManager;
    private obstacleList: { node: Node, obstacle: IObstacle }[] = [];
    private linkList !: OffMeshLinkConfig & { node: Node[] };
    private config!: INavMeshParameters;
    private meshes!: MeshRenderer[];
    private root: Node | undefined;

    constructor() {
        this.resetLinkList();
    }

    /**
     * 添加连线，联通两个区域
     * @param startPos
     * @param endPos
     * @param conRad
     * @param conFlag
     * @param conArea
     * @param conDir
     */
    addLink(startPos: Vec3, endPos: Vec3, conRad = 0.6, conFlag = 1, conArea = 5, conDir = 1) {
        startPos.multiplyScalar(1 / RecastConfig.RATIO);
        endPos.multiplyScalar(1 / RecastConfig.RATIO);
        this.navigationPlugin.getClosestPoint(startPos);
        this.navigationPlugin.getClosestPoint(endPos);
        this.linkList.offMeshConVerts.push(startPos.x, startPos.y, startPos.z, endPos.x, endPos.y, endPos.z);
        this.linkList.offMeshConRad.push(conRad);
        this.linkList.offMeshConFlags.push(conFlag);
        this.linkList.offMeshConAreas.push(conArea);
        this.linkList.offMeshConDir.push(conDir);
        this.linkList.offMeshConCount++;
        let id = CON_LINK_ID++;
        this.linkList.offMeshConUserID.push(id);
        this.reBuild();
        let node = new Node();
        let comp = node.addComponent(Line);
        comp.worldSpace = true;
        comp.width.constant = 0.1;
        comp.color.color = Color.BLUE;
        // @ts-ignore
        comp.positions.push(startPos, endPos);
        this.root!.addChild(node);
        this.linkList.node.push(node);
        return id;
    }

    removeAllLink() {
        for (let i = 0; i < this.linkList.node.length; ++i) {
            this.linkList.node[i].destroy();
        }
        this.resetLinkList();
    }

    resetLinkList() {
        this.linkList = <any>{
            offMeshConVerts: [],//float[]
            //link 弧度  暂未搞清楚是干嘛的
            offMeshConRad: [],//float[]
            //link标志
            offMeshConFlags: [],//char[]
            //AreaTypeList char 区域类型
            offMeshConAreas: [],//char[]
            //是否双向 0 否 1是
            offMeshConDir: [],//int[]
            //link id
            offMeshConUserID: [],//int[]
            //link 数量
            offMeshConCount: 0, //int
            // link node
            node: []
        }
    }

    /**
     * 重新构建
     */
    reBuild() {
        this.config.offMeshLinkConfig = this.linkList;
        this.navigationPlugin.createNavMesh(this.meshes, this.config);
        this.init();
    }

    static async getInstanceByNode(node: Node, debugMaterial: Material, debugLayer: number, root: Node) {
        let comps = node.getComponentsInChildren(MeshRenderer);
        let instance = await this.getInstance(debugMaterial, debugLayer, root);
        let navmeshParameters = {
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 45,
            walkableHeight: 15,
            walkableClimb: 2.0,
            walkableRadius: 0.6,
            maxEdgeLen: 12.,
            maxSimplificationError: 0.5,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 3,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
            offMeshLinkConfig: instance.linkList,
            tileSize: 16
        };
        instance.config = navmeshParameters;
        instance.meshes = comps;
        instance.navigationPlugin.createNavMesh(comps, navmeshParameters);
        instance.init();
        return instance;
    }





    protected static async getInstance(debugMaterial?: Material, debugLayer?: number, root?: Node) {
        if (this.instance) {
            return this.instance;
        }
        let instance = new RecastDetourManager();
        this.instance = instance;
        instance.root = root;
        instance.debugMaterial = debugMaterial!;
        instance.debugLayer = debugLayer!;
        let navigationPlugin: RecastJSPlugin;
        await new Promise(resolve => {
            navigationPlugin = new RecastJSPlugin(() => {
                resolve(null);
            });
        })
        instance.navigationPlugin = navigationPlugin!;
        return instance;
    }

    static async getInstanceByBin(asset: ArrayBuffer, debugMaterial: Material, debugLayer: number) {
        let instance = await this.getInstance(debugMaterial, debugLayer);
        instance.navigationPlugin.buildFromNavmeshData(new Uint8Array(asset));
        instance.init();
        return instance;
    }

    init() {
        if (this.crowd) {
            this.removeAllAgents();
        }
        let scene = director.getScene()!;
        let crowd = this.navigationPlugin.createCrowd(100, 1, scene);
        this.crowd = crowd as RecastJSCrowd;
        this.updateNavMeshDebug();
    }

    updateNavMeshDebug() {
        if (isValid(this.navmeshdebug)) {
            this.navmeshdebug.destroy();
        }
        this.navmeshdebug = this.navigationPlugin.createDebugNavMesh(this.root!);
        this.navmeshdebug.getComponent(MeshRenderer)!.setMaterial(this.debugMaterial, 0);
        this.navmeshdebug.layer = this.debugLayer;
        this.navmeshdebug.addComponent(UIMeshRenderer);
    }

    /**
     * 角色导航至position
     * @param position
     */
    agentGoto(position: Vec3) {
        let out = position.multiplyScalar(1 / RecastConfig.RATIO);
        out = this.navigationPlugin.getClosestPoint(out);
        console.log("goto", out);
        let agents = this.crowd!.getAgents();
        for (let i = 0; i < agents.length; ++i) {
            this.crowd!.agentGoto(agents[i], out);
        }
    }

    /**
     * 角色导航至position
     * @param position
     */
    agentGotoByIndex(index: number, position: Vec3) {
        let out = position.multiplyScalar(1 / RecastConfig.RATIO);
        out = this.navigationPlugin.getClosestPoint(out);
        console.log("goto", out);
        this.crowd!.agentGoto(index, out);
    }

    agentTeleportByIndex(index: number, position: Vec3) {
        let out = position.multiplyScalar(1 / RecastConfig.RATIO);
        out = this.navigationPlugin.getClosestPoint(out);
        console.log("goto", out);
        this.crowd!.agentTeleport(index, out);
    }

    /**
     * 添加角色
     * @param startPos
     */
    addAgents(startPos: Vec3) {
        startPos.multiplyScalar(1 / RecastConfig.RATIO);
        this.navigationPlugin.getClosestPoint(startPos);
        let agentParams = {
            radius: 1,
            height: 2,
            maxAcceleration: 20.0,
            maxSpeed: 6.0,
            collisionQueryRange: 2,
            pathOptimizationRange: 2 * 30,
            separationWeight: 1.0
        };
        let agentIndex = this.crowd!.addAgent(startPos, agentParams);
        return agentIndex;
    }

    /**
     * 移除所有角色
     */
    removeAllAgents() {
        while (this.crowd!.agents.length) {
            this.crowd!.removeAgent(this.crowd!.agents[0]);
        }
    }


    /**
     * Creates a cylinder obstacle and add it to the navigation
     * @param node
     * @param position world position
     * @param radius cylinder radius
     * @param height cylinder height
     * @returns the obstacle freshly created
     */
    addCylinderObstacle(node: Node, position: Vec3, radius: number, height: number): IObstacle {
        node.worldPosition = position;
        position.multiplyScalar(1 / RecastConfig.RATIO);
        setTimeout(() => {
            this.updateNavMeshDebug();
        }, 100);
        let obstacle = this.navigationPlugin.addCylinderObstacle(position, radius, height);
        this.obstacleList.push({ node: node, obstacle: obstacle });
        return obstacle;
    }

    /**
     * Creates an oriented box obstacle and add it to the navigation
     * @param node
     * @param position world position
     * @param extent box size
     * @param angle angle in radians of the box orientation on Y axis
     * @returns the obstacle freshly created
     */
    addBoxObstacle(node: Node, position: Vec3, extent: Vec3, angle: number): IObstacle {
        node.worldPosition = position;
        position.multiplyScalar(1 / RecastConfig.RATIO);
        setTimeout(() => {
            this.updateNavMeshDebug();
        }, 100);
        let obstacle = this.navigationPlugin.addBoxObstacle(position, extent, angle);
        this.obstacleList.push({ node: node, obstacle: obstacle });
        return obstacle;
    }

    /**
     * 移除所有障碍物
     */
    removeAllObstacle() {
        for (let i = 0; i < this.obstacleList.length; ++i) {
            this.obstacleList[i].node.destroy();
            this.navigationPlugin.removeObstacle(this.obstacleList[i].obstacle);
        }
        setTimeout(() => {
            this.updateNavMeshDebug();
        }, 100);
        this.obstacleList = [];
    }


    /**
     * 随机位置添加角色
     * @param node
     */
    addRandomAgents(node: Node) {
        let randomPos = this.navigationPlugin.getRandomPointAround(v3(0, 0, 0), 100);
        console.log(randomPos);
        return this.addAgents(randomPos);
    }

    update(dt: number) {
        if (this.crowd) {
            this.crowd.update(dt);
        }
    }
}

