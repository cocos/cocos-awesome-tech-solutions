const ws = require('nodejs-websocket');
const SCmd = require("./SCmd");

var myConnection = null;

let server = ws.createServer(connection => {
    myConnection = connection;
    connection.on('text', function(textValue) {
        var _textObj = JSON.parse(textValue);
        if (_textObj.data) {
            var _data = JSON.parse(_textObj.data);
        }

        console.log(`c2s: ${_textObj.command} , `, _data);
        switch (_textObj.command) {
            case SCmd.ClientCmd.USER_LOGIN:
                break;
            case SCmd.ClientCmd.INITIATE_BALLS_SYNC:
                broadcast(SCmd.ServerCmd.REQUEST_BALLS_SYNC, _data);
                break;
            case SCmd.ClientCmd.INITIATE_CUE_SYNC:
                broadcast(SCmd.ServerCmd.REQUEST_CUE_SYNC, _data);
                break;
        }
    });

    // connection.on('close', function(code){
    //     console.log('code : ', code);

    //     broadcast(SCmd.ServerCmd.CLOSE_CONNECT,{});
    // });
})


const sendToClient = (command, data)=>{
    console.log(`s2c: ${command} , ${data}`);
    var _clientObj = {};
    _clientObj.command = command;
    if (data) _clientObj.data = JSON.stringify(data);
    myConnection.sendText(JSON.stringify(_clientObj))
}

const broadcast = (command, data) => {
    server.connections.forEach((conn) =>{
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