import { util } from './util';
import { _decorator, Component } from "cc";
import { constant } from "./constant";
import { localConfig } from "./localConfig";
import { StorageManager } from "./storageManager";
import { clientEvent } from './clientEvent';

const { ccclass, property } = _decorator;

@ccclass("playerData")
export class playerData extends Component {
    /* class member could be defined like this */
    // dummy = '';

    static _instance: playerData;
    

    public static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new playerData();
        return this._instance;
    }

    public serverTime: number = 0;
    public localTime: number = 0;

    private _userId: string = '';
    private _playerInfo: any = null;
    private _history: any = null;
    private _settings: any = null;
    private _isNewBee: boolean = false;    //默认非新手
    private _dataVersion: string = '';

    public get userId () {
        return this._userId;
    }

    public set userId (v: string) {
        this._userId = v;
    }

    public get settings () {
        return this._settings;
    }

    public set settings (v: any) {
        this._settings = v;
    }

    public get playerInfo () {
        return this._playerInfo;
    }

    public set playerInfo (v: any) {
        this._playerInfo = v;
    }

    public get history () {
        return this._history;
    }

    public set history (v: any) {
        this._history = v;
    }

    public get isNewBee () {
        return this._isNewBee;
    }

    public set isNewBee (v: boolean) {
        this._isNewBee = v;
    }

    //是否已经解锁完成所有技能
    public get isPlayerSkillAllUnlock () {
        let arrSkill = localConfig.instance.getTableArr("playerSkill");
        //生命回复技能不在技能列表里面出现，而是在游戏内多次出现，所以减去1
        return this.playerInfo.arrSkill.length === arrSkill.length - 1;
    }

    /**
     * 加上用户数据
     */
    public loadGlobalCache() {
        let userId: string = StorageManager.instance.getUserId();
        if (userId) {
            this._userId = userId;
        }
    }

    /**
     * 加载本地存储数据
     */
    public loadFromCache() {
        //读取玩家基础数据
        this._playerInfo = this._loadDataByKey(constant.LOCAL_CACHE.PLAYER);
        this._history = this._loadDataByKey(constant.LOCAL_CACHE.HISTORY);
        this._settings = this._loadDataByKey(constant.LOCAL_CACHE.SETTINGS);
    }

    /**
     * 获取本地存储数据
     * @param {string}keyName 
     * @returns 
     */
    private _loadDataByKey (keyName: any) {
        let ret = {};
        let str = StorageManager.instance.getConfigData(keyName);
        if (str) {
            try {
                ret = JSON.parse(str);
            } catch (e) {
                ret = {};
            }
        } 
        
        return ret;
    }

    /**
     * 创建角色数据
     * @param loginData 
     */
    public createPlayerInfo(loginData?:any) {
        this._playerInfo = {
            diamond: 0, //钻石总数
            gold: 0,//金币数量
            key: 0, //钥匙数量
            level: 1,  //当前层级
            highestLevel: 1,//已经解锁的最高层级
            arrSkill:[],//已经解锁的玩家技能ID
            createDate: new Date(), //记录创建时间
        };
        
        this._isNewBee = true; //区分新老玩家

        if (loginData) {
            for (let key in loginData) {
                this._playerInfo[key] = loginData[key];
            }
        }

        this.savePlayerInfoToLocalCache();
    }

    /**
     * 生成随机账户
     * @returns
     */
     public generateRandomAccount () {
        this.userId = `${Date.now()}${util.getRandomInt(0, 1000)}`;
        StorageManager.instance.setUserId(this._userId);
    }

    /**
     * 存用户数据
     * @param userId 
     */
    public saveAccount(userId: any) {
        this._userId = userId;
        StorageManager.instance.setUserId(userId);
    }

    /**
     * 保存玩家数据
     */
     public savePlayerInfoToLocalCache() {
        StorageManager.instance.setConfigData(constant.LOCAL_CACHE.PLAYER, JSON.stringify(this._playerInfo));
    }
    
    /**
     * 保存玩家设置相关信息
     */
    public saveSettingsToLocalCache () {
        StorageManager.instance.setConfigData(constant.LOCAL_CACHE.SETTINGS, JSON.stringify(this._settings));
    }

    /**
     * 当数据同步完毕，即被覆盖的情况下，需要将数据写入到本地缓存，以免数据丢失
     */
     public saveAll() {
        StorageManager.instance.setConfigDataWithoutSave(constant.LOCAL_CACHE.PLAYER, JSON.stringify(this._playerInfo));
        StorageManager.instance.setConfigDataWithoutSave(constant.LOCAL_CACHE.HISTORY, JSON.stringify(this._history));
        StorageManager.instance.setConfigDataWithoutSave(constant.LOCAL_CACHE.SETTINGS, JSON.stringify(this._settings));
        StorageManager.instance.setConfigData(constant.LOCAL_CACHE.DATA_VERSION, this._dataVersion);
    }

    /**
     * 更新用户信息
     * 例如钻石、金币、道具
     * @param {String} key
     * @param {Number} value
     */
    public updatePlayerInfo(key:string, value: any) {
        let isChanged: boolean= false;
        if (this._playerInfo.hasOwnProperty(key)) {
            if (typeof value === 'number') {
                isChanged = true;
                this._playerInfo[key] += value;
                if (this._playerInfo[key] < 0) {
                    this._playerInfo[key] = 0;
                }
                //return;
            } else if (typeof value === 'boolean' || typeof value === 'string') {
                isChanged = true;
                this._playerInfo[key] = value;
            }
        }
        if (isChanged) {
            //有修改就保存到localcache
            StorageManager.instance.setConfigData(constant.LOCAL_CACHE.PLAYER, JSON.stringify(this._playerInfo));
        }
    }
    
    /**
     * 获取玩家杂项值
     * @param {string} key 
     */
    public getSetting (key: string) {
        if (!this._settings) {
            return null;
        }

        if (!this._settings.hasOwnProperty(key)) {
            return null;
        }

        return this._settings[key];
    }

    /**
     * 设置玩家杂项值
     * @param {string} key 
     * @param {*} value 
     */
    public setSetting (key: string, value: any) {
        if (!this._settings) {
            this._settings = {};
        }

        this._settings[key] = value;

        this.saveSettingsToLocalCache();
    }

    /**
     * 清除用户信息
     */
    public clear () {
        this._playerInfo = {};
        this._settings = {};
        this.saveAll();
    }

    /**
     * 增加战斗次数
     * @param times 
     */
    public addFightTimes (times: number = 1) {
        let fightTimes = this.getFightTimes();

        fightTimes += 1;
        this.setSetting(constant.SETTINGS_KEY.FIGHT_TIMES, fightTimes);
    }

    /**
     * 获取战斗次数
     * @returns 
     */
    public getFightTimes () {
        let fightTimes = this.getSetting(constant.SETTINGS_KEY.FIGHT_TIMES);

        if (!fightTimes) {
            fightTimes = 0;
            this.setSetting(constant.SETTINGS_KEY.FIGHT_TIMES, 0);
        } 

        return fightTimes;
    }

    /**
     * 获取未解锁的玩家技能
     *
     * @memberof playerData
     */
    public getLockPlyerSkill (): [] {
        let arrSkill = localConfig.instance.getTableArr("playerSkill");
        let arrLock: any = [];

        arrLock = arrSkill.filter((item: any)=>{
            return !this.playerInfo.arrSkill.includes(item.ID) && (item.ID !== constant.PLAYER_SKILL.RECOVERY);
        })

        return arrLock;
    }

    /**
     * 添加玩家某项技能
     *
     * @param {*} info
     * @memberof playerData
     */
    public addPlayerSkill (info: any) {
        if (!this.playerInfo.arrSkill.includes(info.ID)) {
            this.playerInfo.arrSkill.push(info.ID);
            this.savePlayerInfoToLocalCache();
            clientEvent.dispatchEvent(constant.EVENT_TYPE.PARSE_PLAYER_SKILL);
        }
    }

    /**
     * 删除玩家某项技能
     *
     * @param {*} info
     * @memberof playerData
     */
    public reducePlayerSkill (info: any) {
        if (this.playerInfo.arrSkill.includes(info.ID)) {
            let idx = this.playerInfo.arrSkill.findIndex((item: number)=>{ return item === info.ID});
            this.playerInfo.arrSkill.splice(idx, 1);

            // this.reduceValueChangeSkill(info.ID);

            this.savePlayerInfoToLocalCache();
            clientEvent.dispatchEvent(constant.EVENT_TYPE.PARSE_PLAYER_SKILL);
        }
    }
}
