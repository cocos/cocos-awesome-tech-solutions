import { constant } from '../framework/constant';
import { _decorator, Component, Vec3, RigidBodyComponent, EPSILON, ColliderComponent, ICollisionEvent, IContactEquation, Collider, RigidBody, PhysicsSystem } from 'cc';
//角色刚体碰撞检测组件
const { ccclass, property } = _decorator;
const v3_0 = new Vec3();
const v3_1 = new Vec3();

class ContactPoint {
    point = new Vec3();
    normal = new Vec3();
    collider!: Collider;
    assign (ce: IContactEquation, c: Collider) {
        if (ce.isBodyA) {
            ce.getWorldNormalOnB(this.normal);
            ce.getWorldPointOnA(this.point);
        } else {
            (ce as any).getWorldNormalOnA(this.normal);
            ce.getWorldPointOnB(this.point);
        }
        this.collider = c;
        return this;
    }
}

const _ctPool: ContactPoint[] = [];
class ContactPool {
    static getContacts (ces: IContactEquation[], c: Collider, cps: ContactPoint[]) {
        for (let i = 0; i < ces.length; i++) {
            cps.push(this.getContact(ces[i], c));
        }
    }
    static getContact (ce: IContactEquation, c: Collider): ContactPoint {
        const cp = _ctPool.length > 0 ? _ctPool.pop()! : new ContactPoint();
        return cp.assign(ce, c);
    }
    static recyContacts (cps: ContactPoint[]) {
        Array.prototype.push.call(_ctPool, ...cps);
        cps.length = 0;
    }
}

@ccclass('CharacterRigid')
export class CharacterRigid extends Component {    
    @property
    public damping:number = 0.5;//阻尼

    @property
    public gravity:number = -10;//重力

    private _rigidBody: RigidBodyComponent = null!;
    private _collider: ColliderComponent = null!;
    private _grounded = true;//是否着地
    private _contacts: ContactPoint[] = [];//碰撞接触点
    private _groundContact: ContactPoint = null!;//与地面碰撞的点
    private _groundNormal = Vec3.UP.clone();//地面法向量
    private _velocity = new Vec3();//线性速度
    private _curMaxSpeed: number = 0;//当前最大速度

    protected _stateX: number = 0;  // 1 positive, 0 static, -1 negative
    protected _stateZ: number = 0;

    get velocity () { return this._velocity; }
    get onGround () { return this._grounded; }

    onLoad () {
        this._rigidBody = this.getComponent(RigidBodyComponent)!;
        this._collider = this.getComponent(ColliderComponent)!;
    }

    // onEnable () {
    //     this._collider.on('onCollisionEnter', this._onCollision, this);
    //     this._collider.on('onCollisionStay', this._onCollision, this);
    //     this._collider.on('onCollisionExit', this._onCollision, this);
    // }

    // onDisable () {
    //     this._collider.off('onCollisionEnter', this._onCollision, this);
    //     this._collider.off('onCollisionStay', this._onCollision, this);
    //     this._collider.off('onCollisionExit', this._onCollision, this);
    // }

    start () {
      
    }

    public initSpeed (moveSpeed: number,  ratio: number = 1) {
        this._curMaxSpeed = moveSpeed * ratio;
    }

    /**
     * 角色移动传入x和z
     *
     * @param {number} x
     * @param {number} z
     */
    public move (x: number, z: number) {
        if ((x > 0 && this._stateX < 0) || (x < 0 && this._stateX > 0) || (z > 0 && this._stateZ < 0) || (z < 0 && this._stateZ > 0)) {
            this.clearVelocity();
            // console.log("当前跟之前方向不一致则清除速度,避免惯性太大");
        }

        this._stateX = x;
        this._stateZ = z;
        // console.log("_stateX", this._stateX, "z", this._stateZ);
    }

    /**
     * 刚体停止移动
     *
     */
    public stopMove () {
        this._stateX = 0;
        this._stateZ = 0;
        this.clearVelocity();
    }

