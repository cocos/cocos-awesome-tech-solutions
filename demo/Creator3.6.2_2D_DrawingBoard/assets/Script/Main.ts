import { _decorator, Component, Node, Vec2, Color, UITransform, EventTouch,
    Texture2D, Sprite, SpriteFrame, log, ImageAsset, Prefab, instantiate,
    screen, Size, Material, Vec4, Layout, ScrollView  } from 'cc';
import DrawHelper from './DrawHelper';
const { ccclass, property } = _decorator;

import DrawingBoard from "./DrawingBoard";
import DrawingBoardExt from './DrawingBoardExt';
import { SliderEx } from './SliderEx';
enum GameState {
    drawing = 1,
    erasing = 2,
}

// http://www.yini.org/liuyan/rgbcolor.htm
const colorFromArray = [
    [102, 204, 204, 255], [204, 255, 102, 255], [255, 153, 204, 255],
    [255, 153, 153, 255], [255, 255, 255, 255], [255, 204, 153, 255],
    [153, 204, 51, 255], [255, 102, 102, 255], [255, 255, 102, 255],
    [153, 204, 102, 255], [102, 102, 153, 255], [255, 255, 204, 255]
];
const ColorToArray = [
    [102, 204, 204, 255], [204, 255, 102, 255], [255, 153, 204, 255],
    [255, 153, 153, 255], [255, 255, 255, 255], [255, 204, 153, 255],
    [153, 204, 51, 255], [255, 102, 102, 255], [255, 255, 102, 255],
    [153, 204, 102, 255], [102, 102, 153, 255], [255, 255, 204, 255]
]

@ccclass('Main')
export default class Main extends Component {
    @property(Node)
    drawBoard: Node | null = null;
    @property(Node)
    drawNode: Node | null = null;
    @property({type: Material, tooltip: '渐变色材质'})
    drawMaterial: Material | null = null;
    @property({type: Material, tooltip: '橡皮擦材质'})
    eraseMaterial: Material | null = null;
    @property({type: Material, tooltip: '普通画笔材质'})
    normalMaterial: Material | null = null;
    @property(Node)
    uiNode : Node | null = null;

    // 修改笔触大小 & 橡皮擦大小 & 笔触颜色
    @property(Node)
    eraseNode: Node | null = null;
    @property(Node)
    penNode: Node | null = null;

    panel1 : Node | null = null;
    panel2 : Node | null = null;
    // 选项弹窗面板挂载 的父节点
    expandNode: Node | null = null;
    // 选项弹窗面板外阻止触摸响应的节点
    expandBlockNode: Node | null = null;
    // 画布选项节点
    wallpageNode: Node | null = null;
    // 渐变色起始颜色选项节点
    gradientColorFromNode: Node | null = null;
    // 渐变色终止颜色选项节点
    gradientColorToNode: Node | null = null;

    private db: DrawingBoard = null;
    private gameState: GameState = GameState.drawing;
    private imageAsset: ImageAsset | null = null;
    private texture2d: Texture2D | null = null;
    private prePos: Vec2 = Vec2.ZERO;
    private lastColor: Color = new Color(102, 204, 204, 255);
    private toColor: Color = new Color(255, 255, 255, 255);
    private lastDrawLineWidth: number = 20;
    private lastEraseLineWidth: number = 20;
    private history: any[] = [];
    private viewContentSize: Size = screen.windowSize;

    private dbExt: DrawingBoardExt = null;

    // 渐变色开关
    private isOpenGradientColor : boolean = false;
    

