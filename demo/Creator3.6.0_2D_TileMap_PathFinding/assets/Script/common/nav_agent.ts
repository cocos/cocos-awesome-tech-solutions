import { _decorator, Component, UITransform, Vec2, Vec3 } from 'cc';
import { NavMap } from './nav_map';
const { ccclass, property } = _decorator;

let State = {
    Idle: 0,
    Walk: 1,
};
@ccclass('NavAgent')
export class NavAgent extends Component {
    @property
    public speed = 100;
    @property(NavMap)
    public game_map: NavMap = null;

    public state = State.Idle;
    public walk_total = 0.0;
    public walk_time = 0;
    public center = new Vec3(0,0,0);
    public road_set = null;
    public walk_next = -1;
    public vx = -1;
    public vy = -1;
    onLoad () {
        
    }

    nav_to_map (dst_wpos: any) {
        var src_wpos = this.node.getComponent(UITransform).convertToWorldSpaceAR(this.center);
        console.log(src_wpos);
        this.road_set = this.game_map.astar_search(src_wpos, dst_wpos);
        console.log(this.road_set);
        if(!this.road_set || this.road_set.length <= 1) {
           this.state = State.Idle;
           return;
        }
        this.walk_next = 1;
        this._walk_to_next();
    }

    stop_nav () {
        this.state = State.Idle;
    }

    _walk_to_next () {
        if(!this.road_set || this.walk_next >= this.road_set.length) {
           this.state = State.Idle;
           return;
        }
        let src = this.node.getPosition();
        let dst = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(this.road_set[this.walk_next]);
        let dir = new Vec3();
        Vec3.subtract(dir,dst,src)
        let len = dir.length();
        this.vx = (dir.x / len) * this.speed;
        this.vy = (dir.y / len) * this.speed;
        this.walk_total = len / this.speed;
        this.walk_time = 0;
        this.state = State.Walk;
    }

    _walk_update (dt: any) {
        if(this.state != State.Walk) {
           return;
        }
        this.walk_time += dt;
        if (this.walk_time > this.walk_total) {
           dt -= (this.walk_time - this.walk_total);
        }
        var sx = this.vx * dt;
        var sy = this.vy * dt;
        let pos = this.node.getPosition();
        this.node.setPosition(pos.x+sx,pos.y+sy,pos.z)
       
        if (this.walk_time > this.walk_total) {
           this.walk_next ++;
           this._walk_to_next();
        }
    }

    update (dt: any) {
        if(this.state == State.Walk) {
           this._walk_update(dt);
        }
    }

}

