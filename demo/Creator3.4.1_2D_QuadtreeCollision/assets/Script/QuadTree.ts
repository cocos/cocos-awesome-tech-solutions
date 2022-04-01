import { _decorator } from 'cc';

export class QuadTree<T> {
    private root = null;

    public constructor(bounds: any, pointQuad: boolean, maxDepth?: undefined, maxChildren?: undefined) {
        var node;
        if (pointQuad) {
            node = new NodeQ(bounds, 0, maxDepth, maxChildren);
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
         let   indexes = this._findIndex(item);
     
            for(let i=0; i<indexes.length; i++) {
                this.nodes[indexes[i]].insert(item);     
            }
            return;
        }
        this.children.push(item);

        var len = this.children.length;

        if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
            this.subdivide();
            
           
            for (let i = 0; i < len; i++) {
                this.insert(this.children[i]);
            }
            this.children.length = 0;
        }
    }

    public retrieve(item) {
        let  indexes = this._findIndex(item);
        let returnObjects = this.children;
        if (this.nodes.length) {
            for(var i=0; i<indexes.length; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(item));
            }
        }
        returnObjects = returnObjects.filter(function(item, index) {
            return returnObjects.indexOf(item) >= index;
        });
        return returnObjects
    }
    /**
     * 检测新加入的节点位于原点的什么位置
     * @param item 新加入的节点
     * @returns 
     */
    public _findIndex(item) {
        // var b = this._bounds;
        // var left = (item.x > b.x + b.width / 2) ? false : true;
        // var top = (item.y > b.y + b.height / 2) ? false : true;

        // // top left
        // var index = NodeQ.TOP_LEFT;
        // if (left) {
        //     // left side
            // if (!top) {
            //     // bottom left
            //     index = NodeQ.BOTTOM_LEFT;
            // }
        // } else {
        //     //right side
        //     if (top) {
        //         // top right
        //         index = NodeQ.TOP_RIGHT;
        //     } else {
        //     //bottom right
        //         index = NodeQ.BOTTOM_RIGHT;
        //     }
        // }
        // return index;

        let _bounds_node = this._bounds;
        var indexes = [],
            verticalMidpoint    = _bounds_node.x + (_bounds_node.width/2),
            horizontalMidpoint  = _bounds_node.y + (_bounds_node.height/2);    

        var startIsNorth = item.y < horizontalMidpoint,
            startIsWest  = item.x < verticalMidpoint,
            endIsEast    = item.x + item.width > verticalMidpoint,
            endIsSouth   = item.y + item.height > horizontalMidpoint;    

        //top-right quad
        if(startIsNorth && endIsEast) {
            indexes.push(0);
        }
        
        //top-left quad
        if(startIsWest && startIsNorth) {
            indexes.push(1);
        }

        //bottom-left quad
        if(startIsWest && endIsSouth) {
            indexes.push(2);
        }

        //bottom-right quad
        if(endIsEast && endIsSouth) {
            indexes.push(3);
        }
     
        return indexes;
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

        
        for (let i = 0; i < len; i++) {
        this.nodes[i].clear();
        }

        this.nodes.length = 0;
    }
}

