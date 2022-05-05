
import { _decorator, Component, Node, Graphics,rect, Rect, Vec2, AffineTransform, Color,error } from 'cc';
const { ccclass, property } = _decorator;
import { RPath } from './RPath';
let LineJoin = Graphics.LineJoin;
let LineCap = Graphics.LineCap;
window.domhandler.prototype._addDomElement = function(element){
    var parent = this._tagStack[this._tagStack.length - 1];
    var siblings = parent ? parent.children : this.dom;
    var previousSibling = siblings[siblings.length - 1];

    element.next = null;

    if(this._options.withStartIndices){
        element.startIndex = this._parser.startIndex;
    }

    if (this._options.withDomLvl1) {

        var originElement = element;
        element = Object.create(element.type === "tag" ? Element : Node);
        for (var k in originElement) {
            element[k] = originElement[k];
        }
    }

    if(previousSibling){
        element.prev = previousSibling;
        previousSibling.next = element;
    } else {
        element.prev = null;
    }

    siblings.push(element);
    element.parent = parent || null;
};
// import  Cheerio  from "cheerio";
function trim(s) {
    return s.replace(/^\s+|\s+$/g, '');
}

function compressSpaces(s) {
    return s.replace(/[\s\r\t\n]+/gm, ' ');
}

function toNumberArray(s) {
    var a = trim(compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
    for (var i = 0; i < a.length; i++) {
        a[i] = parseFloat(a[i]);
    }
    return a;
}

function parseStyle(current, name, value) {
    if (name === 'fill') {
        current.fillColor = value === 'none' ? null : new Color().fromHEX(value);
    } else if (name === 'stroke') {
        current.strokeColor = value === 'none' ? null : new Color().fromHEX(value);
    } else if (name === 'stroke-width') {
        current.lineWidth = parseFloat(value);
    } else if (name === 'stroke-linejoin') {
        current.lineJoin = Graphics.LineJoin[value.toUpperCase()];
    } else if (name === 'stroke-linecap') {
        current.lineCap = Graphics.LineCap[value.toUpperCase()];
    } else if (name === 'stroke-dasharray') {
        current.dashArray = toNumberArray[value];
    } else if (name === 'stroke-dashoffset') {
        current.dashOffset = parseFloat(value);
    } /* else {
        cc.log("Unhandled style: " + name + " -- " + value);
    } */
}

function parseNode(node, parent) {
    var current;

    var tagName = node.tagName;
    if (tagName === 'g') {
        current = parent.addGroup();
    }
    else if (tagName === 'path') {
        current = parent.addPath();
        current.path(node.attribs.d);
    }

    if (current && node.attribs) {
        // transform
        var transform = node.attribs.transform;
        if (transform) {
            var data = trim(compressSpaces(transform)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g, ') ').split(/\s(?=[a-z])/);
            for (var i = 0; i < data.length; i++) {
                var type = trim(data[i].split('(')[0]);
                var s = data[i].split('(')[1].replace(')', '');
                var a = toNumberArray(s);

                if (type === 'translate') {
                    current.position = new Vec2(a[0], a[1]);
                }
                else if (type === 'rotate') {
                    current.rotation = a[0];
                }
                else if (type === 'scale') {
                    current.scale = new Vec2(a[0], a[1]);
                }
            }
        }

        var styles = node.attribs.style;
        if (styles) {
            styles = styles.split(';');
            for (var i = 0; i < styles.length; i++) {
                if (trim(styles[i]) !== '') {
                    var style = styles[i].split(':');
                    var name = trim(style[0]);
                    var value = trim(style[1]);

                    parseStyle(current, name, value);
                }
            }
        }

        for (var property in node.attribs) {
            if (node.attribs[property+'']) {
                parseStyle(current, property, node.attribs[property]);
            }
        }
    }

    var children = node.children;
    if (children) {
        for (var i = 0, ii = children.length; i < ii; i++) {
            var child = children[i];
            parseNode(child, current || parent);
        }
    }
}


@ccclass('RGroup')
export class RGroup extends Component {
    // use this for initialization
    private _children = [];
    public get children() {
        return this._children;
    }
    public set children(value) {
        this._children = value;
    }
    private _parent = null;
    public get parent() {
        return this._parent;
    }
    public set parent(value) {
        this._parent = value;
    }

    private _selected = false;
    public get selected() {
        return this._selected;
    }
    public set selected(value) {
        var children = this.children;
        this.selected = value;
        for (var i = 0, ii = children.length; i < ii; i++) {
            children[i].selected = value;
        }
    }
    private _dirty = true;
    public get dirty() {
        return this._dirty;
    }
    public set dirty(value) {
        this._dirty = value;
    }
    private _ctx = null;
    public get ctx() {
        return this._ctx;
    }
    public set ctx(value) {
        this._ctx = value;
    }
    private _showBoundingBox = false;
    public get showBoundingBox() {
        return this._showBoundingBox;
    }
    public set showBoundingBox(value) {
        this._showBoundingBox = value;
    }
    
    //R.transform ->>>>>>>>>>>>>>
    _transform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    _worldTransform: AffineTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    private _transformDirty = true;
    public get transformDirty() {
        return this._transformDirty;
    }
    public set transformDirty(value) {
        if (value) {
            // if (this.parent) {
            //     this.parent._transformDirty = true;
            // }

            this._dirty = true;
        }
    }
    private _scale: Vec2 = new Vec2(1, 1);
    public get scale() {
        return this._scale;
    }
    public set scale(value) {
        if (this._scale.equals(value)) {
            return;
        }
        this._scale = value;
        this.transformDirty = true;
    }

    private _position: Vec2 = new Vec2(0, 0);
    public get position() {
        return this._position;
    }
    public set position(value) {
        if (this._position.equals(value)) {
            return;
        }
        this._position = value;
        this.transformDirty = true;
    }
    private _rotation = 0;
    public get rotation() {
        return this._rotation;
    }
    public set rotation(value) {
        if (this._rotation === value) {
            return;
        }
        this._rotation = value;
        this.transformDirty = true;
    }
    private _flipX = false;
    public get flipX() {
        return this._flipX;
    }
    public set flipX(value) {
        if (this._flipX === value) {
            return;
        }
        this._flipX = value;
        this.transformDirty = true;
    }
    private _flipY=false;
    public get flipY() {
        return this._flipY;
    }
    public set flipY(value) {
        if (this._flipY === value) {
            return;
        }
        this._flipY = value;
        this.transformDirty = true;
    }
    //R.transform ->>>>>>>>>>>>>>>>>>

    //group
    _lineWidth;
    public get lineWidth() {
        return this._lineWidth || 2;
    }
    public set lineWidth(value) {
        this._lineWidth = value;
        this._dirty = true;
    }
    private _lineJoin = null;
    public get lineJoin() {
        return this._lineJoin || LineJoin.MITER;
    }
    public set lineJoin(value) {
        this._lineJoin = value;
        this._dirty = true;
    }
    private _lineCap;
    public get lineCap() {
        return this._lineCap || LineCap.BUTT;
    }
    public set lineCap(value) {
        this._lineCap = value;
        this._dirty = true;
    }
    private _strokeColor;
    public get strokeColor() {
        return this._strokeColor || Color.RED;
    }
    public set strokeColor(value) {
        this._strokeColor = value;
        this._dirty = true;
    }
    private _fillColor;
    public get fillColor() {
        return this._fillColor || Color.WHITE;
    }
    public set fillColor(value) {
        this._fillColor = value;
        this._dirty = true;

    }
    private _miterLimit;
    public get miterLimit() {
        return this._miterLimit || 10;
    }
    public set miterLimit(value) {
        this._miterLimit = value;
        this._dirty = true;

    }
    private _dashOffset;
    public get dashOffset() {
        return this._dashOffset || 0;
    }
    public set dashOffset(value) {
        if (this._dashOffset === value) {
            return;
        }
        this._dashOffset = value;
        this._dirty = true;

    }
    private _dashArray;
    public get dashArray() {
        return this._dashArray;
    }
    public set dashArray(value) {
        if (!Array.isArray(value)) {
            return;
        }
        this._dashArray = value;
        this._dirty = true;

    }


    public _transformCommand(cmd, t) {
        if (cmd.length <= 1) {
            return cmd;
        }

        cmd = cmd.slice(1, cmd.length);

        if (t.a === 1 && t.d === 1 &&
            t.b === 0 && t.c === 0 &&
            t.tx === 0 && t.ty === 0) {
            return cmd;
        }

        var tempPoint = new Vec2();

        for (var i = 0, ii = cmd.length / 2; i < ii; i++) {
            var j = i * 2;
            tempPoint.x = cmd[j];
            tempPoint.y = cmd[j + 1];

            tempPoint = AffineTransform.transformVec2(new Vec2(0, 0), tempPoint, t);

            cmd[j] = tempPoint.x;
            cmd[j + 1] = tempPoint.y;
        }

        return cmd;
    }

    getTransform() {
        if (this.transformDirty) {
            var scaleX = this.flipX ? -this._scale.x : this._scale.x;
            var scaleY = this.flipY ? -this._scale.y : this._scale.y;
            var positionX = this._position.x;
            var positionY = this._position.y;
            var rotation = this._rotation;

            var t = this._transform;
            t.tx = positionX;
            t.ty = positionY;
            t.a = t.d = 1;
            t.b = t.c = 0;

            // rotation Cos and Sin
            if (rotation) {
                var rotationRadians = rotation * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
                t.c = Math.sin(rotationRadians);
                t.d = Math.cos(rotationRadians);
                t.a = t.d;
                t.b = -t.c;
            }

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (scaleX < 0.000001 && scaleX > -0.000001) ? 0.000001 : scaleX,
                sy = (scaleY < 0.000001 && scaleY > -0.000001) ? 0.000001 : scaleY;

            // scale
            if (scaleX !== 1 || scaleY !== 1) {
                t.a *= sx;
                t.b *= sx;
                t.c *= sy;
                t.d *= sy;
            }

            this.transformDirty = false;
        }

        return this._transform;
    }

    getWorldTransform() {
        if (this.parent) {
            //@ts-ignore
            let _tempForm = new AffineTransform()
            AffineTransform.concat(_tempForm, this.parent.getWorldTransform(), this.getTransform());
            return _tempForm;
        }

        return this.getTransform();
    }

    updateTransform(parentTransformDirty) {
        if (this.transformDirty || parentTransformDirty) {
            var scaleX = this.flipX ? -this._scale.x : this._scale.x;
            var scaleY = this.flipY ? -this._scale.y : this._scale.y;
            var positionX = this._position.x;
            var positionY = this._position.y;
            var rotation = this._rotation;

            var t = this._transform;
            t.tx = positionX;
            t.ty = positionY;
            t.a = t.d = 1;
            t.b = t.c = 0;

            // rotation Cos and Sin
            if (rotation) {
                var rotationRadians = rotation * 0.017453292519943295;  //0.017453292519943295 = (Math.PI / 180);   for performance
                t.c = Math.sin(rotationRadians);
                t.d = Math.cos(rotationRadians);
                t.a = t.d;
                t.b = -t.c;
            }

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (scaleX < 0.000001 && scaleX > -0.000001) ? 0.000001 : scaleX,
                sy = (scaleY < 0.000001 && scaleY > -0.000001) ? 0.000001 : scaleY;

            // scale
            if (scaleX !== 1 || scaleY !== 1) {
                t.a *= sx;
                t.b *= sx;
                t.c *= sy;
                t.d *= sy;
            }
        }

        if (this.parent) {
            let _tempForm = new AffineTransform()
            AffineTransform.concat(new AffineTransform(), this.parent._worldTransform, this._transform);
            this._worldTransform = _tempForm;
        }
        else {
            this._worldTransform = this._transform;
        }

        var children = this.children;
        if (children) {
            for (var i = 0, ii = children.length; i < ii; i++) {
                var child = children[i];
                child.updateTransform(parentTransformDirty || this.transformDirty);
            }
        }

        this.transformDirty = false;
    }
    onLoad() {
        this.init(null);
        if (!this.ctx) {
            let _gNode = new Node();
            this.ctx = _gNode.addComponent(Graphics);
            this.node.addChild(_gNode);
        }
    }

    init(parent) {
        this.children = [];

        if (parent) {
            this.parent = parent;
            this.ctx = parent.ctx;
        }

        this.showBoundingBox = false;
    }

    addPath() {
        var path = new RPath();
        path.init(this);

        this.children.push(path);
        this._dirty = true;

        return path;
    }

    addGroup() {
        var group = new RGroup();
        group.init(this);

        this.children.push(group);
        this._dirty = true;

        return group;
    }

    getWorldBbox() {
        let rect;
        var children = this.children;
        let _tempRect = new Rect();
        for (var i = 0, ii = children.length; i < ii; i++) {
            var bbox = children[i].getWorldBbox();

            if (bbox.width !== 0 && bbox.height !== 0) {
                if (!rect) {
                    rect = children[i].getWorldBbox();
                }
                else {
                    rect = rect.rectUnion(rect, children[i].getWorldBbox());
                }
            }
        }

        return rect || new Rect();
    }

    // called every frame, uncomment this function to activate update callback
    update(dt) {

        if (!this._dirty) return;

        if (!this.parent) {
            this.ctx.clear();
        }

        var children = this.children;
        for (var i = 0, ii = children.length; i < ii; i++) {
            var child = children[i];
            child._dirty = true;
            child.update(dt);
        }

        if (this.showBoundingBox) {
            var bbox = this.getWorldBbox();
            this.ctx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
            this.ctx.stroke();
        }

        this._dirty = false;
    }


    //style
    public getStyled(type) {
        var value = this['_' + type];

        if (value === 'inherit' || value === undefined) {
            if (this.parent) value = this.parent.getStyled(type);
            else value = this[type];
        }

        return value;
    }

    public getStyledColor(type) {
        var value = this.getStyled(type);

        if (value === 'none' || !value) {
            value = null;
        }
        else if (typeof value === 'string') {
            value = new Color().fromHEX(value);
        }

        return value;
    }

    _applyStyle() {
        let ctx = this.ctx;
        ctx.lineWidth = this.getStyled('lineWidth');
        ctx.lineJoin = this.getStyled('lineJoin');
        ctx.lineCap = this.getStyled('lineCap');

        let strokeColor = this.getStyledColor('strokeColor');
        let fillColor = this.getStyledColor('fillColor');

        if (strokeColor)
            ctx.strokeColor = strokeColor;
        if (fillColor)
            ctx.fillColor = fillColor;
    }

    //svg
    loadSvg(string){
        if (typeof string.text !== "string") {
            return;
        }

        var $;
        try {
            $ = window.cheerio.load(string.text);
        }
        catch (err) {
            error(err.toString());
            return;
        }

        var svg = $('svg')[0];
        parseNode(svg, this);

        this.flipY = true;
    }
}