    /**
     * 更新刚体状态
     *
     * @private
     * @param {number} dt
     * @return {*} 
     */
    private _updateCharacter (dt: number) {
        this.updateFunction(dt);

        if (!this.onGround) return;
        if (this._stateX || this._stateZ) {
            v3_0.set(this._stateX, 0, this._stateZ);
            v3_0.normalize().negative();
            this.rigidMove(v3_0, 1);
        }
    }

    /**
     * 清除移动速度
     */
    public clearVelocity () {
        this._rigidBody.clearVelocity();
    }

    /**
     * 刚体移动
     *
     * @param {Vec3} dir
     * @param {number} speed
     */
    public rigidMove (dir: Vec3, speed: number) {
        this._rigidBody.getLinearVelocity(v3_1);
        Vec3.scaleAndAdd(v3_1, v3_1, dir, speed);

        const ms = this._curMaxSpeed;
        const len = v3_1.lengthSqr();
        if (len > ms) {
            v3_1.normalize();
            v3_1.multiplyScalar(ms);
        }
        this._rigidBody.setLinearVelocity(v3_1);

        // console.log('setLinearVelocity1' + v3_1);
    }

    /**
     * 刷新
     * @param dt 
     */
    public updateFunction (dt: number) {
        // this._updateContactInfo();
        this._applyGravity();
        this._applyDamping();
        this._saveState();
    }

    /**
     * 施加阻尼
     *
     * @private
     * @param {number} [dt=1 / constant.GAME_FRAME]
     */
    private _applyDamping (dt = 1 / constant.GAME_FRAME) {
        this._rigidBody.getLinearVelocity(v3_1);
        // console.log('getLinearVelocity2' + v3_1);
        if (v3_1.lengthSqr() > EPSILON) {
            v3_1.multiplyScalar(Math.pow(1.0 - this.damping, dt));
            this._rigidBody.setLinearVelocity(v3_1);
            // console.log('setLinearVelocity2' + v3_1);
        }
    }

    /**
     * 施加重力
     *
     * @private
     */
    private _applyGravity () {
        const g = this.gravity;
        const m = this._rigidBody.mass;
        v3_1.set(0, m * g, 0);
        this._rigidBody.applyForce(v3_1)
    }

    /**
     * 获取线性速度
     *
     * @private
     */
    private _saveState () {
        this._rigidBody.getLinearVelocity(this._velocity);
        // console.log('getLinearVelocity3' + this._velocity  + ":" + this._grounded);
    }

    // /**
    //  * 更新碰撞信息，判断是否角色着地
    //  *
    //  * @private
    //  */
    // private _updateContactInfo () {
    //     this._grounded = false;
    //     this._groundContact = null!;
    //     const wp = this.node.worldPosition;
    //     let maxY = -0.001;
    //     let offsetY = 0.5;//默认为0.1
    //     for (let i = 0; i < this._contacts.length; i++) {
    //         const c = this._contacts[i];
    //         const n = c.normal, p = c.point;
    //         if (n.y <= 0.0001) continue;
    //         else {
    //             if (n.y > maxY && p.y > wp.y - offsetY) {
    //                 this._grounded = true;
    //                 maxY = n.y;
    //                 this._groundContact = c;
    //             }
    //         }
    //     }
    //     if (this._grounded) {
    //         Vec3.copy(this._groundNormal, this._groundContact.normal);
    //     } else {
    //         Vec3.copy(this._groundNormal, Vec3.UP);
    //         // console.log("没着地", this.node.name);
    //     }
    //     ContactPool.recyContacts(this._contacts);
    // }

    // /**
    //  * 检测碰撞，收集碰撞信息
    //  *
    //  * @private
    //  * @param {ICollisionEvent} event
    //  */
    // private _onCollision (event: ICollisionEvent) {
    //     ContactPool.getContacts(event.contacts, event.selfCollider, this._contacts);
    // }

    update (dtS: number) {
        const dt = 1000 / constant.GAME_FRAME;
        this._updateCharacter(dt);
    }
}