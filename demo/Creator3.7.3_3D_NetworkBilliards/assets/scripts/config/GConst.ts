import { Color } from "cc";

//储存与 ui 布局相关的常量，比如资源路径、节点路径、颜色配置
const GameConst = {
    //预制体资源路径
    resUrl: {
        joinRoom: 'prefabs/joinRoom',
        userCenter: "prefabs/userCenter",
        gameRoom: "prefabs/gameRoom"
    },
    loginMgrChildUrl: {
        title: 'Label Title',
        tips: 'Label Tips',
        inputUserName: 'Input UserName',
        inputPassWord: 'Input PassWord',
        switchTypeBtnLabel: 'Btn SwitchType/Background/Label'
    },
    hallMgrChildUrl: {
        hallMgr: 'HallMgr',
        title: 'Label Title',
        roomBtns: 'RoomBtns'
    },
    joinRoomMgrChildUrl: {
        joinMgr: 'JoinMgr',
        inputRoom: 'Input RoomNumber',
    },
    //颜色配置数组
    colorList: [ Color.CYAN, Color.GREEN, Color.MAGENTA,
    Color.GRAY, Color.RED, Color.YELLOW],
    hitBallNodeName: "ball-0",
}
export default GameConst;