    start() {
        this.panel1 = this.uiNode.getChildByName('panel1');
        this.panel2 = this.uiNode.getChildByName('panel2').getComponent(ScrollView)!.content;
        this.expandNode = this.uiNode.getChildByName('expandNode');
        this.expandBlockNode = this.expandNode.getChildByName('expandBlock');
        this.wallpageNode = this.panel2.getChildByName('wallpage');
        this.gradientColorFromNode = this.panel2.getChildByName('GradientColorFrom');
        this.gradientColorToNode = this.panel2.getChildByName('GradientColorTo');

        this.initDb();
        this.initTexture();

        this.drawNode.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.drawNode.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.drawNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.drawNode.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    
    initDb() {
        // 创建一个画板(需传入画板尺寸，将自动初始化)
        this.db = new DrawingBoard(this.drawNode.getComponent(UITransform).width, this.drawNode.getComponent(UITransform).height);
        
        // 设置画板的绘图颜色（每次绘制前都可以重新设置
        this.db.setLineWidth(this.lastDrawLineWidth);
        this.db.setColor(this.lastColor.r, this.lastColor.g, this.lastColor.b, this.lastColor.a);

        if (this.isOpenGradientColor) {
            let mat = this.drawNode.getComponent(Sprite)!.getMaterial(0)!;
            mat.setProperty('toColor', this.toColor);
        }
        // 线条端点以圆角结尾
        this.db.setLineCircleEnd(true);

        this.updatePenColor();

        this.dbExt = new DrawingBoardExt(this.drawNode.getComponent(UITransform).width, this.drawNode.getComponent(UITransform).height);
    }

    initTexture() {
        // 存储 Uint8Array 数据，存入 imageAsset, 然后通过 texture2D.image = imageAsset创建texture2D, 
        // 之后把texture2d 赋值给Sprite渲染。
        this.imageAsset = new ImageAsset();
        this.imageAsset.reset({
            width : this.drawNode.getComponent(UITransform).width,
            height : this.drawNode.getComponent(UITransform).height,
            close : null
        });

        this.texture2d = new Texture2D();
        this.texture2d.reset({
            width : this.imageAsset.width,
            height : this.imageAsset.height,
            format : Texture2D.PixelFormat.RGBA8888
        });
        this.texture2d.image = this.imageAsset;
        
        let spf: SpriteFrame = new SpriteFrame();
        spf.texture = this.texture2d;
        this.drawNode.getComponent(Sprite).spriteFrame = spf;
    }

    onTouchStart(e: EventTouch) {
        // 将触摸位置作为线条的起点
        // 画板中使用的坐标系，与图片坐标系一样，原点在左上角，X轴向右为正，Y轴向下为正
        let pos = e.getUILocation();
        this.prePos = DrawHelper.convertToDrawNodePos(this.drawNode, pos);
        this.db.moveTo(this.prePos.x, this.prePos.y);
        this.dbExt.setUVDataByPos(this.prePos.x, this.prePos.y);

        if (this.gameState == GameState.drawing) {
            // 在ios上位置显示异常，暂时屏蔽
            if (!this.eraseNode.active) {
                // this.penNode.active = true;
            }
            if (this.eraseNode.active) {
                this.eraseNode.active = false;
            }
        } else if (this.gameState == GameState.erasing) {
            // 在ios上位置显示异常，暂时屏蔽
            if (!this.eraseNode.active) {
                // this.eraseNode.active = true;
            }
            if (this.penNode.active) this.penNode.active = false;
        } 
    }

    onTouchMove(e: EventTouch) {
        let pos = e.getUILocation();
        this.prePos = DrawHelper.convertToDrawNodePos(this.drawNode, pos);
        this.dbExt.setUVDataByPos(this.prePos.x, this.prePos.y);

        if (this.gameState == GameState.drawing) {
            // 从上一次绘制线条后的终点开始向鼠标当前位置绘制线条
            this.db.lineTo(this.prePos.x, this.prePos.y);

            let posX = pos.x - this.viewContentSize.width / 2;
            let posY = pos.y - this.viewContentSize.height / 2 - 42;
            this.penNode.setPosition(posX, posY);
        } else if (this.gameState == GameState.erasing) {
            // 橡皮擦
            this.db.circle(this.prePos.x, this.prePos.y, this.lastEraseLineWidth);

            let posX = pos.x - this.viewContentSize.width / 2;
            let posY = pos.y - this.viewContentSize.height / 2 - 42;
            this.eraseNode.setPosition(posX, posY);
        }

        // 每次画板中的数据有变化后，及时将数据应用到贴图上，在屏幕上显示出来
        this.drawToImg();
    }

    onTouchEnd(e: EventTouch) {
        this.addHistory();
        this.dbExt.recordUVData();
    }

    addHistory() {
        let copy = this.db.copyData();
        let ucopy = new Uint8Array(copy);
        this.history.push({ data: ucopy });
        log('历史步骤: ', this.history.length);
    }

    drawToImg() {
        // 获取画板中绘制的图案数据, 传递给贴图对象
        let data: Uint8Array = this.db.getData();
        this.texture2d.uploadData(data);
    }

    onBtnDraw() {
        if (this.db) {
            this.db.setLineWidth(this.lastDrawLineWidth);
            this.db.setColor(this.lastColor.r, this.lastColor.g, this.lastColor.b, this.lastColor.a);
            this.updatePenColor();
            if (this.isOpenGradientColor) {
                let mat = this.drawNode.getComponent(Sprite)!.getMaterial(0)!;
                mat.setProperty('toColor', this.toColor);
            }
        }
        
        this.gameState = GameState.drawing;
    }

    onBtnErase() {
        if (this.db) {
            this.db.setLineWidth(this.lastEraseLineWidth);
            // 橡皮擦的颜色不能是(0,0,0,0),因为这样会和DrawingBoard里的默认颜色相同导致绘制跳过
            this.db.setColor(0.001, 0, 0, 0);

            this.drawNode.getComponent(Sprite)!.setMaterial(this.eraseMaterial, 0)!;
        }

        this.gameState = GameState.erasing;
    }

    onBtnClear() {
        this.db.reset();
        this.drawToImg();
        this.history.splice(0, this.history.length);
    }

    onBtnRevoke() {
        this.history.pop();
        if (this.history.length) {
            let data: Uint8Array = this.history[this.history.length - 1].data;
            this.db.setData(data.buffer);
            this.texture2d.uploadData(data);
        } else {
            this.onBtnClear();
        }
        log('历史记录剩余: ', this.history.length);
    }

    // 切换画布
    onBtnWallpage () {
        // 清理
        this.hideExpandChild();
        if (!this.expandBlockNode.active) this.expandBlockNode.active = true;

        if (this.expandNode && this.expandNode.getChildByName('Page')) {
            this.expandNode.getChildByName('Page').active = true;
        } else {
            DrawHelper.loadRes('res', 'Page', Prefab, (prefab: Prefab) => {
                let p = instantiate(prefab);
                p.parent = this.expandNode;

                // 注册 事件
                let node = p.getChildByName('Node');
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    DrawHelper.addButtonEvent(child, this.node, 'Main', 'onWallpageClick', (i+1).toString());
                }
            });
        }
    }

