import { FightTip } from './../ui/common/fightTip';
import { _decorator, Node, find, isValid, Vec3, UITransformComponent } from "cc";
import { resourceUtil } from "./resourceUtil";
import { poolManager } from "./poolManager";
import { tips } from "../ui/common/tips";
import { GameManager } from '../fight/gameManager';
import { PlayerBloodBar } from '../ui/fight/playerBloodBar';
import { MonsterBloodBar } from '../ui/fight/monsterBloodBar';
import { constant } from './constant';
const { ccclass, property } = _decorator;

let SHOW_STR_INTERVAL_TIME = 800;
let v3_playerBloodOffsetPos = new Vec3(-10, 100, 0);//血条距离玩家节点位置
let v3_playerBloodScale= new Vec3(1.5, 1.5, 1.5);//玩家血条缩放大小
let v3_monsterBloodOffsetPos = new Vec3(-10, 100, 0);//血条距离小怪节点位置
let v3_monsterBloodScale = new Vec3(1.5, 1.5, 1.5);//小怪血条缩放大小
let v3_targetPosOffset = new Vec3(0, 200, 0);//缓动目标位置

@ccclass("uiManager")
export class uiManager {
    private _dictSharedPanel: any = {}
    private _dictLoading: any = {}
    private _arrPopupDialog: any = []
    private _showTipsTime: number = 0

    private static _instance: uiManager;

