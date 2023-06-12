
import { _decorator, Component, Node, sp, instantiate, EventTouch, UITransform, Vec3, Enum } from 'cc';
const { ccclass, property } = _decorator;
const TouchBoneAgainstDragBoneCfg = {
    'front-foot-tip': {
        targetBoneName: 'front-foot-target',
        targetIkName: 'front-leg-ik'
    },
    'back-foot-tip': {
        targetBoneName: 'rear-foot-target',
        targetIkName: 'rear-leg-ik'
    }
};

type DragCfg = {
    targetBoneName: string,
    targetIkName: string
}
enum DragBindType {
    AUTO,
    MANUAL
}
Enum(DragBindType);

@ccclass('SpineDragCon')
export class SpineDragCon extends Component {
    @property({ type: DragBindType })
    dragBindType: DragBindType = DragBindType.AUTO;

    @property(Node)
    touchBaseNode: Node;
    private spine: sp.Skeleton;
    start() {
        this.spine = this.node.getComponent(sp.Skeleton);
        if (this.dragBindType == DragBindType.AUTO) this.initTouchBones();
        this.setTouchsEvent();
    }
    private initTouchBones() {
        const _bonesSockets: sp.SpineSocket[] = [];
        for (let touchBone in TouchBoneAgainstDragBoneCfg) {
            const _touchBone = this.spine.findBone(touchBone);
            const _touchNode = instantiate(this.touchBaseNode);
            _touchNode.parent = this.touchBaseNode.parent;
            _bonesSockets.push(new sp.SpineSocket(this.getBonePath(_touchBone), _touchNode));
        }
        this.touchBaseNode.destroy();
        this.spine.sockets = _bonesSockets;
    }
    private setTouchsEvent() {
        this.spine.sockets.forEach(socketBone => {
            const _boneName = this.getBoneNameFromPath(socketBone.path);
            const _cfg = TouchBoneAgainstDragBoneCfg[_boneName];
            this.setTouchEvent(_cfg, socketBone.target);
        })
    }
    private getBoneNameFromPath(path: string): string {
        return path.match(/[\w\-]+$/)[0];
    }
    private setTouchEvent(cfg: DragCfg, touchNode: Node) {
        const bone = this.spine.findBone(cfg.targetBoneName) as sp.spine.Bone;
        const _hasIKCfg = !!cfg.targetIkName;
        const _ik = _hasIKCfg ? this.spine._skeleton.ikConstraints.find(({ data }) => data.name == cfg.targetIkName) : null;
        const _bones = _hasIKCfg ? _ik.bones : null;
        let _lastAngle = 100;
        let _lastIkDir = 1;
        const _touchWorldPos = new Vec3();
        const _touchPos = new Vec3();
        touchNode.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) => {
            const _wpos = e.getUILocation();
            _touchWorldPos.set(_wpos.x, _wpos.y);
            this.spine.node.getComponent(UITransform).convertToNodeSpaceAR(_touchWorldPos, _touchPos)
            bone.x = _touchPos.x;
            bone.y = _touchPos.y;

            if (!_hasIKCfg) return;
            if (Math.abs(_bones[1].arotation) < 2) {
                const _dir = _bones[0].arotation > _lastAngle ? 1 : -1;
                if (_lastIkDir !== _dir) {
                    _ik.bendDirection = _lastIkDir = _dir;
                }
            }
            _lastAngle = _bones[0].arotation;
        })
    }
    private getBonePath(bone: sp.spine.Bone): string {
        const _boneData = bone.data;
        const _path = [_boneData.name];
        let _curBoneData = _boneData;
        while (_curBoneData.parent) {
            _curBoneData = _curBoneData.parent;
            _path.push(_curBoneData.name);
        }
        return _path.reverse().join('/');
    }
}