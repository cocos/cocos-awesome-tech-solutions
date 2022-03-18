import { _decorator } from 'cc';

export class QuadTree<T> {
    private root = null;

    public constructor(bounds: any, pointQuad: boolean, maxDepth?: undefined, maxChildren?: undefined) {
        var node;
        if (pointQuad) {
            node = new NodeQ(bounds, 0, maxDepth, maxChildren);
        } else {
            node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
        }
        this.root = node;
    }
    
    public insert(item) {
        if (item instanceof Array) {
            var len = item.length;
            for (var i = 0; i < len; i++) {
                this.root.insert(item[i]);
            }
        } else {
            this.root.insert(item);
        }
    }

    public clear() {
        this.root.clear();
    }

    public retrieve(item): Array<T> {
        var out = this.root.retrieve(item).slice(0);
        return out;
    }
}

export class NodeQ {
    //subnodes
    protected nodes = null;
    //children contained directly in the node
    protected children = null;
    private _bounds = null;
    //read only
    protected _depth = 0;
    protected _maxChildren = 4;
    protected _maxDepth = 4;
    public static TOP_LEFT = 0;
    public static TOP_RIGHT = 1;
    public static BOTTOM_LEFT = 2;
    public static BOTTOM_RIGHT = 3;

    public constructor(bounds: any, depth: number, maxDepth: number, maxChildren: number) {
        this._bounds = bounds;
        this.children = [];
        this.nodes = [];

        if (maxChildren) {
            this._maxChildren = maxChildren;
        }

        if (maxDepth) {
            this._maxDepth = maxDepth;
        }

        if (depth) {
            this._depth = depth;
        }
    }

    public insert(item) {
        if (this.nodes.length) {
            var index = this._findIndex(item);
            this.nodes[index].insert(item);
            return;
        }
        this.children.push(item);

        var len = this.children.length;
        if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
            this.subdivide();
            
            var i;
            for (i = 0; i < len; i++) {
                this.insert(this.children[i]);
            }
            this.children.length = 0;
        }
    }

    public retrieve(item) {
        if (this.nodes.length) {
            var index = this._findIndex(item);
            return this.nodes[index].retrieve(item);
        }

        return this.children;
    }

    public _findIndex(item) {
        var b = this._bounds;
        var left = (item.x > b.x + b.width / 2) ? false : true;
        var top = (item.y > b.y + b.height / 2) ? false : true;

        // top left
        var index = NodeQ.TOP_LEFT;
        if (left) {
            // left side
            if (!top) {
                // bottom left
                index = NodeQ.BOTTOM_LEFT;
            }
        } else {
            //right side
            if (top) {
                // top right
                index = NodeQ.TOP_RIGHT;
            } else {
            //bottom right
                index = NodeQ.BOTTOM_RIGHT;
            }
        }
        return index;
    }

    public subdivide() {
        var depth = this._depth + 1;
        var bx = this._bounds.x;
        var by = this._bounds.y;
        // floor the values
        var b_w_h = (this._bounds.width / 2); //todo: Math.floor?
        var b_h_h = (this._bounds.height / 2);
        var bx_b_w_h = bx + b_w_h;
        var by_b_h_h = by + b_h_h;
        //top left
        this.nodes[NodeQ.TOP_LEFT] = new NodeQ({
            x: bx,
            y: by,
            width: b_w_h,
            height: b_h_h
        },
        depth, this._maxDepth, this._maxChildren);

        // top right
        this.nodes[NodeQ.TOP_RIGHT] = new NodeQ({
            x: bx_b_w_h,
            y: by,
            width: b_w_h,
            height: b_h_h
        },
        depth, this._maxDepth, this._maxChildren);

        // bottom left
        this.nodes[NodeQ.BOTTOM_LEFT] = new NodeQ({
            x: bx,
            y: by_b_h_h,
            width: b_w_h,
            height: b_h_h
        },
        depth, this._maxDepth, this._maxChildren);


        // bottom right
        this.nodes[NodeQ.BOTTOM_RIGHT] = new NodeQ({
            x: bx_b_w_h,
            y: by_b_h_h,
            width: b_w_h,
            height: b_h_h
        },
        depth, this._maxDepth, this._maxChildren);
    }

    public clear() {
        this.children.length = 0;

        var len = this.nodes.length;

        var i;
        for (i = 0; i < len; i++) {
        this.nodes[i].clear();
        }

        this.nodes.length = 0;
    }
}