    onWallpageClick (evt: any, pageIndex: string) {
        DrawHelper.loadRes('res', `page${pageIndex}/spriteFrame`, SpriteFrame, (spf: SpriteFrame)=>{
            // 替换画板
            this.drawBoard.getComponent(Sprite).spriteFrame = spf;
            // 替换壁纸选项
            this.wallpageNode.getComponent(Sprite).spriteFrame = spf;
            // 隐藏壁纸选项面板
            this.expandNode.getChildByName('Page').active = false;
            // 关闭面板外触摸响应
            this.expandBlockNode.active = false;
        });
    }

    // 调整橡皮擦大小
    onBtnEraseSizeAdjust () {
        // 清理
        this.hideExpandChild();
        if (!this.expandBlockNode.active) this.expandBlockNode.active = true;

        if (this.expandNode && this.expandNode.getChildByName('Erase')) {
            this.expandNode.getChildByName('Erase').active = true;
        } else {
            DrawHelper.loadRes('res', 'Erase', Prefab, (prefab: Prefab) => {
                let p = instantiate(prefab);
                p.parent = this.expandNode;
            });
        }
    }

    // 调整画笔大小
    onBtnDrawSizeAdjust () {
        // 清理
        this.hideExpandChild();
        if (!this.expandBlockNode.active) this.expandBlockNode.active = true;

        if (this.expandNode && this.expandNode.getChildByName('Pen')) {
            this.expandNode.getChildByName('Pen').active = true;
        } else {
            DrawHelper.loadRes('res', 'Pen', Prefab, (prefab: Prefab) => {
                let p = instantiate(prefab);
                p.parent = this.expandNode;
            });
        }
    }

