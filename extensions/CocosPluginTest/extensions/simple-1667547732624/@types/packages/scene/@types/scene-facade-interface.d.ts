import {
    SetPropertyOptions,
    MoveArrayOptions,
    RemoveArrayOptions,
    CutNodeOptions,
    PasteNodeOptions,
    CreateNodeOptions,
    RemoveNodeOptions,
    CreateComponentOptions,
    RemoveComponentOptions,
    ExecuteComponentMethodOptions,
    IAnimOperation,
    ExecuteSceneScriptMethodOptions,
    QueryClassesOptions,
} from './public';

import { Node, Vec3, Quat } from 'cc';
import type ParticleManager from '../source/script/3d/manager/particle';
import { ISceneEvents } from '../source/script/3d/manager/scene-events-interface';

interface ISceneFacade extends ISceneEvents {
    init(): void;

    //////////
    // node //
    //////////

    /**
     * 打开某个场景
     * @param uuid 场景uuid
     */
    openScene(uuid: string): Promise<boolean>;

    /**
     * 保存当前场景
     */
    saveScene(asNew: boolean): Promise<boolean>;

    closeScene(): Promise<boolean>;

    /**
     * 软刷新场景
     */
    softReloadScene(json: any): Promise<boolean>;

    reloadScene(): Promise<boolean>;

    /**
     * 查询当前场景的节点树信息
     * @param uuid 节点的唯一标识符
     */
    queryNodeTree(uuid: string): Promise<any>;

    /**
     * 查询使用了资源 UUID 的节点
     * @param uuid 资源 asset uuid
     */
    queryNodesByAssetUuid(uuid: string): Promise<any>;

    /**
     * 查询当前场景的序列化数据
     */
    querySceneSerializedData(): Promise<any>;

    /**
     * 查询当前场景是否被修改
     */
    querySceneDirty(): Promise<any>;

    /**
     * 查询引擎内所有的类
     */
    queryClasses(options?: QueryClassesOptions): Promise<any>;

    /**
     * 查询引擎内所有的组件列表
     */
    queryComponents(): Promise<any>;

    /**
     * 查询引擎组件列表是否含有指定类名的脚本
     * @param name 查询脚本的名字
     */
    queryComponentHasScript(name: string): Promise<boolean>;

    /**
     * 查询引擎内 Layer 的内置项
     */
    queryLayerBuiltin(): Promise<any>;

    /**
     * 查询当前场景的编辑模式
     */
    queryMode(): string;

    /**
     * 查询当前场景资源的 uuid
     */
    queryCurrentSceneUuid(): string;

    //////////
    // node //
    //////////

    /**
     * 查询一个节点的 dump 数据
     * @param uuid 节点的唯一标识符
     */
    queryNodeDump(uuid: string): Promise<any>;

    /**
     * 查询一个节点内挂载的所有组件以及对应的函数
     * @param uuid 节点的唯一标识符
     */
    queryComponentFunctionOfNode(uuid: string): Promise<any>;

    /**
     * 设置某个元素内的属性
     * @param options
     */
    setNodeProperty(options: SetPropertyOptions): Promise<boolean>;

    /**
     * 设置某个元素内的某个属性的默认值
     * @param options
     */
    resetNodeProperty(options: SetPropertyOptions): Promise<boolean>;

    /**
     * 预览设置某个元素内的属性(不会进undo)
     * @param options
     */
    previewSetNodeProperty(options: SetPropertyOptions): Promise<boolean>;

    /**
     * 取消预览设置某个元素内的属性(不会进undo)
     * @param options
     */
    cancelPreviewSetNodeProperty(options: SetPropertyOptions): Promise<boolean>;

    /**
     * 将一个属性从 null 值变为可编辑的值
     * @param options
     */
    updateNodePropertyFromNull(options: SetPropertyOptions): Promise<boolean>;

    /**
     * 设置某个节点连同它的子集的 layer 属性值
     * @param options
     */
    setNodeAndChildrenLayer(options: SetPropertyOptions): void;