export class BoundsNode extends NodeQ {
    protected _stuckChildren = null;
    protected _out = [];

    public constructor(bounds, depth, maxChildren, maxDepth) {
        super(bounds, depth, maxChildren, maxDepth);
    }

    public insert(item) {
        if (this.nodes.length) {
            var index = this._findIndex(item);
            var node = this.nodes[index];

            //todo: make _bounds bounds
            if (item.x >= node._bounds.x &&
                item.x + item.width <= node._bounds.x + node._bounds.width &&
                item.y >= node._bounds.y &&
                item.y + item.height <= node._bounds.y + node._bounds.height) {

                this.nodes[index].insert(item);
            } else {
                this._stuckChildren.push(item);
            }

            return;
        }
        this.children.push(item);

        var len = this.children.length;
        if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
            this.subdivide();

            var i;
            for (i = 0; i < len; i++) {
                this.insert(this.children[i]);
            }

            this.children.length = 0;
        }
    }

    public getChildren() {
        return this.children.concat(this._stuckChildren);
    }

    public retrieve(item) {
        var out = this._out;
        out.length = 0;
        if (this.nodes.length) {
            var index = this._findIndex(item);
            var node = this.nodes[index];

            if (item.x >= node._bounds.x &&
                item.x + item.width <= node._bounds.x + node._bounds.width &&
                item.y >= node._bounds.y &&
                item.y + item.height <= node._bounds.y + node._bounds.height) {

                out.push.apply(out, this.nodes[index].retrieve(item));
            } else {
                //Part of the item are overlapping multiple child nodes. For each of the overlapping nodes, return all containing objects.
                if (item.x <= this.nodes[NodeQ.TOP_RIGHT]._bounds.x) {
                    if (item.y <= this.nodes[NodeQ.BOTTOM_LEFT]._bounds.y) {
                        out.push.apply(out, this.nodes[NodeQ.TOP_LEFT].getAllContent());
                    }

                    if (item.y + item.height > this.nodes[NodeQ.BOTTOM_LEFT]._bounds.y) {
                        out.push.apply(out, this.nodes[NodeQ.BOTTOM_LEFT].getAllContent());
                    }
                }

                if (item.x + item.width > this.nodes[NodeQ.TOP_RIGHT]._bounds.x) {//position+width bigger than middle x
                    if (item.y <= this.nodes[NodeQ.BOTTOM_RIGHT]._bounds.y) {
                        out.push.apply(out, this.nodes[NodeQ.TOP_RIGHT].getAllContent());
                    }

                    if (item.y + item.height > this.nodes[NodeQ.BOTTOM_RIGHT]._bounds.y) {
                        out.push.apply(out, this.nodes[NodeQ.BOTTOM_RIGHT].getAllContent());
                    }
                }
            }
        }

        out.push.apply(out, this._stuckChildren);
        out.push.apply(out, this.children);

        return out;
    }

    public getAllContent() {
        var out = this._out;
        if (this.nodes.length) {
            var i;
            for (i = 0; i < this.nodes.length; i++) {
                this.nodes[i].getAllContent();
            }
        }
        out.push.apply(out, this._stuckChildren);
        out.push.apply(out, this.children);
        return out;
    }

    public clear() {
        this._stuckChildren.length = 0;

        // array
        this.children.length = 0;

        var len = this.nodes.length;
        if (!len) {
            return;
        }

        var i;
        for (i = 0; i < len; i++) {
            this.nodes[i].clear();
        }

        //array
        this.nodes.length = 0;
    }
}
