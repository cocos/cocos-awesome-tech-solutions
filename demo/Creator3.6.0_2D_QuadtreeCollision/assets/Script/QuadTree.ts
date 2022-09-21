import { _decorator, Component, Prefab, Node, instantiate, UITransform, director } from 'cc';
export class Quadtree {
    public max_objects: number;
    public max_levels: number;
    public level: number;
    public bounds: any;
    public objects: Array<Node>;
    public nodes: Array<Quadtree>;
    /**
     * Quadtree Constructor
     * @param Object bounds             节点的边界 { x, y, width, height }
     * @param Integer max_objects      (可选)一个节点在分裂成4个子节点之前可以容纳的最大对象(默认：10)
     * @param Integer max_levels       (可选)根四叉树内的最大级别总数(默认：4) 
     * @param Integer level           (可选）深度等级，对子节点来说是必需的（默认：0）。
     */
    public constructor(bounds, max_objects?, max_levels?, level?) {

        this.max_objects = max_objects || 10;
        this.max_levels = max_levels || 4;

        this.level = level || 0;
        this.bounds = bounds;

        this.objects = [];
        this.nodes = [];
    };


    /**
     *将该节点分成4个子节点
     */
    split() {

        let nextLevel = this.level + 1,
            subWidth = this.bounds.width / 2,
            subHeight = this.bounds.height / 2,
            x = this.bounds.x,
            y = this.bounds.y;

        //右上角节点
        this.nodes[0] = new Quadtree({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        //左上角节点
        this.nodes[1] = new Quadtree({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        //左下角节点
        this.nodes[2] = new Quadtree({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        //右下角节点
        this.nodes[3] = new Quadtree({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);
    };


    /**
     * 确定该对象属于哪个节点
     * @param Object pRect     要检查的区域的边界，包括x、y、宽度、高度
     * @return Array          相交的子节点的索引数组 (0-3 = 右上、左上、左下、右下/NE、NW、SW、SE)
     */
    getIndex(node:Node) {
        let pRect = node.getComponent(UITransform);
        let pRectPos = node.getPosition();
        let indexes = [],
            verticalMidpoint = this.bounds.x + (this.bounds.width / 2),
            horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

        let startIsNorth = pRectPos.y < horizontalMidpoint,
            startIsWest = pRectPos.x < verticalMidpoint,
            endIsEast = pRectPos.x + pRect.width > verticalMidpoint,
            endIsSouth = pRectPos.y + pRect.height > horizontalMidpoint;

        //右上角四边形
        if (startIsNorth && endIsEast) {
            indexes.push(0);
        }

        //左上角四边形
        if (startIsWest && startIsNorth) {
            indexes.push(1);
        }

        //左下角四边形
        if (startIsWest && endIsSouth) {
            indexes.push(2);
        }

        //右下角四边形
        if (endIsEast && endIsSouth) {
            indexes.push(3);
        }

        return indexes;
    };


    /**
     * 将该对象插入节点。如果该节点超过容量，它就会分裂并将所有的对象到它们相应的子节点。
     * @param Object pRect       要添加的对象的边界 { x, y, width, height }
     */
    insert(node:Node) {

        let i = 0,
            indexes;

        //如果我们有子节点，在匹配的子节点上调用插入。
        if (this.nodes.length) {
           let indexes = this.getIndex(node);

            for (let i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].insert(node);
            }
            return;
        }

        //否则，将对象存储在这里
        this.objects.push(node);

        //max_objects 达成
        if (this.objects.length > this.max_objects && this.level < this.max_levels) {

            //如果我们还没有子节点，就进行分割
            if (!this.nodes.length) {
                this.split();
            }

            //将所有对象添加到其相应的子节点中
            for (i = 0; i < this.objects.length; i++) {
                indexes = this.getIndex(this.objects[i]);
                for (let k = 0; k < indexes.length; k++) {
                    this.nodes[indexes[k]].insert(this.objects[i]);
                }
            }

            //清理这个节点
            this.objects = [];
        }
    };


    /**
     * 返回所有可能与给定对象发生碰撞的对象。
     * @param Object node     要检查的对象的边界 { x, y, width, height }
     * @return Array            包含所有检测到的对象的数组
     */
    retrieve(node) {

        let indexes = this.getIndex(node),
            returnObjects = this.objects;

        //如果我们有子节点，检索它们的对象
        if (this.nodes.length) {
            for (let i = 0; i < indexes.length; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(node));
            }
        }

        //删除重复的内容
        returnObjects = returnObjects.filter(function (item, index) {
            return returnObjects.indexOf(item) >= index;
        });

        return returnObjects;
    };


    /**
     * 清除四叉树
     */
    clear() {

        this.objects = [];

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes.length) {
                this.nodes[i].clear();
            }
        }

        this.nodes = [];
    };



}