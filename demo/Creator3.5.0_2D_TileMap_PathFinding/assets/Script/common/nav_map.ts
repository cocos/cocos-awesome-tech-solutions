import { _decorator, Component, UITransform, Vec3 } from 'cc';
import { astar } from './astar';
const { ccclass, property } = _decorator;

@ccclass('NavMap')
export class NavMap extends Component {
    @property
    public is_debug = true;

    public map = null;
    public center = new Vec3(0, 0, 0);
    public tempVec3 = new Vec3();
    onLoad() {
    }
    start() {

        this.map = { "data": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], "height": 20, "item_size": 32, "name": "demo1", "width": 30 };
        // if (this.is_debug) {
        //     this.map_degbu_draw();
        // }
    }
    map_degbu_draw() {
        var x_line = 0;
        var ypos = 0;
        // for (var i = 0; i < this.map.height; i++) {
        //     var xpos = x_line;
        //     for (var j = 0; j < this.map.width; j++) {
        //         if (this.map.data[i * this.map.width + j] === 0) {
        //             this.draw_node.drawSegment(cc.v2(xpos, ypos),
        //                 cc.v2(xpos + 1, ypos + 1),
        //                 1, cc.color(0, 255, 0, 255))
        //         }
        //         else {
        //             this.draw_node.drawSegment(cc.v2(xpos, ypos),
        //                 cc.v2(xpos + 1, ypos + 1),
        //                 1, cc.color(0, 0, 255, 255));
        //         }
        //         xpos += this.map.item_size;
        //     }
        //     ypos += this.map.item_size;
        // }
    }



    astar_search(src_w: any, dst_w: any) {
        let src = this.node.getComponent(UITransform).convertToNodeSpaceAR(src_w);
        let dst = this.node.getComponent(UITransform).convertToNodeSpaceAR(dst_w);
        let src_mx = Math.floor((Math.round(src.x)) / this.map.item_size);
        let src_my = Math.floor((Math.round(src.y)) / this.map.item_size);
        let dst_mx = Math.floor((Math.round(dst.x)) / this.map.item_size);
        let dst_my = Math.floor((Math.round(dst.y)) / this.map.item_size);
        let path = astar.prototype.astar_search(this.map, src_mx, src_my, dst_mx, dst_my);
        let world_offset = this.node.getComponent(UITransform).convertToWorldSpaceAR(this.center);
        let path_pos = [];
        for (var i = 0; i < path.length; i++) {
            var x = path[i].x * this.map.item_size;
            var y = path[i].y * this.map.item_size;
            var pos = new Vec3(world_offset.x + x, world_offset.y + y, 0);
            path_pos.push(pos);
        }
        return path_pos;
    }

}
