import { _decorator, Component, Prefab, ScrollView } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BackPackUI')
export class BackPackUI extends Component {
    @property(Prefab)
    public slotPrefab: Prefab = 'null';
    @property(ScrollView)
    public scrollView: ScrollView = 'null';
    @property
    public totalCount = 0;

    init (home: any) {
        //this.heroSlots = [];
        //this.home = home;
        //for (let i = 0; i < this.totalCount; ++i) {
        //    let heroSlot = this.addHeroSlot();
        //    this.heroSlots.push(heroSlot);
        //}
    }

    addHeroSlot () {
        //let heroSlot = cc.instantiate(this.slotPrefab);
        //this.scrollView.content.addChild(heroSlot);
        //return heroSlot;
    }

    show () {
        //this.node.active = true;
        //this.node.emit('fade-in');
        //this.home.toggleHomeBtns(false);
    }

    hide () {
        //this.node.emit('fade-out');
        //this.home.toggleHomeBtns(true);
    }

}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// cc.Class({
//     extends: cc.Component,
// 
//     properties: {
//         slotPrefab: {
//             default: null,
//             type: cc.Prefab
//         },
//         scrollView: {
//             default: null,
//             type: cc.ScrollView
//         },
//         totalCount: 0
//     },
// 
//     init: function (home) {
//         this.heroSlots = [];
//         this.home = home;
//         for (let i = 0; i < this.totalCount; ++i) {
//             let heroSlot = this.addHeroSlot();
//             this.heroSlots.push(heroSlot);
//         }
//     },
// 
//     addHeroSlot: function () {
//         let heroSlot = cc.instantiate(this.slotPrefab);
//         this.scrollView.content.addChild(heroSlot);
//         return heroSlot;
//     },
// 
//     show: function () {
//         this.node.active = true;
//         this.node.emit('fade-in');
//         this.home.toggleHomeBtns(false);
//     },
// 
//     hide: function () {
//         this.node.emit('fade-out');
//         this.home.toggleHomeBtns(true);
//     },
// });