    /**
     * 移动数组类型 property 内的某个 item 的位置
     * @param options
     */
    moveNodeArrayElement(options: MoveArrayOptions): void;

    /**
     * 删除数组类型 property 内的某个 item 的位置
     * @param options
     */
    removeNodeArrayElement(options: RemoveArrayOptions): Promise<boolean>;

    /**
     * 实时获取新节点在一个父节点下的有效名称
     * 规则是 Node 同名时为 Node-001
     * @param name 名称
     * @param parentUuid 父节点 uuid
     */
    generateNodeAvailableName(name: string, parentUuid: string): Promise<string>;

    /**
     * 暂存一个节点的实例化对象
     * 一般用在复制节点的动作，给下一步粘贴（创建）节点准备数据
     * @param uuids 节点uuid
     */
    copyNode(uuids: string | string[]): string[];

    /**
     * 复制节点自身
     * ctrl + d
     * @param uuids 节点uuid
     */
    duplicateNode(uuids: string | string[]): string[];

    /**
     * 粘贴节点
     * @param options 参数
     */
    pasteNode(options: PasteNodeOptions): Promise<string[]>;

    /**
     * 挂载节点
     * @param options 参数
     */
    setNodeParent(options: CutNodeOptions): Promise<string[]>;

    /**
     * 创建一个新的节点
     * @param options 参数
     */
    createNode(options: CreateNodeOptions): Promise<any>;

    /**
     * 重置节点属性 position rotation scale
     * @param options 参数
     */
    resetNode(uuid: string): Promise<any>;

    /**
     * 删除一个节点
     * @param options 参数
     */
    removeNode(options: RemoveNodeOptions): void;

    /**
     * 锁定一个节点不让其在场景中被选中
     * @param uuids 节点uuid
     * @param locked true | false
     * @param loop true | false 是否循环子孙级节点设置
     */
    changeNodeLock(uuids: string | string[], locked: Boolean, loop: Boolean): void;

    /**
     * 从资源数据还原一个 prefab 节点
     * @param uuid 节点uuid
     * @param assetUuid 资源uuid
     */
    restorePrefab(uuid: string, assetUuid: string): Promise<boolean>;

    ///////////////
    // component //
    ///////////////

    /**
     * 查询一个组件的 dump 数据
     * @param uuid 节点的唯一标识符
     */
    queryComponent(uuid: string): Promise<boolean>;

    /**
     * 在某个节点上创建一个组件
     * @param options 参数
     */
    createComponent(options: CreateComponentOptions): void;

    /**
     * 重置组件
     * @param uuid 组件
     */
    resetComponent(uuid: string): void;

    /**
     * 删除某个节点上的某个组件
     * @param options 参数
     */
    removeComponent(options: RemoveComponentOptions): void;

    /**
     * 执行 entity 上指定组件的方法
     * @param options 参数
     */
    executeComponentMethod(options: ExecuteComponentMethodOptions): Promise<boolean>;

    /**
     * 执行插件注册的场景脚本方法
     * @param name 插件名字
     * @param method 方法名字
     * @param args 传入的参数
     */
    executeSceneScriptMethod(options: ExecuteSceneScriptMethodOptions): Promise<any>;

    ///////////////
    // undo/redo //
    ///////////////

    /**
     * 保存一次操作记录
     */
    snapshot(command?: any): void;

    /**
     * 放弃当前步骤的所有变动记录
     */
    abortSnapshot(): void;

    /**
     * 撤销一次操作记录
     */
    undo(): void;

    /**
     * 重做一次操作记录
     */
    redo(): void;

    /**
     * 记录变动的节点
     * @param node
     * @param enable enable = false 是内部 undo redo 产生的变化, 不参与重新记录
     */
    recordNode(node: Node, enable: boolean): void;

    ///////////
    // asset //
    ///////////

