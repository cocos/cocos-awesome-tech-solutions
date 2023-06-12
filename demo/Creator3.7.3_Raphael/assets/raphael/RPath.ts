
import { _decorator, Component, Node, Graphics, Color, AffineTransform, v2, Vec2, Rect } from 'cc';
const { ccclass, property } = _decorator;
import tesselateBezier from "./utils/R.tesselateBezier";
import { path2absolute, path2curve } from "./utils/R.curve";
import drawDashPoints from "./utils/R.dash";
import GlobalUtils from './GlobalUtils';
let drawer = {
    M: 'moveTo',
    L: 'lineTo',
    C: 'bezierCurveTo',
    Z: 'close',
};

let sqrt = Math.sqrt;
let max = Math.max;
let abs = Math.abs;
let EPSILON = 1e-12;
let TOLERANCE = 1e-6;
let LineJoin = Graphics.LineJoin;
let LineCap = Graphics.LineCap;
let selectedColor = new Color(0, 157, 236);

@ccclass('RPath')
export class RPath extends Component {
    private _pointArray = [];
    public get pointArray() {
        return this._pointArray;
    }
    public set pointArray(value) {
        this._pointArray = value;
    }
    private _parent = null;
    public get parent() {
        return this._parent;
    }
    public set parent(value) {
        this._parent = value;
    }
    private _commands = [];
    public get commands() {
        return this._commands;
    }
    public set commands(value) {
        this._commands = value;
    }
    private _dirty = false;
    public get dirty() {
        return this._dirty;
    }
    public set dirty(value) {
        this._dirty = value;
    }
    private _showHandles = false;
    public get showHandles() {
        return this._showHandles;
    }
    public set showHandles(value) {
        this._showHandles = value;
    }
    private _showBoundingBox = false;
    public get showBoundingBox() {
        return this._showBoundingBox;
    }
    public set showBoundingBox(value) {
        this._showBoundingBox = value;
    }
    private _ctx = null;
    public get ctx() {
        return this._ctx;
    }
    public set ctx(value) {
        this._ctx = value;
    }
    private _error = null;
    public get error() {
        return this._error;
    }
    public set error(value) {
        this._error = value;
    }
    //R.style ->>>>>>>>>>>>>
    _lineWidth;
    public get lineWidth() {
        return this._lineWidth || 5;
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
    private _dashArray = [];
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
    //R.style ->>>>>>>>>>>>>

    //R.transform ->>>>>>>>>>>>>>
    _transform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    _worldTransform: AffineTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    private _transformDirty = true;
    public get transformDirty() {
        return this._transformDirty;
    }
    public set transformDirty(value) {
        if (this.transformDirty) {
            if (this.parent) {
                this.parent.transformDirty = true;
            }

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
    private _flipX: false;
    public get flipX(): false {
        return this._flipX;
    }
    public set flipX(value: false) {
        if (this._flipX === value) {
            return;
        }
        this._flipX = value;
        this.transformDirty = true;
    }
    private _flipY: false;
    public get flipY(): false {
        return this._flipY;
    }
    public set flipY(value: false) {
        if (this._flipY === value) {
            return;
        }
        this._flipY = value;
        this.transformDirty = true;
    }
    //R.transform ->>>>>>>>>>>>>>>>>>

    //R.animate ->>>>>>>>>>>>>>>>>
    private _time = 0;
    public get time() {
        return this._time;
    }
    public set time(value) {
        this._time = value;
    }
    private _duration = 0;
    public get duration() {
        return this._duration;
    }
    public set duration(value) {
        this._duration = value;
    }

    private _animateDiff = null;
    public get animateDiff() {
        return this._animateDiff;
    }
    public set animateDiff(value) {
        this._animateDiff = value;
    }

    private _animating = null;
    public get animating() {
        return this._animating;
    }
    public set animating(value) {
        this._animating = value;
    }

    private _fromPath = null;
    public get fromPath() {
        return this._fromPath;
    }
    public set fromPath(value) {
        this._fromPath = value;
    }
    private _toPath = null;
    public get toPath() {
        return this._toPath;
    }
    public set toPath(value) {
        this._toPath = value;
    }
    //R.animate ->>>>>>>>>>>>>>>>>
    animateFunc(pathString, pathString2, duration, animating) {
        var pathes = path2curve.prototype.path2curveFunc(pathString, pathString2),
            fromPath = pathes[0],
            toPath = pathes[1];

        var diff = [];
        for (var i = 0, ii = fromPath.length; i < ii; i++) {
            diff[i] = [0];
            for (var j = 1, jj = fromPath[i].length; j < jj; j++) {
                diff[i][j] = (toPath[i][j] - fromPath[i][j]) / duration;
            }
        }

        this._time = 0;
        this._duration = duration;

        this._animateDiff = diff;
        this._animating = typeof animating === 'undefined' ? true : animating;

        this._fromPath = fromPath;
        this._toPath = toPath;

        return diff;
    }

    _stepAnimate(time) {
        var diff = this._animateDiff;
        var duration = this._duration;
        var fromPath = this._fromPath;

        var pos = time / duration;

        if (pos > 1) pos = 1;

        var now = [];
        for (var i = 0, ii = fromPath.length; i < ii; i++) {
            now[i] = [fromPath[i][0]];
            for (var j = 1, jj = fromPath[i].length; j < jj; j++) {
                now[i][j] = +fromPath[i][j] + pos * duration * diff[i][j];
            }
        }

        this._dirty = true;
        this._commands = now;

        if (pos >= 1) {
            this._animating = false;
            this._fromPath = null;
            this._toPath = null;
        }
    }

    _updateAnimate(dt) {
        if (this._animating) {
            this._time += dt;
            this._stepAnimate(this._time);
        }
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
        let _tempVec2 = new Vec2();
        for (var i = 0, ii = cmd.length / 2; i < ii; i++) {
            var j = i * 2;
            tempPoint.x = cmd[j];
            tempPoint.y = cmd[j + 1];

            AffineTransform.transformVec2(_tempVec2, tempPoint, t);

            cmd[j] = _tempVec2.x;
            cmd[j + 1] = _tempVec2.y;
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
    init(parent) {
        if (parent) {
            this.parent = parent;
            this.ctx = parent.ctx;
        }
        this._commands = [];
        this._dirty = true;
        this.showHandles = false;
        this.showBoundingBox = false;
    }
    onLoad() {
        this.init(null);
        if (!this.ctx) {
            let _gNode = new Node();
            this.ctx = _gNode.addComponent(Graphics);
            this.node.addChild(_gNode);
            this._applyStyle();
        }
    }
    ellipse(cx, cy, rx, ry) {
        if (!ry) {
            ry = rx;
        }
        let cmds = this._commands;
        cmds.push(['M', cx, cy]);
        cmds.push(['m', 0, -ry]);
        cmds.push(['a', rx, ry, 0, 1, 1, 0, 2 * ry]);
        cmds.push(['a', rx, ry, 0, 1, 1, 0, -2 * ry]);
    }
    circle(cx, cy, r) {
        this.ellipse(cx, cy, r,null);
    }
    rect(x, y, w, h, r) {
        let cmds = this._commands;
        if (r) {
            cmds.push(['M', x + r, y]);
            cmds.push(['l', w - r * 2, 0]);
            cmds.push(['a', r, r, 0, 0, 1, r, r]);
            cmds.push(['l', 0, h - r * 2]);
            cmds.push(['a', r, r, 0, 0, 1, -r, r]);
            cmds.push(['l', r * 2 - w, 0]);
            cmds.push(['a', r, r, 0, 0, 1, -r, -r]);
            cmds.push(['l', 0, r * 2 - h]);
            cmds.push(['a', r, r, 0, 0, 1, r, -r]);
        }
        else {
            cmds.push(['M', x, y]);
            cmds.push(['l', w, 0]);
            cmds.push(['l', 0, h]);
            cmds.push(['l', -w, 0]);
        }
        cmds.push(['z']);
    }
    close() {
        this._commands.push(['Z']);
    }
    points(points, closed) {
        if (points.length <= 1) {
            return;
        }
        this.clear();
        let lastPoint = points[0];
        this.M(lastPoint.x, lastPoint.y);
        for (let i = 1, ii = points.length; i < ii; i++) {
            let point = points[i];
            this.C(lastPoint.x, lastPoint.y, point.x, point.y, point.x, point.y);
            lastPoint = point;
        }
        if (closed) {
            this.C(lastPoint.x, lastPoint.y, points[0].x, points[0].y, points[0].x, points[0].y);
        }
        this.makePath();
    }
    makePath() {
        // console.log(this._commands, ' this._commands')
        this._commands = path2curve.prototype.path2curveFunc(this._commands, null);
        this._dirty = true;
    }
    path(path) {
        this._commands = path2curve.prototype.path2curveFunc(path, null);
        this._dirty = true;
    }
    clear() {
        this._commands.length = 0;
    }
    getPathString() {
        let commands = this._commands;
        let string = [];
        for (let i = 0, ii = commands.length; i < ii; i++) {
            string[i] = commands[i].join(' ');
        }
        string = string.join(' ');
        return string;
    }
    getTotalLength() {
        if (this._commands.totalLength === undefined) {
            this._analysis();
        }
        return this._commands.totalLength;
    }
    getBbox() {
        if (this._commands.bbox === undefined) {
            this._analysis();
        }
        return this._commands.bbox;
    }
    getWorldBbox() {
        if (this._commands.worldBbox === undefined || this.transformDirty) {
            this._analysis();
        }
        return this._commands.worldBbox;
    }
    center(x, y) {
        x = x || 0;
        y = y || 0;
        let bbox = this.getBbox();
        this.position = this.position.add(v2(-bbox.width / 2 - bbox.x + x, -bbox.height / 2 - bbox.y + y));
    }
    _curves() {
        let cmds = this._commands;
        if (cmds.curves) return cmds.curves;
        let curves = [];
        let subCurves;
        let x, y;
        for (let i = 0, ii = cmds.length; i < ii; i++) {
            let cmd = cmds[i];
            let c = cmd[0];
            if (c === 'M') {
                subCurves = [];
                curves.push(subCurves);
                x = cmd[1];
                y = cmd[2];
            }
            else if (c === 'C' && x !== undefined && y !== undefined) {
                subCurves.push([x, y, cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], cmd[6]]);
                x = cmd[5];
                y = cmd[6];
            }
        }
        cmds.curves = curves;
        return curves;
    }
    _analysis() {
        let cmds = this._commands;
        if (cmds.points) {
            return;
        }
        let curves = this._curves();
        let points = [];
        let x, y;
        let subPoints;
        let tessTolSclae = 1 / max(abs(this.scale.x), abs(this.scale.y));
        for (var i = 0, ii = curves.length; i < ii; i++) {
            let subCurves = curves[i];
            subPoints = [];
            points.push(subPoints);
            for (var j = 0, jj = subCurves.length; j < jj; j++) {
                let curve = subCurves[j];
                tesselateBezier.prototype.tesselateBezierFunc(curve[0], curve[1], curve[2], curve[3], curve[4], curve[5], curve[6], curve[7], 0, subPoints, tessTolSclae);
            }
        }
        cmds.points = points;
        let totalLength = 0;
        let lastx, lasty;
        let dx, dy;
        let minx = 10e7, miny = 10e7,
            maxx = -10e7, maxy = -10e7;
        for (let i = 0, ii = points.length; i < ii; i++) {
            subPoints = points[i];
            for (let j = 0, jj = subPoints.length / 2; j < jj; j++) {
                x = subPoints[j * 2];
                y = subPoints[j * 2 + 1];
                if (x < minx) minx = x;
                if (x > maxx) maxx = x;
                if (y < miny) miny = y;
                if (y > maxy) maxy = y;
                if (j === 0) {
                    lastx = x;
                    lasty = y;
                }
                dx = x - lastx;
                dy = y - lasty;
                totalLength += sqrt(dx * dx + dy * dy);
                lastx = x;
                lasty = y;
            }
        }
        cmds.totalLength = totalLength;
        if (totalLength === 0) {
            cmds.bbox = cmds.worldBbox = this.rect();
        }
        else {
            let rect = new Rect(minx, miny, maxx - minx, maxy - miny);
            let _tempRect = new Rect();
            AffineTransform.transformRect(_tempRect, rect, this.getTransform());
            cmds.bbox = _tempRect;
            AffineTransform.transformRect(_tempRect, rect, this.getWorldTransform());
            cmds.worldBbox = _tempRect
        }
    }
    _drawCommands() {
        let commands = this._commands;
        let ctx = this.ctx;
        let t = this.getWorldTransform();
        for (let i = 0, ii = commands.length; i < ii; i++) {
            let cmd = commands[i];
            let c = cmd[0];
            cmd = this._transformCommand(cmd, t);
            let func = ctx[drawer[c]];
            if (func) func.apply(ctx, cmd);
        }
    }
    _drawHandles() {
        let ctx = this.ctx;
        let commands = this._commands;
        let prev;
        let size = 5;
        let half = size / 2;
        let originLineWidth = ctx.lineWidth;
        let originStrokeColor = ctx.strokeColor;
        let originFillColor = ctx.fillColor;
        ctx.lineWidth = 1;
        ctx.strokeColor = selectedColor;
        ctx.fillColor = selectedColor;
        let t = this.getWorldTransform();
        function drawHandle(x1, y1, x2, y2) {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.circle(x2, y2, half);
            ctx.fill();
        }
        for (let i = 0, ii = commands.length; i < ii; i++) {
            let cmd = commands[i];
            let c = cmd[0];
            cmd = this._transformCommand(cmd, t);
            if (c === 'M') {
                prev = cmd;
            }
            else if (c === 'C') {
                drawHandle(prev[0], prev[1], cmd[0], cmd[1]);
                drawHandle(cmd[4], cmd[5], cmd[2], cmd[3]);
                prev = [cmd[4], cmd[5]];
            }
            if (prev)
                ctx.fillRect(prev[0] - half, prev[1] - half, size, size);
        }
        ctx.lineWidth = originLineWidth;
        ctx.strokeColor = originStrokeColor;
        ctx.fillColor = originFillColor;
    }
    _drawDashPath() {
        let cmds = this._commands;
        let ctx = this.ctx;
        let dashArray = this.dashArray;
        let dashOffset = this.dashOffset;
        let points;
        if (!cmds.points) {
            this._analysis();
        }
        points = cmds.points;
        let t = this.getWorldTransform();
        for (let i = 0, ii = points.length; i < ii; i++) {
            let subPoints = points[i];
            drawDashPoints.prototype.drawDashPointsFunc(subPoints, ctx, dashArray, dashOffset, t);
        }
    }
    update(dt) {
        if (this._updateAnimate) {
            this._updateAnimate(dt);
        }
        if (this._commands.length === 0 || !this._dirty || (this.parent && !this.parent._dirty)) {
            return;
        }
        this._applyStyle();
        if (!this.parent) {
            this.ctx.clear();
        }
        if (this.dashArray.length > 0) {
            if (this.getStyledColor('fillColor')) {
                this._drawCommands();
                this.ctx.fill();
            }
            if (this.getStyledColor('strokeColor')) {
                this._drawDashPath();
                this.ctx.stroke();
            }
        }
        else {
            this._drawCommands();
            if (this.getStyledColor('fillColor')) this.ctx.fill();
            if (this.getStyledColor('strokeColor')) this.ctx.stroke();
        }
        if (this.showBoundingBox) {
            let bbox = this.getWorldBbox();
            this.ctx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
            this.ctx.stroke();
        }
        if (this.showHandles) this._drawHandles();
        this._dirty = false;
    }


    getStyled(type) {
        var value = this['_' + type];

        if (value === 'inherit' || value === undefined) {
            // console.log(this.parent, ' 11111')
            if (this.parent) value = this.parent.getStyled(type);
            else value = this[type];
        }

        return value;
    }

    getStyledColor(type) {
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
        // console.log(this.getStyled('lineWidth'),' this.getStyled()')
        // 默认是 1，看不清，固写死测试
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
    getDemoData() {
        return GlobalUtils.paths;
    }
    // R.smooth ->>>>>
    smoothFunc() {
        var knots = [];
        this._commands.forEach(function (cmd) {
            var c = cmd[0];

            if (c === 'M') {
                knots.push(new Vec2(cmd[1], cmd[2]));
            }
            else if (c === 'C') {
                knots.push(new Vec2(cmd[5], cmd[6]));
            }
        });

        var results = GlobalUtils.prototype.getCubicBezierCurvePath(knots);
        var firstControlPoints = results[0];
        var secondControlPoints = results[1];
        var commands = [];

        for (var i = 0, len = knots.length; i < len; i++) {
            if (i === 0) {
                commands.push(['M', knots[i].x, knots[i].y]);
            } else {
                var firstControlPoint = firstControlPoints[i - 1],
                    secondControlPoint = secondControlPoints[i - 1];

                commands.push([
                    'C',
                    firstControlPoint.x, firstControlPoint.y,
                    secondControlPoint.x, secondControlPoint.y,
                    knots[i].x, knots[i].y
                ]);
            }
        }

        this._commands = commands;
        this._dirty = true;
    }

    simplify() {
        this.commands = this.fit(this);
    }
    // R.simplify ->>>>>>
    fit(path, error) {
        this.commands = [];
        this.error = error || 10;

        let points = this.pointArray = [];
        path._commands.forEach(function (cmd) {
            let c = cmd[0];

            if (c === 'M') {
                points.push(new Vec2(cmd[1], cmd[2]));
            }
            else if (c === 'C') {
                points.push(new Vec2(cmd[5], cmd[6]));
            }
        });


        let length = points.length;

        if (length > 1) {
            this.fitCubic(0, length - 1,
                // Left Tangent
                points[1].sub(points[0]).normalize(),
                // Right Tangent
                points[length - 2].sub(points[length - 1]).normalize());
        }

        return this.commands;
    }

    // Fit a Bezier curve to a (sub)set of digitized points
    fitCubic(first, last, tan1, tan2) {
        //  Use heuristic if region only has two points in it
        if (last - first === 1) {
            let pt1 = this.pointArray[first],
                pt2 = this.pointArray[last],
                dist = pt1.sub(pt2).mag() / 3;
            this.addCurve([pt1, pt1.add(tan1.normalize().mulSelf(dist)),
                pt2.add(tan2.normalize().mulSelf(dist)), pt2]);
            return;
        }
        // Parameterize points, and attempt to fit curve
        let uPrime = this.chordLengthParameterize(first, last),
            maxError = Math.max(this.error, this.error * this.error),
            split,
            parametersInOrder = true;
        // Try 4 iterations
        for (let i = 0; i <= 4; i++) {
            let curve = this.generateBezier(first, last, uPrime, tan1, tan2);
            //  Find max deviation of points to fitted curve
            let max = this.findMaxError(first, last, curve, uPrime);
            if (max.error < this.error && parametersInOrder) {
                this.addCurve(curve);
                return;
            }
            split = max.index;
            // If error not too large, try reparameterization and iteration
            if (max.error >= maxError)
                break;
            parametersInOrder = this.reparameterize(first, last, uPrime, curve);
            maxError = max.error;
        }
        // Fitting failed -- split at max error point and fit recursively
        let V1 = this.pointArray[split - 1].sub(this.pointArray[split]),
            V2 = this.pointArray[split].sub(this.pointArray[split + 1]),
            tanCenter = V1.add(V2).div(2).normalize();
        this.fitCubic(first, split, tan1, tanCenter);
        this.fitCubic(split, last, tanCenter.mul(-1), tan2);
    }

    addCurve(curve) {
        if (this.commands.length === 0) {
            this.commands.push(['M', curve[0].x, curve[0].y]);
        }
        else {
            let cmd = this.commands[this.commands.length - 1];
            cmd[5] = curve[0].x;
            cmd[6] = curve[0].y;
        }

        this.commands.push(['C', curve[1].x, curve[1].y, curve[2].x, curve[2].y, curve[3].x, curve[3].y]);
    }

    // Use least-squares method to find Bezier control points for region.
    generateBezier(first, last, uPrime, tan1, tan2) {
        let epsilon = /*#=*/EPSILON,
            pt1 = this.pointArray[first],
            pt2 = this.pointArray[last],
            // Create the C and X matrices
            C = [[0, 0], [0, 0]],
            X = [0, 0];

        for (let i = 0, l = last - first + 1; i < l; i++) {
            let u = uPrime[i],
                t = 1 - u,
                b = 3 * u * t,
                b0 = t * t * t,
                b1 = b * t,
                b2 = b * u,
                b3 = u * u * u,
                a1 = tan1.normalize().mulSelf(b1),
                a2 = tan2.normalize().mulSelf(b2),
                tmp = this.pointArray[first + i]
                    .sub(pt1.mul(b0 + b1))
                    .sub(pt2.mul(b2 + b3));
            C[0][0] += a1.dot(a1);
            C[0][1] += a1.dot(a2);
            // C[1][0] += a1.dot(a2);
            C[1][0] = C[0][1];
            C[1][1] += a2.dot(a2);
            X[0] += a1.dot(tmp);
            X[1] += a2.dot(tmp);
        }

        // Compute the determinants of C and X
        let detC0C1 = C[0][0] * C[1][1] - C[1][0] * C[0][1],
            alpha1, alpha2;
        if (Math.abs(detC0C1) > epsilon) {
            // Kramer's rule
            let detC0X = C[0][0] * X[1] - C[1][0] * X[0],
                detXC1 = X[0] * C[1][1] - X[1] * C[0][1];
            // Derive alpha values
            alpha1 = detXC1 / detC0C1;
            alpha2 = detC0X / detC0C1;
        } else {
            // Matrix is under-determined, try assuming alpha1 == alpha2
            let c0 = C[0][0] + C[0][1],
                c1 = C[1][0] + C[1][1];
            if (Math.abs(c0) > epsilon) {
                alpha1 = alpha2 = X[0] / c0;
            } else if (Math.abs(c1) > epsilon) {
                alpha1 = alpha2 = X[1] / c1;
            } else {
                // Handle below
                alpha1 = alpha2 = 0;
            }
        }

        // If alpha negative, use the Wu/Barsky heuristic (see text)
        // (if alpha is 0, you get coincident control points that lead to
        // divide by zero in any subsequent NewtonRaphsonRootFind() call.
        let segLength = pt2.sub(pt1).mag(),
            eps = epsilon * segLength,
            handle1,
            handle2;
        if (alpha1 < eps || alpha2 < eps) {
            // fall back on standard (probably inaccurate) formula,
            // and subdivide further if needed.
            alpha1 = alpha2 = segLength / 3;
        } else {
            // Check if the found control points are in the right order when
            // projected onto the line through pt1 and pt2.
            let line = pt2.sub(pt1);
            // Control points 1 and 2 are positioned an alpha distance out
            // on the tangent vectors, left and right, respectively
            handle1 = tan1.normalize().mulSelf(alpha1);
            handle2 = tan2.normalize().mulSelf(alpha2);
            if (handle1.dot(line) - handle2.dot(line) > segLength * segLength) {
                // Fall back to the Wu/Barsky heuristic above.
                alpha1 = alpha2 = segLength / 3;
                handle1 = handle2 = null; // Force recalculation
            }
        }

        // First and last control points of the Bezier curve are
        // positioned exactly at the first and last data points
        return [pt1, pt1.add(handle1 || tan1.normalize().mulSelf(alpha1)),
            pt2.add(handle2 || tan2.normalize().mulSelf(alpha2)), pt2];
    }

    // Given set of points and their parameterization, try to find
    // a better parameterization.
    reparameterize(first, last, u, curve) {
        for (let i = first; i <= last; i++) {
            u[i - first] = this.findRoot(curve, this.pointArray[i], u[i - first]);
        }
        // Detect if the new parameterization has reordered the points.
        // In that case, we would fit the points of the path in the wrong order.
        for (let i = 1, l = u.length; i < l; i++) {
            if (u[i] <= u[i - 1])
                return false;
        }
        return true;
    }

    // Use Newton-Raphson iteration to find better root.
    findRoot(curve, point, u) {
        let curve1 = [],
            curve2 = [];
        // Generate control vertices for Q'
        for (let i = 0; i <= 2; i++) {
            curve1[i] = curve[i + 1].sub(curve[i]).mul(3);
        }
        // Generate control vertices for Q''
        for (let i = 0; i <= 1; i++) {
            curve2[i] = curve1[i + 1].sub(curve1[i]).mul(2);
        }
        // Compute Q(u), Q'(u) and Q''(u)
        let pt = this.evaluate(3, curve, u),
            pt1 = this.evaluate(2, curve1, u),
            pt2 = this.evaluate(1, curve2, u),
            diff = pt.sub(point),
            df = pt1.dot(pt1) + diff.dot(pt2);
        // Compute f(u) / f'(u)
        if (Math.abs(df) < /*#=*/TOLERANCE)
            return u;
        // u = u - f(u) / f'(u)
        return u - diff.dot(pt1) / df;
    }

    // Evaluate a bezier curve at a particular parameter value
    evaluate(degree, curve, t) {
        // Copy array
        let tmp = curve.slice();
        // Triangle computation
        for (let i = 1; i <= degree; i++) {
            for (let j = 0; j <= degree - i; j++) {
                tmp[j] = tmp[j].mul(1 - t).add(tmp[j + 1].mul(t));
            }
        }
        return tmp[0];
    }

    // Assign parameter values to digitized points
    // using relative distances between points.
    chordLengthParameterize(first, last) {
        let u = [0];
        for (let i = first + 1; i <= last; i++) {
            u[i - first] = u[i - first - 1]
                + this.pointArray[i].sub(this.pointArray[i - 1]).mag();
        }
        for (let i = 1, m = last - first; i <= m; i++) {
            u[i] /= u[m];
        }
        return u;
    }

    // Find the maximum squared distance of digitized points to fitted curve.
    findMaxError(first, last, curve, u) {
        let index = Math.floor((last - first + 1) / 2),
            maxDist = 0;
        for (let i = first + 1; i < last; i++) {
            let P = this.evaluate(3, curve, u[i - first]);
            let v = P.sub(this.pointArray[i]);
            let dist = v.x * v.x + v.y * v.y; // squared
            if (dist >= maxDist) {
                maxDist = dist;
                index = i;
            }
        }
        return {
            error: maxDist,
            index: index
        };
    }
}
['M', 'm', 'L', 'l', 'H', 'h', 'V', 'v', 'C', 'c', 'S', 's', 'Q', 'q', 'T', 't', 'A', 'a', 'Z', 'z'].forEach(function (cmd) {
    RPath.prototype[cmd] = function () {
        var cmds = [cmd];
        for (var i = 0, l = arguments.length; i < l; i++) {
            cmds[i + 1] = arguments[i];
        }
        this._commands.push(cmds);
    };
});