    public static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new uiManager();
        return this._instance;
    }

    /**
     * 检查当前界面是否正在展示
     * @param panelPath 
     */
    public isDialogVisible (panelPath:string) {
        if (!this._dictSharedPanel.hasOwnProperty(panelPath)) {
            return false;
        }

        let panel = this._dictSharedPanel[panelPath];

        return isValid(panel) && panel.active && panel.parent;
    }


    /**
     * 显示单例界面
     * @param {String} panelPath 
     * @param {Array} args 
     * @param {Function} cb 回调函数，创建完毕后回调
     */
    public showDialog(panelPath:string, args?: any, cb?: Function, panelPriority: number = constant.PRIORITY.NORMAL) {
        if (this._dictLoading[panelPath]) {
            return;
        }

        let idxSplit = panelPath.lastIndexOf('/');
        let scriptName = panelPath.slice(idxSplit + 1);
        
        if (!args) {
            args = [];
        }

        if (this._dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this._dictSharedPanel[panelPath];
            if (isValid(panel)) {
                panel.parent = find("Canvas");
                panel.active = true;
                let script = panel.getComponent(scriptName);
                let script2 = panel.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));

                if (script && script.show) {
                    script.show.apply(script, args);
                    cb && cb(script);   
                } else if (script2 && script2.show){
                    script2.show.apply(script2, args);               
                    cb && cb(script2);
                } else {
                    throw `查找不到脚本文件${scriptName}`;
                }

                return;
            }
        }

        this._dictLoading[panelPath] = true;
        resourceUtil.createUI(panelPath, (err: any, node: Node) => {
            //判断是否有可能在显示前已经被关掉了？
            let isCloseBeforeShow = false;
            if (!this._dictLoading[panelPath]) {
                //已经被关掉
                isCloseBeforeShow = true;
            }

            this._dictLoading[panelPath] = false;
            if (err) {
                console.error(err);
                return;
            }

            // node.getComponent(UITransformComponent).priority = panelPriority;
            node.setSiblingIndex(panelPriority);

            this._dictSharedPanel[panelPath] = node;

            let script: any = node.getComponent(scriptName);
            let script2: any = node.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));
            if (script && script.show) {
                script.show.apply(script, args);
                cb && cb(script);   
            } else if (script2 && script2.show){
                script2.show.apply(script2, args);               
                cb && cb(script2);
            } else {
                throw `查找不到脚本文件${scriptName}`;
            }

            if (isCloseBeforeShow) {
                //如果在显示前又被关闭，则直接触发关闭掉
                this.hideDialog(panelPath);
            }
        });
    }

    /**
     * 隐藏单例界面
     * @param {String} panelPath 
     * @param {fn} callback
     */
    public hideDialog(panelPath: string, callback?: Function) {
        if (this._dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this._dictSharedPanel[panelPath];
            if (panel && isValid(panel)) {
                let ani = panel.getComponent('animationUI');
                if (ani) {
                    ani.close(() => {
                        panel.parent = null;
                        if (callback && typeof callback === 'function') {
                            callback();
                        }
                    });
                } else {
                    panel.parent = null;
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }
            } else if (callback && typeof callback === 'function') {
                callback();
            }
        }

        this._dictLoading[panelPath] = false;
    }

    /**
     * 将弹窗加入弹出窗队列
     * @param {string} panelPath 
     * @param {string} scriptName 
     * @param {*} param 
     */
    public pushToPopupSeq(panelPath: string, scriptName: string, param: any) {
        let popupDialog = {
            panelPath: panelPath,
            scriptName: scriptName,
            param: param,
            isShow: false
        };

        this._arrPopupDialog.push(popupDialog);

        this._checkPopupSeq();
    }

    /**
     * 将弹窗加入弹出窗队列
     * @param {number} index 
     * @param {string} panelPath 
     * @param {string} scriptName 
     * @param {*} param 
     */
    public insertToPopupSeq(index: number, panelPath: string, param: any) {
        let popupDialog = {
            panelPath: panelPath,
            param: param,
            isShow: false
        };

        this._arrPopupDialog.splice(index, 0, popupDialog);
        //this._checkPopupSeq();
    }

    /**
     * 将弹窗从弹出窗队列中移除
     * @param {string} panelPath 
     */
    public shiftFromPopupSeq(panelPath: string) {
        this.hideDialog(panelPath, () => {
            if (this._arrPopupDialog[0] && this._arrPopupDialog[0].panelPath === panelPath) {
                this._arrPopupDialog.shift();
                this._checkPopupSeq();
            }
        })
    }

    /**
     * 检查当前是否需要弹窗
     */
    private _checkPopupSeq() {
        if (this._arrPopupDialog.length > 0) {
            let first = this._arrPopupDialog[0];

            if (!first.isShow) {
                this.showDialog(first.panelPath, first.param);
                this._arrPopupDialog[0].isShow = true;
            }
        }
    }

    /**
     * 显示提示
     * @param {String} content 
     * @param {Function} cb 
     */
    public showTips (content: string | number, type: string = 'txt', targetPos: Vec3 = new Vec3(),  scale: number = 1, callback: Function = ()=>{}) {
        let str = String(content);
        let next = ()=>{
            this._showTipsAni(str, type, targetPos, scale, callback);
        }

        var now = Date.now();
        if (now - this._showTipsTime < SHOW_STR_INTERVAL_TIME && type !== 'gold' && type !== 'heart') {
            var spareTime = SHOW_STR_INTERVAL_TIME - (now - this._showTipsTime);
            setTimeout(() =>{
                next();
            }, spareTime);

            this._showTipsTime = now + spareTime;
        } else {
            next();
            this._showTipsTime = now;
        }
    }
 
    /**
     * 内部函数
     * @param {String} content 
     * @param {Function} cb 
     */
    private _showTipsAni (content: string, type: string, targetPos: Vec3, scale: number, callback?: Function) {
        resourceUtil.getUIPrefabRes('common/tips', function (err: any, prefab: any) {
            if (err) {
                return;
            }

            let tipsNode = poolManager.instance.getNode(prefab, find("Canvas") as Node);

            let tipScript = tipsNode.getComponent(tips) as tips;
            tipScript.show(content, type, targetPos, scale, callback);
        });
    }

    /**
     * 展示血条
     * @param scriptParent 
     * @param totalBlood 
     * @param bloodBarType 
     * @param offsetPos 
     * @param scale 
     */
    public showPlayerBloodBar (scriptParent: any, totalBlood: number, curBlood: number, callback: Function = ()=>{}, offsetPos: Vec3 = v3_playerBloodOffsetPos, scale: Vec3 = v3_playerBloodScale) {
        resourceUtil.getUIPrefabRes('fight/playerBloodBar', function (err: any, prefab: any) {
            if (err) {
                return;
            }

            let ndBloodBar = poolManager.instance.getNode(prefab, find("Canvas") as Node) as Node;
            ndBloodBar.setSiblingIndex(0);
            let scriptBloodBar = ndBloodBar.getComponent(PlayerBloodBar) as PlayerBloodBar;
            scriptParent.scriptBloodBar = scriptBloodBar;
            scriptBloodBar.show(scriptParent, totalBlood, curBlood, offsetPos, scale, callback);
        });
    }

    /**
     * 展示小怪血条
     *  
     * @param {*} scriptParent 
     * @param {number} totalBlood
     * @param {number} bloodBarType
     * @param {Function} [callback=()=>{}]
     * @param {Vec3} [offsetPos=MONSTER_BLOOD_OFFSET_POS]
     * @param {Vec3} [scale=MONSTER_BLOOD_SCALE]
     * @memberof uiManager
     */
    public showMonsterBloodBar (scriptParent: any, totalBlood: number, callback: Function = ()=>{}, offsetPos: Vec3 = v3_monsterBloodOffsetPos, scale: Vec3 = v3_monsterBloodScale) {
        resourceUtil.getUIPrefabRes('fight/monsterBloodBar', function (err: any, prefab: any) {
            if (err) {
                return;
            }

            let ndBloodBar = poolManager.instance.getNode(prefab, find("Canvas") as Node);
            let scriptBloodBar = ndBloodBar.getComponent(MonsterBloodBar) as MonsterBloodBar;
            scriptParent.scriptBloodBar = scriptBloodBar;
            scriptBloodBar.show(scriptParent, totalBlood, offsetPos, scale, callback);
        });
    }

    /**
     * 展示血量提示
     */
    public showBloodTips (scriptParent: any, type: number, bloodNum: number, offset: Vec3, callback?: Function) {
        resourceUtil.getUIPrefabRes('common/fightTip',  (err: any, prefab: any)=> {
            if (err) {
                return;
            }

            let ndTip = <Node>poolManager.instance.getNode(prefab,  <Node>find("Canvas"));
            let pos = GameManager.mainCamera?.convertToUINode(scriptParent.node.worldPosition, find('Canvas') as Node) as Vec3;
            pos.add(offset);
            ndTip.setPosition(pos);
            
            let scriptTip = ndTip.getComponent(FightTip) as FightTip;
            scriptTip.show(scriptParent, type, bloodNum, callback);
        });
    }
}