    /**
     * 查询所有内置 Effects
     */
    queryAllEffects(): Promise<any>;

    /**
     * 查询一个 material 的 dump 数据
     * @param uuid material 的唯一标识符
     */
    queryMaterial(uuid: string): Promise<any>;

    /**
     * 根据 effecName 构建指定 Effect 的 props 和 defines 属性
     * @param effectName effect 的名字
     */
    queryEffect(effectName: string): Promise<any>;

    /**
     * 查询当个 RenderPipeline
     * @param uuid 查询的资源的唯一标识符
     */
    queryRenderPipeline(uuid: string): Promise<any>;

    /**
     * 材质，实时预览 material 数据
     * @param uuid 材质uuid
     * @param material 材质数据
     */
    previewMaterial(uuid: string, material: any, opts?: {emit?: boolean}): void;

    /**
     * 应用材质
     * @param uuid 材质uuid
     * @param materialDump 材质dump数据
     */
    applyMaterial(uuid: string, materialDump: any): void;

    /**
     * 修改 physics-material
     * @param dump dump数据
     */
    changePhysicsMaterial(dump: any): Promise<any>;

    /**
     * 保存 physics-material
     * @param uuid uuid
     */
    applyPhysicsMaterial(uuid: string): void;

    /**
     * 修改 animation-mask
     * @param dump dump数据
     */
    changeAnimationMask(dump: any): Promise<any>;

    /**
     * 保存 animation-mask
     * @param uuid uuid
     */
    applyAnimationMask(uuid: string): void;

    /**
     * 保存 render-texture
     * @param uuid uuid
     * @param dump dump数据
     */
    applyRenderTexture(uuid: string, dump: any): void;

    /**
     * 修改了 RenderPipeline 数据
     * @param dump 数据
     */
    changeRenderPipeline(dump: any): Promise<any>;

    /**
     * 应用 RenderPipeline 数据
     * @param uuid pipeline uuid
     * @param renderPipelineDump RenderPipeline的dump数据
     */
    applyRenderPipeline(uuid: string, renderPipelineDump: any): void;

    /**
     * 查询一个 physics-material 的 dump 数据
     * @param uuid 资源的唯一标识符
     */
    queryPhysicsMaterial(uuid: string): any;

    /**
     * 查询一个 animation-mask 的 dump 数据
     * @param uuid 资源的唯一标识符
     */
    queryAnimationMask(uuid: string): any;

    /**
     * 查询可以被创建为节点的所有资源类型
     */
    queryCreatableAssetTypes(): any;

    assetChange(uuid: string, info?: any, meta?: any): Promise<void>;

    assetDelete(uuid: string, info?: any): void;

    /**
     * 一个资源更新到场景的引用中后发出此消息
     * @param uuid 资源uuid
     */
    assetRefresh(uuid: string): void;

    ///////////
    // gizmo //
    ///////////

    /**
     * 查询当前 gizmo 工具的名字
     */
    queryGizmoToolName(): Promise<string>;

    /**
     * 查询 gizmo 中心点类型
     */
    queryGizmoPivot(): Promise<string>;

    /**
     * 查询 gizmo 坐标类型
     */
    queryGizmoCoordinate(): Promise<string>;

    /**
     * 查询 是否处于2D编辑模式
     */
    queryIs2D(): Promise<boolean>;

    /**
     * 查询icon gizmo是否为3D
     */
    queryIsIconGizmo3D(): boolean;

    /**
     * 获取icon gizmo的大小
     */
    queryIconGizmoSize(): number;

    /**
     * 改变Gizmo的操作工具
     * @param name 变换工具名字
     */
    setTransformToolName(name: string): void;

    /**
     * 改变基准中心
     * @param name 中心位置名
     */
    setPivot(name: string): void;

    /**
     * 设置使用全局或局部坐标系
     * @param type 坐标系类型
     */
    setCoordinate(type: string): void;

