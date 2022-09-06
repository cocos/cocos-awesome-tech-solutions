import { math, Vec3, } from "cc";
import * as cc from "cc";
import { Recast } from './recast.js';
var Epsilon = 0.1;
export var RecastConfig = {
    RATIO: 1,
};
/**
 * RecastJS navigation plugin
 */
var RecastJSPlugin = /** @class */ (function () {
    /**
     * Initializes the recastJS plugin
     * @param recastInjection can be used to inject your own recast reference
     * @param initCb
     */
    function RecastJSPlugin(initCb, recastInjection) {
        var _this = this;
        if (recastInjection === void 0) { recastInjection = Recast; }
        /**
         * Reference to the Recast library
         */
        this.bjsRECAST = {};
        /**
         * plugin name
         */
        this.name = "RecastJSPlugin";
        this._maximumSubStepCount = 10;
        this._timeStep = 1 / 60;
        if (typeof recastInjection === "function") {
            new recastInjection().then((function (val) {
                _this.bjsRECAST = val;
                if (!_this.isSupported()) {
                    cc.error("RecastJS is not available. Please make sure you included the js file.");
                    return;
                }
                _this._tempVec1 = new _this.bjsRECAST.Vec3();
                _this._tempVec2 = new _this.bjsRECAST.Vec3();
                initCb();
            }));
        }
        else {
            this.bjsRECAST = recastInjection;
            if (!this.isSupported()) {
                cc.error("RecastJS is not available. Please make sure you included the js file.");
                return;
            }
            this._tempVec1 = new this.bjsRECAST.Vec3();
            this._tempVec2 = new this.bjsRECAST.Vec3();
            initCb();
        }
        this.setTimeStep();
    }
    /**
     * Set the time step of the navigation tick update.
     * Default is 1/60.
     * A value of 0 will disable fixed time update
     * @param newTimeStep the new timestep to apply to this world.
     */
    RecastJSPlugin.prototype.setTimeStep = function (newTimeStep) {
        if (newTimeStep === void 0) { newTimeStep = 1 / 60; }
        this._timeStep = newTimeStep;
    };
    /**
     * Get the time step of the navigation tick update.
     * @returns the current time step
     */
    RecastJSPlugin.prototype.getTimeStep = function () {
        return this._timeStep;
    };
    /**
     * If delta time in navigation tick update is greater than the time step
     * a number of sub iterations are done. If more iterations are need to reach deltatime
     * they will be discarded.
     * A value of 0 will set to no maximum and update will use as many substeps as needed
     * @param newStepCount the maximum number of iterations
     */
    RecastJSPlugin.prototype.setMaximumSubStepCount = function (newStepCount) {
        if (newStepCount === void 0) { newStepCount = 10; }
        this._maximumSubStepCount = newStepCount;
    };
    /**
     * Get the maximum number of iterations per navigation tick update
     * @returns the maximum number of iterations
     */
    RecastJSPlugin.prototype.getMaximumSubStepCount = function () {
        return this._maximumSubStepCount;
    };
    /**
     * Creates a navigation mesh
     * @param meshes array of all the geometry used to compute the navigation mesh
     * @param parameters bunch of parameters used to filter geometry
     */
    RecastJSPlugin.prototype.createNavMesh = function (meshes, parameters) {
        var rc = new this.bjsRECAST.rcConfig();
        rc.cs = parameters.cs;
        rc.ch = parameters.ch;
        rc.borderSize = parameters.borderSize ? parameters.borderSize : 0;
        rc.tileSize = parameters.tileSize ? parameters.tileSize : 0;
        rc.walkableSlopeAngle = parameters.walkableSlopeAngle;
        rc.walkableHeight = parameters.walkableHeight;
        rc.walkableClimb = parameters.walkableClimb;
        rc.walkableRadius = parameters.walkableRadius;
        rc.maxEdgeLen = parameters.maxEdgeLen;
        rc.maxSimplificationError = parameters.maxSimplificationError;
        rc.minRegionArea = parameters.minRegionArea;
        rc.mergeRegionArea = parameters.mergeRegionArea;
        rc.maxVertsPerPoly = parameters.maxVertsPerPoly;
        rc.detailSampleDist = parameters.detailSampleDist;
        rc.detailSampleMaxError = parameters.detailSampleMaxError;
        var offMeshConfig = null;
        if (parameters.offMeshLinkConfig) {
            var config = parameters.offMeshLinkConfig;
            offMeshConfig = this.bjsRECAST.OffMeshLinkConfig.prototype.GetInstance(config.offMeshConVerts, config.offMeshConRad, config.offMeshConFlags, config.offMeshConAreas, config.offMeshConDir, config.offMeshConUserID, config.offMeshConCount);
        }
        this.navMesh = new this.bjsRECAST.NavMesh();
        var _a = RecastJSPlugin.getMeshData(meshes), vertexTypeArray = _a.vertexTypeArray, startId = _a.startId, facesTypeArray = _a.facesTypeArray;
        this.navMesh.build(vertexTypeArray, startId, facesTypeArray, facesTypeArray.length, rc, offMeshConfig);
    };
    /**
     * 获取网格顶点数据
     * @param meshes
     */
    RecastJSPlugin.getMeshData = function (meshes) {
        var comps = meshes;
        var vertexPosList = [];
        var facesPositions = [];
        var vertexLength = 0;
        var facesLength = 0;
        var worldMatrix = new math.Mat4();
        var outPos = cc.v3();
        var group = [];
        var startId = 0;
        for (var i = 0; i < comps.length; ++i) {
            var model = comps[i].model;
            if (!model) {
                continue;
            }
            comps[i].node.getWorldMatrix(worldMatrix);
            var subModels = model.subModels;
            var r = 1 / RecastConfig.RATIO;
            for (var j = 0; j < subModels.length; j++) {
                group.push(startId);
                var subMesh = subModels[j].subMesh;
                var info = subMesh.geometricInfo;
                if (info && info.positions && info.indices) {
                    var positions = [];
                    var num = info.positions.length / 3;
                    for (var n = 0; n < num; ++n) {
                        Vec3.transformMat4(outPos, cc.v3(info.positions[n * 3], info.positions[n * 3 + 1], info.positions[n * 3 + 2]), worldMatrix);
                        positions.push(outPos.x * r, outPos.y * r, outPos.z * r);
                    }
                    vertexPosList.push(positions);
                    startId += positions.length / 3;
                    facesPositions.push(info.indices);
                    vertexLength += info.positions.length;
                    facesLength += info.indices.length;
                }
            }
        }
        var vertexTypeArray = [];
        var facesTypeArray = [];
        startId = 0;
        var facesIndex = 0;
        for (var i = 0; i < vertexPosList.length; ++i) {
            for (var j = startId * 3; j < vertexPosList[i].length + startId * 3; ++j) {
                vertexTypeArray[j] = vertexPosList[i][j - startId * 3];
            }
            var list = facesPositions[i];
            for (var j = 0; j < list.length; ++j) {
                facesTypeArray[facesIndex++] = startId + list[j];
            }
            startId += vertexPosList[i].length / 3;
        }
        return { vertexTypeArray: vertexTypeArray, startId: startId, facesTypeArray: facesTypeArray, group: group };
    };
    RecastJSPlugin.exportObj = function (meshes) {
        var output = [];
        var _a = this.getMeshData(meshes), vertexTypeArray = _a.vertexTypeArray, facesTypeArray = _a.facesTypeArray, group = _a.group;
        for (var h = 0; h < vertexTypeArray.length; h += 3) {
            output.push("v " + vertexTypeArray[h] + " " + vertexTypeArray[h + 1] + " " + vertexTypeArray[h + 2]);
        }
        for (var i = 0; i < facesTypeArray.length; i += 3) {
            if (group.indexOf(i / 3) !== -1) {
                output.push("g Cube" + group.indexOf((i / 2)));
            }
            output.push("f " + (facesTypeArray[i] + 1) +
                " " + (facesTypeArray[i + 1] + 1) +
                " " + (facesTypeArray[i + 2] + 1));
        }
        var text = output.join("\n");
        return text;
    };
    /**
     * Create a navigation mesh debug mesh
     * @param scene is where the mesh will be added
     * @returns debug display mesh
     */
    RecastJSPlugin.prototype.createDebugNavMesh = function (scene) {
        var debugNavMesh = this.navMesh.getDebugNavMesh();
        var triangleCount = debugNavMesh.getTriangleCount();
        var indices = [];
        var positions = [];
        var tri;
        var pt;
        for (tri = 0; tri < triangleCount * 3; tri++) {
            indices.push(tri);
        }
        for (tri = 0; tri < triangleCount; tri++) {
            for (pt = 0; pt < 3; pt++) {
                var point = debugNavMesh.getTriangle(tri).getPoint(pt);
                positions.push(point.x, point.y, point.z);
            }
        }
        return RecastJSPlugin.createMeshRenderer(scene, positions, indices);
    };
    /**
     * 根据顶点和三角面数据创建meshRenderer
     * @param scene
     * @param positions
     * @param indices
     */
    RecastJSPlugin.createMeshRenderer = function (scene, positions, indices) {
        var node = new cc.Node();
        scene.addChild(node);
        var m4 = new math.Mat4();
        math.Mat4.invert(m4, node.getWorldMatrix(m4));
        var pos = cc.v3();
        for (var i = 0; i < positions.length; i += 3) {
            pos.x = positions[i];
            pos.y = positions[i + 1];
            pos.z = positions[i + 2];
            Vec3.transformMat4(pos, pos, m4);
            positions[i] = pos.x;
            positions[i + 1] = pos.y;
            positions[i + 2] = pos.z;
        }
        var mesh = cc.utils.createMesh({ positions: positions, indices: indices, doubleSided: true });
        var comp = node.addComponent(cc.MeshRenderer);
        comp.mesh = mesh;
        return node;
    };
    /**
     * Get a navigation mesh constrained position, closest to the parameter position
     * @param position world position
     * @returns the closest point to position constrained by the navigation mesh
     */
    RecastJSPlugin.prototype.getClosestPoint = function (position) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        var ret = this.navMesh.getClosestPoint(this._tempVec1);
        var pr = new Vec3(ret.x, ret.y, ret.z);
        return pr;
    };
    /**
     * Get a navigation mesh constrained position, closest to the parameter position
     * @param position world position
     * @param result output the closest point to position constrained by the navigation mesh
     */
    RecastJSPlugin.prototype.getClosestPointToRef = function (position, result) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        var ret = this.navMesh.getClosestPoint(this._tempVec1);
        result.set(ret.x, ret.y, ret.z);
    };
    /**
     * Get a navigation mesh constrained position, within a particular radius
     * @param position world position
     * @param maxRadius the maximum distance to the constrained world position
     * @returns the closest point to position constrained by the navigation mesh
     */
    RecastJSPlugin.prototype.getRandomPointAround = function (position, maxRadius) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        var ret = this.navMesh.getRandomPointAround(this._tempVec1, maxRadius);
        var pr = new Vec3(ret.x, ret.y, ret.z);
        return pr;
    };
    /**
     * Get a navigation mesh constrained position, within a particular radius
     * @param position world position
     * @param maxRadius the maximum distance to the constrained world position
     * @param result output the closest point to position constrained by the navigation mesh
     */
    RecastJSPlugin.prototype.getRandomPointAroundToRef = function (position, maxRadius, result) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        var ret = this.navMesh.getRandomPointAround(this._tempVec1, maxRadius);
        result.set(ret.x, ret.y, ret.z);
    };
    /**
     * Compute the final position from a segment made of destination-position
     * @param position world position
     * @param destination world position
     * @returns the resulting point along the navmesh
     */
    RecastJSPlugin.prototype.moveAlong = function (position, destination) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        this._tempVec2.x = destination.x;
        this._tempVec2.y = destination.y;
        this._tempVec2.z = destination.z;
        var ret = this.navMesh.moveAlong(this._tempVec1, this._tempVec2);
        var pr = new Vec3(ret.x, ret.y, ret.z);
        return pr;
    };
    /**
     * Compute the final position from a segment made of destination-position
     * @param position world position
     * @param destination world position
     * @param result output the resulting point along the navmesh
     */
    RecastJSPlugin.prototype.moveAlongToRef = function (position, destination, result) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        this._tempVec2.x = destination.x;
        this._tempVec2.y = destination.y;
        this._tempVec2.z = destination.z;
        var ret = this.navMesh.moveAlong(this._tempVec1, this._tempVec2);
        result.set(ret.x, ret.y, ret.z);
    };
    /**
     * Compute a navigation path from start to end. Returns an empty array if no path can be computed
     * @param start world position
     * @param end world position
     * @returns array containing world position composing the path
     */
    RecastJSPlugin.prototype.computePath = function (start, end) {
        var pt;
        this._tempVec1.x = start.x;
        this._tempVec1.y = start.y;
        this._tempVec1.z = start.z;
        this._tempVec2.x = end.x;
        this._tempVec2.y = end.y;
        this._tempVec2.z = end.z;
        var navPath = this.navMesh.computePath(this._tempVec1, this._tempVec2);
        var pointCount = navPath.getPointCount();
        var positions = [];
        for (pt = 0; pt < pointCount; pt++) {
            var p = navPath.getPoint(pt);
            positions.push(new Vec3(p.x, p.y, p.z));
        }
        return positions;
    };
    /**
     * Create a new Crowd so you can add agents
     * @param maxAgents the maximum agent count in the crowd
     * @param maxAgentRadius the maximum radius an agent can have
     * @param scene to attach the crowd to
     * @returns the crowd you can add agents to
     */
    RecastJSPlugin.prototype.createCrowd = function (maxAgents, maxAgentRadius, scene) {
        var crowd = new RecastJSCrowd(this, maxAgents, maxAgentRadius, scene);
        return crowd;
    };
    /**
     * Set the Bounding box extent for doing spatial queries (getClosestPoint, getRandomPointAround, ...)
     * The queries will try to find a solution within those bounds
     * default is (1,1,1)
     * @param extent x,y,z value that define the extent around the queries point of reference
     */
    RecastJSPlugin.prototype.setDefaultQueryExtent = function (extent) {
        this._tempVec1.x = extent.x;
        this._tempVec1.y = extent.y;
        this._tempVec1.z = extent.z;
        this.navMesh.setDefaultQueryExtent(this._tempVec1);
    };
    /**
     * Get the Bounding box extent specified by setDefaultQueryExtent
     * @returns the box extent values
     */
    RecastJSPlugin.prototype.getDefaultQueryExtent = function () {
        var p = this.navMesh.getDefaultQueryExtent();
        return new Vec3(p.x, p.y, p.z);
    };
    /**
     * build the navmesh from a previously saved state using getNavmeshData
     * @param data the Uint8Array returned by getNavmeshData
     */
    RecastJSPlugin.prototype.buildFromNavmeshData = function (data) {
        var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
        var dataPtr = this.bjsRECAST._malloc(nDataBytes);
        var dataHeap = new Uint8Array(this.bjsRECAST.HEAPU8.buffer, dataPtr, nDataBytes);
        dataHeap.set(data);
        var buf = new this.bjsRECAST.NavmeshData();
        buf.dataPointer = dataHeap.byteOffset;
        buf.size = data.length;
        this.navMesh = new this.bjsRECAST.NavMesh();
        this.navMesh.buildFromNavmeshData(buf);
        // Free memory
        this.bjsRECAST._free(dataHeap.byteOffset);
    };
    /**
     * returns the navmesh data that can be used later. The navmesh must be built before retrieving the data
     * @returns data the Uint8Array that can be saved and reused
     */
    RecastJSPlugin.prototype.getNavmeshData = function () {
        var navmeshData = this.navMesh.getNavmeshData();
        var arrView = new Uint8Array(this.bjsRECAST.HEAPU8.buffer, navmeshData.dataPointer, navmeshData.size);
        var ret = new Uint8Array(navmeshData.size);
        ret.set(arrView);
        this.navMesh.freeNavmeshData(navmeshData);
        return ret;
    };
    /**
     * Get the Bounding box extent result specified by setDefaultQueryExtent
     * @param result output the box extent values
     */
    RecastJSPlugin.prototype.getDefaultQueryExtentToRef = function (result) {
        var p = this.navMesh.getDefaultQueryExtent();
        result.set(p.x, p.y, p.z);
    };
    /**
     * Disposes
     */
    RecastJSPlugin.prototype.dispose = function () {
    };
    /**
     * Creates a cylinder obstacle and add it to the navigation
     * @param position world position
     * @param radius cylinder radius
     * @param height cylinder height
     * @returns the obstacle freshly created
     */
    RecastJSPlugin.prototype.addCylinderObstacle = function (position, radius, height) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        return this.navMesh.addCylinderObstacle(this._tempVec1, radius, height);
    };
    /**
     * Creates an oriented box obstacle and add it to the navigation
     * @param position world position
     * @param extent box size
     * @param angle angle in radians of the box orientation on Y axis
     * @returns the obstacle freshly created
     */
    RecastJSPlugin.prototype.addBoxObstacle = function (position, extent, angle) {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        this._tempVec2.x = extent.x;
        this._tempVec2.y = extent.y;
        this._tempVec2.z = extent.z;
        return this.navMesh.addBoxObstacle(this._tempVec1, this._tempVec2, angle);
    };
    /**
     * Removes an obstacle created by addCylinderObstacle or addBoxObstacle
     * @param obstacle obstacle to remove from the navigation
     */
    RecastJSPlugin.prototype.removeObstacle = function (obstacle) {
        this.navMesh.removeObstacle(obstacle);
    };
    /**
     * If this plugin is supported
     * @returns true if plugin is supported
     */
    RecastJSPlugin.prototype.isSupported = function () {
        return this.bjsRECAST !== undefined;
    };
    return RecastJSPlugin;
}());
export { RecastJSPlugin };
/**
 * Recast detour crowd implementation
 */
