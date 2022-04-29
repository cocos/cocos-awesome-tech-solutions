import { NodePool } from "cc";

//游戏管理员，提供游戏业务、交互等内容需要的常量数据和方法
const GameManager = {
    //当前支持的语言
    language: {
        support: ["zh","en"],
    },
    //节点池
    nodePool: {
        userCenter: <NodePool>null,
    },
    //最大可显示的字符长度
    maxTextTruncationLength: 15,
    //默认的用户等级
    defaultUserLerver: "0",
    //储存用户数据的字段
    storeUserDataField: "userData"
    
}
export default GameManager;