    /**
     * 是否进入2D编辑模式
     * @param value 是否使用2D
     */
    setIs2D(value: boolean): void;

    /**
     * 设置icon gizmo是否为3D
     * @param is3D 是否为3D icon
     */
    setIconGizmo3D(is3D: boolean): void;

    /**
     * 设置icon gizmo的大小
     *
     * @param size icon大小
     */
    setIconGizmoSize(size: number): void;

    ////////////
    // camera //
    ////////////
    /**
     * 聚焦于某个节点
     * @param uuid 节点uuid
     */
    focus(uuid: string[] | null, position?: Vec3, rotation?: Quat, viewCenter?: Vec3, immediate?: boolean): void;

    /**
     * 将编辑相机数据拷贝到节点上
     * @param uuids 节点数组
     */
    alignNodeToSceneView(uuids: string[]): void;

    /**
     * 查询grid是否可见
     */
    queryIsGridVisible(): boolean;
    /**
     * 设置grid是否可见
     * @param visible 是否可见
     */
    setGridVisible(visible: boolean): void;

    /**
     * 将选中的节点与场景相机对齐
     */
    alignWithView(): void;

    /**
     * 将场景相机与选中的节点对齐
     */
    alignViewWithNode(): void;
    /**
     * 设置网格线的颜色
     * @param color 网格线的颜色[255,255,255,255]
     */
    setGridLineColor(color: number[]): void;

    getCameraProperty(): any;
    setCameraProperty(opts: any): void;
    getCameraWheelSpeed(): number;
    setCameraWheelSpeed(speed: number): void;
    getCameraWanderSpeed(): number;
    setCameraWanderSpeed(speed: number): void;
    zoomSceneViewUp(): void;
    zoomSceneViewDown(): void;
    resetSceneViewZoom(): void;

    ///////////////
    // animation //
    ///////////////

    /**
     * 查询当前动画的播放状态
     */
    queryCurrentAnimationState(): any;

    /**
     * 查询当前动画的播放状态
     */
    queryCurrentAnimationInfo(): any;

    /**
     * 传入一个节点，查询这个节点所在的动画节点的 uuid
     * @param uuid 查询的节点的 uuid
     */
    queryAnimationRootNode(uuid: string): string;

    /**
     * 查询动画根节点的动画数据信息
     * @param uuid 查询的节点的 uuid
     */
    queryAnimationRootInfo(uuid: string): any;

    /**
     * 查询一个 clip 的 dump 数据
     * @param nodeUuid 节点的唯一标识符
     * @param clipUuid 动画的唯一标识符
     */
    queryAnimationClip(nodeUuid: string, clipUuid: string): any;

    /**
     * 查询一个节点上，可以编辑的动画属性数组
     * @param uuid 动画的 uuid
     */
    queryAnimationProperties(uuid: string): any;

    /**
     * 查询一个节点上，可以编辑的嵌入播放器数组
     * @param uuid 节点的 uuid
     */
     queryEmbeddedPlayerMenu(uuid: string): any;

    /**
     * 查询一个节点上的所有动画 clips 信息
     * @param nodeUuid 节点的唯一标识符
     */
    queryAnimationClipsInfo(nodeUuid: string): any;

    /**
     * 查询动画当前的播放时间信息
     * @param clipUuid 动画资源的唯一标识符
     */
    queryAnimationClipCurrentTime(clipUuid: string): number;

    /**
     * 查询动画当前轨道的某一帧的数值
     * @param clipUuid 动画 uuid
     * @param nodePath 查询数据所在的节点搜索路径
     * @param propKey 属性名字
     * @param frame 关键帧数
     */
    queryAnimationPropValueAtFrame(clipUuid: string, nodePath: string, propKey: string, frame: number): any;

    /**
     * 更改当前动画编辑模式
     * @param uuid uuid
     * @param active 激活或关闭
     */
    recordAnimation(uuid: string, active: boolean): Promise<boolean>;

