const ws = require('nodejs-websocket');
const SCmd = require("./SCmd");

function Table() {
    this.data = {};
    this.data.currentPlayer = null;
    this.data.hasHit = false;
    this.data.playerList = [];
    this.data.watcherList = [];
    this.data.ballsData = null;
}

Table.prototype.isPlayer = function (userId) {
    return this.data.playerList.indexOf(userId) != -1;
}

Table.prototype.isWatcher = function (userId) {
    return this.data.watcherList.indexOf(userId) != -1;
}

Table.prototype.changePlayer = function(){
    if(this.data.playerList.length == 2){
        if(this.data.playerList[0] == this.data.currentPlayer){
            this.data.currentPlayer = this.data.playerList[1];
        }
        else{
            this.data.currentPlayer = this.data.playerList[0];
        }
    }
    this.data.hasHit = false;
}

Table.prototype.addUser = function (userId) {
    if (this.isPlayer(userId) || this.isWatcher(userId)) {
        return;
    }
    if (this.data.playerList.length < 2) {
        this.data.playerList.push(userId);
        if (!this.data.currentPlayer) {
            this.data.currentPlayer = userId;
        }
    }
    else {
        this.data.watcherList.push(userId);
    }
}

let table = new Table();

let server = ws.createServer(conn => {
    conn.on('text', function (textValue) {
        var _textObj = JSON.parse(textValue);
        var _data = null;
        if (_textObj.data) {
            _data = JSON.parse(_textObj.data);
        }

        console.log(`c2s: ${_textObj.command} , `, _data);
        if(_textObj.command != SCmd.C2S.USER_LOGIN && !conn.userId){
            return;
        }
        switch (_textObj.command) {
            case SCmd.C2S.USER_LOGIN:
                conn.userId = _data.userId;
                table.addUser(_data.userId);
                sendToClient(conn, SCmd.S2C.USER_LOGIN_SUCCESS, table.data);
                break;
            case SCmd.C2S.HIT_BALL:
                if(table.data.currentPlayer != _data.userId || table.data.hasHit){
                    return;
                }
                table.data.hasHit = true;
                table.data.ballsData = _data;
                broadcast(SCmd.S2C.HIT_BALL_SYNC, _data);
                break;
            case SCmd.C2S.HIT_BALL_COMPLETE:
                if(table.data.currentPlayer != _data.userId){
                    return;
                }
                table.data.ballsData = _data;
                table.changePlayer();
                _data.currentPlayer = table.data.currentPlayer;
                broadcast(SCmd.S2C.HIT_BALL_COMPLETE_SYNC, _data);
                break;
            case SCmd.C2S.INITIATE_CUE_SYNC:
                broadcast(SCmd.S2C.REQUEST_CUE_SYNC, _data);
                break;
        }
    });

    conn.on('error', function (err) {
        console.log(`'error',${err}`);
    });

    conn.on('close', function (code) {
        console.log(`'close',${code}`);
    });

    // connection.on('close', function(code){
    //     console.log('code : ', code);

    //     broadcast(SCmd.ServerCmd.CLOSE_CONNECT,{});
    // });
})


const sendToClient = (conn, command, data) => {
    console.log(`s2c: ${command} , ${data}`);
    var _clientObj = {};
    _clientObj.command = command;
    if (data) _clientObj.data = JSON.stringify(data);
    conn.sendText(JSON.stringify(_clientObj))
}

const broadcast = (command, data) => {
    server.connections.forEach((conn) => {
        var _clientObj = {
            "command": command,
            "data": JSON.stringify(data)
        }
        conn.sendText(JSON.stringify(_clientObj))
        // console.log(`s2c: broadcast, ${command} , ${data}`);
    })
}

server.listen(8002);

console.log("Listen 8002");