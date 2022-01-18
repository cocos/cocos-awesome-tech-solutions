import { _decorator, Component, Node, ScrollView, Label, Button, Vec3, UITransform, instantiate, error } from "cc";
const { ccclass, property, menu } = _decorator;

const _temp_vec3 = new Vec3();

@ccclass("ListViewCtrl")
@menu('UI/ListViewCtrl')
export class ListViewCtrl extends Component {
    @property(Node)
    public itemTemplate: Node  = null!;
    @property(ScrollView)
    public scrollView: ScrollView  = null!;
    @property
    public spawnCount = 0; // 初始化 item 数量
    @property
    public totalCount = 0; // 滚动列表里总的 item 数量
    @property
    public spacing = 0; // item 垂直排布间隔
    @property
    public bufferZone = 0; // when item is away from bufferZone, we relocate it
    @property(Button)
    public btnAddItem: Button  = null!;
    @property(Button)
    public btnRemoveItem: Button  = null!;
    @property(Button)
    public btnJumpToPosition: Button  = null!;
    @property(Label)
    public lblJumpPosition: Label  = null!;
    @property(Label)
    public lblTotalItems: Label  = null!;

    private _content: Node = null!;
    private _items: Node[] = [];
    private _updateTimer = 0;
    private _updateInterval = 0.2;
    private _lastContentPosY = 0;
    private _itemTemplateUITrans!: UITransform;
    private _contentUITrans!: UITransform;

    onLoad() {
        this._content = this.scrollView.content!;
        this.initialize();
        this._updateTimer = 0;
        this._updateInterval = 0.2;
        this._lastContentPosY = 0; // use this variable to detect if we are scrolling up or down
    }

    // 初始化 item
    initialize() {
        this._itemTemplateUITrans = this.itemTemplate._uiProps.uiTransformComp!;
        this._contentUITrans = this._content._uiProps.uiTransformComp!;
        this._contentUITrans.height = this.totalCount * (this._itemTemplateUITrans.height + this.spacing) + this.spacing; // get total content height
        for (let i = 0; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
            let item = instantiate(this.itemTemplate) as Node;
            this._content.addChild(item);
            let itemUITrans = item._uiProps.uiTransformComp!;
            item.setPosition(0, -itemUITrans.height * (0.5 + i) - this.spacing * (i + 1), 0);
            const labelComp = item.getComponentInChildren(Label)!;
            labelComp.string = `item_${i}`;
            this._items.push(item);
        }
    }

    getPositionInView(item: Node) {
        // get item position in scrollview's node space
        let worldPos = item.parent!.getComponent(UITransform)!.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.getComponent(UITransform)!.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    update(dt: number) {
        this._updateTimer += dt;
        if (this._updateTimer < this._updateInterval) return; // we don't need to do the math every frame
        this._updateTimer = 0;
        let items = this._items;
        let buffer = this.bufferZone;
        let isDown = this.scrollView.content!.position.y < this._lastContentPosY; // scrolling direction
        let offset = (this._itemTemplateUITrans.height + this.spacing) * items.length;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            items[i].getPosition(_temp_vec3);
            if (isDown) {
                // if away from buffer zone and not reaching top of content
                if (viewPos.y < -buffer && _temp_vec3.y + offset < 0) {
                    _temp_vec3.y += offset;
                    items[i].setPosition(_temp_vec3);
                }
            } else {
                // if away from buffer zone and not reaching bottom of content
                if (viewPos.y > buffer && _temp_vec3.y - offset > -this._contentUITrans.height) {
                    _temp_vec3.y -= offset;
                    items[i].setPosition(_temp_vec3);
                }
            }
        }
        // update lastContentPosY
        this._lastContentPosY = this.scrollView.content!.position.y;
        this.lblTotalItems.string = "Total Items: " + this.totalCount;
    }

    addItem() {
        this._contentUITrans.height = (this.totalCount + 1) * (this._itemTemplateUITrans.height + this.spacing) + this.spacing; // get total content height
        this.totalCount = this.totalCount + 1;
    }

    removeItem() {
        if (this.totalCount - 1 < 30) {
            error("can't remove item less than 30!");
            return;
        }

        this._contentUITrans.height = (this.totalCount - 1) * (this._itemTemplateUITrans.height + this.spacing) + this.spacing; // get total content height
        this.totalCount = this.totalCount - 1;

        this.moveBottomItemToTop();
    }

    moveBottomItemToTop() {
        let offset = (this._itemTemplateUITrans.height + this.spacing) * this._items.length;
        let length = this._items.length;
        let item = this.getItemAtBottom();
        item.getPosition(_temp_vec3);

        // whether need to move to top
        if (_temp_vec3.y + offset < 0) {
            _temp_vec3.y = _temp_vec3.y + offset;
            item.setPosition(_temp_vec3);
        }
    }

    getItemAtBottom() {
        let item = this._items[0];
        for (let i = 1; i < this._items.length; ++i) {
            if (item.position.y > this._items[i].position.y) {
                item = this._items[i];
            }
        }
        return item;
    }

    scrollToFixedPosition() {
        this.scrollView.scrollToOffset(new Vec3(0, 500, 0), 2, true);
    }
}