var RecastJSCrowd = /** @class */ (function () {
    /**
     * Constructor
     * @param plugin recastJS plugin
     * @param maxAgents the maximum agent count in the crowd
     * @param maxAgentRadius the maximum radius an agent can have
     * @param scene to attach the crowd to
     * @returns the crowd you can add agents to
     */
    function RecastJSCrowd(plugin, maxAgents, maxAgentRadius, scene) {
        /**
         * Link to the detour crowd
         */
        this.recastCrowd = {};
        /**
         * All agents created
         */
        this.agents = new Array();
        this.bjsRECASTPlugin = plugin;
        this.recastCrowd = new this.bjsRECASTPlugin.bjsRECAST.Crowd(maxAgents, maxAgentRadius, this.bjsRECASTPlugin.navMesh.getNavMesh());
        this._scene = scene;
    }
    /**
     * Add a new agent to the crowd with the specified parameter a corresponding transformNode.
     * You can attach anything to that node. The node position is updated in the scene update tick.
     * @param pos world position that will be constrained by the navigation mesh
     * @param parameters agent parameters
     * @param transform hooked to the agent that will be update by the scene
     * @returns agent index
     */
    RecastJSCrowd.prototype.addAgent = function (pos, parameters) {
        var agentParams = new this.bjsRECASTPlugin.bjsRECAST.dtCrowdAgentParams();
        agentParams.radius = parameters.radius;
        agentParams.height = parameters.height;
        agentParams.maxAcceleration = parameters.maxAcceleration;
        agentParams.maxSpeed = parameters.maxSpeed;
        agentParams.collisionQueryRange = parameters.collisionQueryRange;
        agentParams.pathOptimizationRange = parameters.pathOptimizationRange;
        agentParams.separationWeight = parameters.separationWeight;
        agentParams.updateFlags = 7;
        agentParams.obstacleAvoidanceType = 0;
        agentParams.queryFilterType = 0;
        agentParams.userData = 0;
        var agentIndex = this.recastCrowd.addAgent(new this.bjsRECASTPlugin.bjsRECAST.Vec3(pos.x, pos.y, pos.z), agentParams);
        this.agents.push(agentIndex);
        return agentIndex;
    };
    /**
     * Returns the agent position in world space
     * @param index agent index returned by addAgent
     * @returns world space position
     */
    RecastJSCrowd.prototype.getAgentPosition = function (index) {
        var agentPos = this.recastCrowd.getAgentPosition(index);
        return RecastJSCrowd.getWorldPosition(agentPos);
    };
    /**
     * 获取世界坐标
     * @param recastPos
     */
    RecastJSCrowd.getWorldPosition = function (recastPos) {
        return new Vec3(recastPos.x * RecastConfig.RATIO, recastPos.y * RecastConfig.RATIO, recastPos.z * RecastConfig.RATIO);
    };
    /**
     * Returns the agent position result in world space
     * @param index agent index returned by addAgent
     * @param result output world space position
     */
    RecastJSCrowd.prototype.getAgentPositionToRef = function (index, result) {
        var agentPos = this.recastCrowd.getAgentPosition(index);
        result.set(agentPos.x, agentPos.y, agentPos.z);
    };
    /**
     * Returns the agent velocity in world space
     * @param index agent index returned by addAgent
     * @returns world space velocity
     */
    RecastJSCrowd.prototype.getAgentVelocity = function (index) {
        var agentVel = this.recastCrowd.getAgentVelocity(index);
        return new Vec3(agentVel.x, agentVel.y, agentVel.z);
    };
    /**
     * Returns the agent velocity result in world space
     * @param index agent index returned by addAgent
     * @param result output world space velocity
     */
    RecastJSCrowd.prototype.getAgentVelocityToRef = function (index, result) {
        var agentVel = this.recastCrowd.getAgentVelocity(index);
        result.set(agentVel.x, agentVel.y, agentVel.z);
    };
    /**
     * Returns the agent next target point on the path
     * @param index agent index returned by addAgent
     * @returns world space position
     */
    RecastJSCrowd.prototype.getAgentNextTargetPath = function (index) {
        var pathTargetPos = this.recastCrowd.getAgentNextTargetPath(index);
        return new Vec3(pathTargetPos.x, pathTargetPos.y, pathTargetPos.z);
    };
    /**
     * Returns the agent next target point on the path
     * @param index agent index returned by addAgent
     * @param result output world space position
     */
    RecastJSCrowd.prototype.getAgentNextTargetPathToRef = function (index, result) {
        var pathTargetPos = this.recastCrowd.getAgentNextTargetPath(index);
        result.set(pathTargetPos.x, pathTargetPos.y, pathTargetPos.z);
    };
    /**
     * Gets the agent state
     * @param index agent index returned by addAgent
     * @returns agent state
     */
    RecastJSCrowd.prototype.getAgentState = function (index) {
        return this.recastCrowd.getAgentState(index);
    };
    /**
     * returns true if the agent in over an off mesh link connection
     * @param index agent index returned by addAgent
     * @returns true if over an off mesh link connection
     */
    RecastJSCrowd.prototype.overOffmeshConnection = function (index) {
        return this.recastCrowd.overOffmeshConnection(index);
    };
    /**
     * Asks a particular agent to go to a destination. That destination is constrained by the navigation mesh
     * @param index agent index returned by addAgent
     * @param destination targeted world position
     */
    RecastJSCrowd.prototype.agentGoto = function (index, destination) {
        this.recastCrowd.agentGoto(index, new this.bjsRECASTPlugin.bjsRECAST.Vec3(destination.x, destination.y, destination.z));
    };
    /**
     *  call resetMoveTarget
     * @param index agent index returned by addAgent
     */
    RecastJSCrowd.prototype.agentStop = function (index) {
        this.recastCrowd.agentStop(index);
    };
    /**
     * Teleport the agent to a new position
     * @param index agent index returned by addAgent
     * @param destination targeted world position
     */
    RecastJSCrowd.prototype.agentTeleport = function (index, destination) {
        this.recastCrowd.agentTeleport(index, new this.bjsRECASTPlugin.bjsRECAST.Vec3(destination.x, destination.y, destination.z));
    };
    /**
     * Update agent parameters
     * @param index agent index returned by addAgent
     * @param parameters agent parameters
     */
    RecastJSCrowd.prototype.updateAgentParameters = function (index, parameters) {
        var agentParams = this.recastCrowd.getAgentParameters(index);
        if (parameters.radius !== undefined) {
            agentParams.radius = parameters.radius;
        }
        if (parameters.height !== undefined) {
            agentParams.height = parameters.height;
        }
        if (parameters.maxAcceleration !== undefined) {
            agentParams.maxAcceleration = parameters.maxAcceleration;
        }
        if (parameters.maxSpeed !== undefined) {
            agentParams.maxSpeed = parameters.maxSpeed;
        }
        if (parameters.collisionQueryRange !== undefined) {
            agentParams.collisionQueryRange = parameters.collisionQueryRange;
        }
        if (parameters.pathOptimizationRange !== undefined) {
            agentParams.pathOptimizationRange = parameters.pathOptimizationRange;
        }
        if (parameters.separationWeight !== undefined) {
            agentParams.separationWeight = parameters.separationWeight;
        }
        this.recastCrowd.setAgentParameters(index, agentParams);
    };
    /**
     * remove a particular agent previously created
     * @param index agent index returned by addAgent
     */
    RecastJSCrowd.prototype.removeAgent = function (index) {
        this.recastCrowd.removeAgent(index);
        var item = this.agents.indexOf(index);
        if (item > -1) {
            this.agents.splice(item, 1);
        }
    };
    /**
     * get the list of all agents attached to this crowd
     * @returns list of agent indices
     */
    RecastJSCrowd.prototype.getAgents = function () {
        return this.agents;
    };
    /**
     * Tick update done by the Scene. Agent position/velocity/acceleration is updated by this function
     * @param deltaTime in seconds
     */
    RecastJSCrowd.prototype.update = function (deltaTime) {
        // update obstacles
        this.bjsRECASTPlugin.navMesh.update();
        // update crowd
        var timeStep = this.bjsRECASTPlugin.getTimeStep();
        var maxStepCount = this.bjsRECASTPlugin.getMaximumSubStepCount();
        if (timeStep <= Epsilon) {
            this.recastCrowd.update(deltaTime);
        }
        else {
            var iterationCount = Math.floor(deltaTime / timeStep);
            if (maxStepCount && iterationCount > maxStepCount) {
                iterationCount = maxStepCount;
            }
            if (iterationCount < 1) {
                iterationCount = 1;
            }
            var step = deltaTime / iterationCount;
            for (var i = 0; i < iterationCount; i++) {
                this.recastCrowd.update(step);
            }
        }
    };
    /**
     * Set the Bounding box extent for doing spatial queries (getClosestPoint, getRandomPointAround, ...)
     * The queries will try to find a solution within those bounds
     * default is (1,1,1)
     * @param extent x,y,z value that define the extent around the queries point of reference
     */
    RecastJSCrowd.prototype.setDefaultQueryExtent = function (extent) {
        var ext = new this.bjsRECASTPlugin.bjsRECAST.Vec3(extent.x, extent.y, extent.z);
        this.recastCrowd.setDefaultQueryExtent(ext);
    };
    /**
     * Get the Bounding box extent specified by setDefaultQueryExtent
     * @returns the box extent values
     */
    RecastJSCrowd.prototype.getDefaultQueryExtent = function () {
        var p = this.recastCrowd.getDefaultQueryExtent();
        return new Vec3(p.x, p.y, p.z);
    };
    /**
     * Get the Bounding box extent result specified by setDefaultQueryExtent
     * @param result output the box extent values
     */
    RecastJSCrowd.prototype.getDefaultQueryExtentToRef = function (result) {
        var p = this.recastCrowd.getDefaultQueryExtent();
        result.set(p.x, p.y, p.z);
    };
    /**
     * Get the next corner points composing the path (max 4 points)
     * @param index agent index returned by addAgent
     * @returns array containing world position composing the path
     */
    RecastJSCrowd.prototype.getCorners = function (index) {
        var pt;
        var navPath = this.recastCrowd.getPath(index);
        var pointCount = navPath.getPointCount();
        var positions = [];
        for (pt = 0; pt < pointCount; pt++) {
            var p = navPath.getPoint(pt);
            positions.push(new Vec3(p.x, p.y, p.z));
        }
        return positions;
    };
    /**
     * Release all resources
     */
    RecastJSCrowd.prototype.dispose = function () {
        this.recastCrowd.destroy();
    };
    return RecastJSCrowd;
}());
export { RecastJSCrowd };