    /**
     * 切换动画根节点
     * @param uuid uuid
     * @param clipUuid uuid of clip
     */
    changeAnimationRootNode(uuid: string, clipUuid: string): Promise<boolean>;

    /**
     * 更改当前当前关键帧
     * @param time 时间
     */
    setCurEditTime(time: number): Promise<boolean>;

    /**
     * 更改当前正在编辑的动画的播放状态
     * @param operate 操作
     * @param clipUuid uuid of clip
     */
    changeClipState(operate: string, clipUuid: string): Promise<boolean>;

    /**
     * 更改当前正在编辑的动画 uuid
     * @param clipUuid uuid of clip
     */
    setEditClip(clipUuid: string): Promise<boolean>;

    /**
     * 保存动画数据
     */
    saveClip(): Promise<boolean>;

    /**
     * 动画操作
     *
     * @param operationList 操作方法数组
     */
    applyAnimationOperation(operationList: IAnimOperation[]): Promise<boolean>;

    /////////////
    // preview //
    /////////////
    queryPreviewWindowList(): any;

    ////////////
    // script //
    ////////////
    queryScriptName(uuid: string): Promise<any>;
    queryScriptCid(uuid: string): Promise<any>;
    loadScript(uuid: string): Promise<void>;
    removeScript(info: any): Promise<void>;
    scriptChange(info: any): Promise<void>;

    ///////////////
    // selection //
    ///////////////
    _selectNode(uuid: string): void;
    _unselectNode(uuid: string): void;
    querySelection(): string[];
    isSelectNode(uuid: string): boolean;
    selectNode(uuid: string): void;
    unselectNode(uuid: string): void;
    clearSelection(): void;

    ////////////
    // effect //
    ////////////
    registerEffects(uuids: string[]): void;
    removeEffects(uuids: string[]): void;
    updateEffect(uuid: string): void;

    /////////////
    // terrain //
    /////////////
    onRemoveTerrain(uuid: string, info: any): void;

    /////////////
    // prefab  //
    /////////////
    createPrefab(uuid: string, url: string): any;
    getPrefabData(uuid: string): any;
    linkPrefab(nodeUuid: string, assetUuid: string): any;
    unlinkPrefab(nodeUuid: string, removeNested: boolean): any;
    applyPrefab(nodeUuid: string): any;

    //////////
    //  UI  //
    //////////
    distributeSelectionUI(type: string): void;
    alignSelectionUI(type: string): void;

    ////////////////
    //  particle  //
    ////////////////
    /**
     * 查询粒子播放的信息
     * @param uuid 粒子组件的 uuid
     */
    queryParticlePlayInfo(uuid: string): any;
    /**
     * 设置粒子播放速度
     * @param uuid 粒子组件的 uuid
     * @param speed 
     */
    setParticlePlaySpeed(uuid: string, speed: number): void;
    /**
     * 播放选中的粒子
     * @param uuid 粒子组件的 uuid
     */
    playParticle();
    /**
     * 重新开始播放选中的粒子
     * @param uuid 粒子组件的 uuid
     */
    restartParticle();
    /**
     * 暂停选中的粒子
     * @param uuid 粒子组件的 uuid
     */
    pauseParticle();
    /**
     * 停止播放选中的粒子
     * @param uuid 粒子组件的 uuid
     */
    stopParticle();
    /////////////////
    //  wireframe  //
    /////////////////
    // applyWireframeStorage(mode: any, color: any): void;
    // setWireframeMode(mode: any): void;
    // setWireframeColor(color: any): void;

    ///////////////////
    //    physics    //
    ///////////////////
    updatePhysicsGroup(): void;

    // others
    onEngineUpdate(): void;

    ///////////////////
    //    physics 2D   //
    ///////////////////
    regeneratePolygon2DPoints(uuid: string): void;

    ///////////////////
    //    particle 2D   //
    ///////////////////
    exportParticlePlist(uuid: string): Promise<any>;
}

export default ISceneFacade;
