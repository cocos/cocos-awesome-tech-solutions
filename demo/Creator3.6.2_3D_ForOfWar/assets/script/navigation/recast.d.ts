declare module Recast {
    class rcConfig {
        new(): rcConfig;
        width: number;
        height: number;
        tileSize: number;
        borderSize: number;
        cs: number;
        ch: number;
        bmin: any;
        bmax: any;
        walkableSlopeAngle: number;
        walkableHeight: number;
        walkableClimb: number;
        walkableRadius: number;
        maxEdgeLen: number;
        maxSimplificationError: number;
        minRegionArea: number;
        mergeRegionArea: number;
        maxVertsPerPoly: number;
        detailSampleDist: number;
        detailSampleMaxError: number;
    }
    class OffMeshLinkConfig {
        static GetInstance(offMeshConVerts: number[], offMeshConRad: number[], offMeshConFlags: number[], offMeshConAreas: number[], offMeshConDir: number[], offMeshConUserID: number[], offMeshConCount: number): OffMeshLinkConfig
        //AreaTypeList 顶点列表每条link6个number代表两个点
        offMeshConVerts: number[];//float[]
        //link 弧度  暂未搞清楚是干嘛的
        offMeshConRad: number[];//float[]
        //link标志
        offMeshConFlags: number[];//char[]
        //AreaTypeList char 区域类型
        offMeshConAreas: number[];//char[]
        //是否双向 0 否 1是
        offMeshConDir: number[];//int[]
        //link id
        offMeshConUserID: number[];//int[]
        //link 数量
        offMeshConCount: number//int[]
    }
    class Vec3 {
        new(): Vec3;
        new(x: number, y: number, z: number): Vec3;
        x: number;
        y: number;
        z: number;
    }
    class Triangle {
        new(): Triangle;
        getPoint(n: number): Vec3;
    }
    class DebugNavMesh {
        new(): DebugNavMesh;
        getTriangleCount(): number;
        getTriangle(n: number): Triangle;
    }
    class dtNavMesh {
    }
    class dtObstacleRef {
    }
    class NavmeshData {
        new(): NavmeshData;
        dataPointer: any;
        size: number;
    }
    class NavPath {
        getPointCount(): number;
        getPoint(n: number): Vec3;
    }
    class dtCrowdAgentParams {
        new(): dtCrowdAgentParams;
        radius: number;
        height: number;
        maxAcceleration: number;
        maxSpeed: number;
        collisionQueryRange: number;
        pathOptimizationRange: number;
        separationWeight: number;
        updateFlags: number;
        obstacleAvoidanceType: number;
        queryFilterType: number;
        userData: unknown;
    }
    class NavMesh {
        new(): NavMesh;
        destroy(): void;
        build(positions: any, positionCount: number, indices: any, indexCount: number, config: rcConfig): void;
        buildFromNavmeshData(data: NavmeshData): void;
        getNavmeshData(): NavmeshData;
        freeNavmeshData(data: NavmeshData): void;
        getDebugNavMesh(): DebugNavMesh;
        getClosestPoint(position: Vec3): Vec3;
        getRandomPointAround(position: Vec3, maxRadius: number): Vec3;
        moveAlong(position: Vec3, destination: Vec3): Vec3;
        getNavMesh(): dtNavMesh;
        computePath(start: Vec3, end: Vec3): NavPath;
        setDefaultQueryExtent(extent: Vec3): void;
        getDefaultQueryExtent(): Vec3;
        addCylinderObstacle(position: Vec3, radius: number, height: number): dtObstacleRef;
        addBoxObstacle(position: Vec3, extent: Vec3, angle: number): dtObstacleRef;
        removeObstacle(obstacle: dtObstacleRef): void;
        update(): void;
    }
    class Crowd {
        new(maxAgents: number, maxAgentRadius: number, nav: dtNavMesh): Crowd;
        destroy(): void;
        addAgent(position: Vec3, params: dtCrowdAgentParams): number;
        removeAgent(idx: number): void;
        update(dt: number): void;
        getAgentPosition(idx: number): Vec3;
        getAgentVelocity(idx: number): Vec3;
        getAgentNextTargetPath(idx: number): Vec3;
        getAgentState(idx: number): number;
        overOffmeshConnection(idx: number): boolean;
        agentGoto(idx: number, destination: Vec3): void;
        agentTeleport(idx: number, destination: Vec3): void;
        getAgentParameters(idx: number): dtCrowdAgentParams;
        setAgentParameters(idx: number, params: dtCrowdAgentParams): void;
        setDefaultQueryExtent(extent: Vec3): void;
        getDefaultQueryExtent(): Vec3;
        getCorners(idx: number): NavPath;
    }
}