    // 调整渐变色画笔颜色
    onBtnGradientColorFromAdjust () {
        // 清理
        this.hideExpandChild();
        if (!this.expandBlockNode.active) this.expandBlockNode.active = true;

        if (this.expandNode && this.expandNode.getChildByName('GradientColorFrom')) {
            this.expandNode.getChildByName('GradientColorFrom').active = true;
        } else {
            DrawHelper.loadRes('res', 'GradientColor', Prefab, (prefab: Prefab) => {
                let p = instantiate(prefab);
                p.parent = this.expandNode;
                p.name = "GradientColorFrom";

                // 注册 事件
                let node = p.getChildByName('Node');
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    let r = colorFromArray[i][0];
                    let g = colorFromArray[i][1];
                    let b = colorFromArray[i][2];
                    let a = colorFromArray[i][3];
                    child.getComponent(Sprite)!.color = new Color(r, g, b, a);
                    DrawHelper.addButtonEvent(child, this.node, 'Main', 'onGradientColorFromClick', colorFromArray[i]);
                }
            });
        }
    }

    onGradientColorFromClick (evt: any, colors: number[]) {
        let r = colors[0];
        let g = colors[1];
        let b = colors[2];
        let a = colors[3];
        let newColor = new Color(r, g, b, a);
        this.gradientColorFromNode.getComponent(Sprite)!.color = newColor;
        this.lastColor = newColor;
        if (this.db) {
            this.db.setColor(r, g, b, a);
        }
        // 隐藏颜色选项面板
        this.expandNode.getChildByName('GradientColorFrom').active = false;
        // 关闭面板外触摸响应
        this.expandBlockNode.active = false;
    }

    // 调整渐变色画笔颜色
    onBtnGradientColorToAdjust () {
        // 清理
        this.hideExpandChild();
        if (!this.expandBlockNode.active) this.expandBlockNode.active = true;

        if (this.expandNode && this.expandNode.getChildByName('GradientColorTo')) {
            this.expandNode.getChildByName('GradientColorTo').active = true;
        } else {
            DrawHelper.loadRes('res', 'GradientColor', Prefab, (prefab: Prefab) => {
                let p = instantiate(prefab);
                p.parent = this.expandNode;
                p.name = "GradientColorTo";

                // 注册 事件
                let node = p.getChildByName('Node');
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    let r = ColorToArray[i][0];
                    let g = ColorToArray[i][1];
                    let b = ColorToArray[i][2];
                    let a = ColorToArray[i][3];
                    child.getComponent(Sprite)!.color = new Color(r, g, b, a);
                    DrawHelper.addButtonEvent(child, this.node, 'Main', 'onGradientColorToClick', ColorToArray[i]);
                }
            });
        }
    }

    onGradientColorToClick (evt: any, colors: number[]) {
        let r = colors[0];
        let g = colors[1];
        let b = colors[2];
        let a = colors[3];
        let newColor = new Color(r, g, b, a);
        this.gradientColorToNode.getComponent(Sprite)!.color = newColor;
        this.toColor = newColor;

        if (this.isOpenGradientColor) {
            let mat = this.drawNode.getComponent(Sprite).getMaterial(0);
            mat.setProperty("toColor", this.toColor);
        }

        // 隐藏颜色选项面板
        this.expandNode.getChildByName('GradientColorTo').active = false;
        // 关闭面板外触摸响应
        this.expandBlockNode.active = false;
    }

    // 隐藏左边扩展面板
    onHideExpand () {
        this.hideExpandChild();
        if (this.expandBlockNode.active) this.expandBlockNode.active = false;
        
        if (this.expandNode) {
            // 获取橡皮擦的大小
            if (this.expandNode.getChildByName('Erase')) {
                let lineWidth = this.expandNode.getChildByName('Erase').getChildByName('Slider').getComponent(SliderEx).getLineWidth();
                this.lastEraseLineWidth = lineWidth;
            }
            // 获取笔触的大小
            if (this.expandNode.getChildByName('Pen')) {
                let lineWidth = this.expandNode.getChildByName('Pen').getChildByName('Slider').getComponent(SliderEx).getLineWidth();
                this.lastDrawLineWidth = lineWidth;
                if (this.db) {
                    this.db.setLineWidth(this.lastDrawLineWidth);
                }
            }
        }
    }

    // 隐藏左边扩展面板子项
    hideExpandChild () {
        if (this.expandNode) {
            if (this.expandNode.getChildByName('Page')) this.expandNode.getChildByName('Page').active = false;
            if (this.expandNode.getChildByName('Erase')) this.expandNode.getChildByName('Erase').active = false;
            if (this.expandNode.getChildByName('Pen')) this.expandNode.getChildByName('Pen').active = false;
        }
    }

    // 渐变色开关
    onOpenGradientColor () {
        this.isOpenGradientColor = true;
        this.updatePenColor();

        if (this.panel2) {
            let nodeFrom = this.panel2.getChildByName('GradientColorFrom');
            if (nodeFrom && !nodeFrom.active) {
                nodeFrom.active = true;
            }
            let nodeTo = this.panel2.getChildByName('GradientColorTo');
            if (nodeTo && !nodeTo.active) {
                nodeTo.active = true;
            }
            this.panel2.getComponent(Layout)!.updateLayout();
        }
    }
    onCloseGradientColor () {
        this.isOpenGradientColor = false;
        this.updatePenColor();

        if (this.panel2) {
            let nodeFrom = this.panel2.getChildByName('GradientColorFrom');
            if (nodeFrom && nodeFrom.active) {
                nodeFrom.active = false;
            }
            let nodeTo = this.panel2.getChildByName('GradientColorTo');
            if (nodeTo && nodeTo.active) {
                nodeTo.active = false;
            }
            this.panel2.getComponent(Layout)!.updateLayout();
        }
    }

    /**
     * 更新画笔
     */
    updatePenColor () {
        if (this.isOpenGradientColor) {
            this.drawNode.getComponent(Sprite)!.setMaterial(this.drawMaterial, 0)!;
        } else {
            this.drawNode.getComponent(Sprite)!.setMaterial(this.normalMaterial, 0)!;
        }
    }
}
