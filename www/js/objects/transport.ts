

class Connection {

    conn: any;
    data: String;

    constructor(transporter: MessageTransport) {
        if (window['WebSocket']) {
            console.log('Connecting');
            this.conn = new WebSocket("ws://arturg.co.uk:9090/ws");

            this.conn.onclose = function(evt) {
                console.log('Connection closed');
            }

            this.conn.onmessage = function(evt) {
                transporter.parse(evt.data);
            }

            this.conn.onopen = function(evt) {
                console.log("Connection established");
            }

            this.conn.onerror = function(evt) {
                console.log("Conenction ERROR: " + evt.data);
            }
        }
    }

    getMessage() {
        return this.data;
    }

    sendMessage(message: string) {
        var ws = this.conn;
        waitForSocketConnection(ws, function(){
            ws.send(message)
        });
    }
}

class MessageTransport {

    connection;
    actionHandler: ActionHandler;

    constructor(actionHandler: ActionHandler) {
        console.log('Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }

    resetConnection() {
        this.connection = new Connection(this);
    }

    // b64EncodeUnicode(str) {
    // return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    //     return String.fromCharCode('0x' + p1);
    // }));
    // }

    parse(messageData) {
        //console.log(this.unpack(messageData));
        //console.log(LZString.decompress(messageData));
        //var string = new TextDecoder('utf-8').decode(<ArrayBuffer>messageData);
        //var string = new TextDecoder('utf-8').decode(<ArrayBuffer>this.unpack(messageData));
        var data = JSON.parse(messageData);
        var message = Serializer.load(data);
        console.log('MessageTransport::parse - received message: ' + message.action + ' for ' + message.id);
        // do not handle current's player messages from outside
        this.actionHandler.handleMessage(message);
    }
    pack(bytes) {
        var str = "";
        for(var i = 0; i < bytes.length; i += 2) {
            var char = bytes[i] << 8;
            if (bytes[i + 1])
                char |= bytes[i + 1];
            str += String.fromCharCode(char);
        }
        return str;
    }

    unpack(str) {
    var bytes = [];
    for(var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8);
        bytes.push(char & 0xFF);
    }
    return bytes;
    }


    sendMessage(message: Message) {
        console.log('MessageTransport::sendMessage - ' + message.action + ' to ' + message.id);

        var messageData = JSON.stringify(message.serialize());
        //var conn = this.connection;
        //messageData = new TextEncoder('utf-8').encode(messageData);
        //console.log(this.b64EncodeUnicode(messageData));
        console.log(messageData);
        this.connection.sendMessage(messageData);

    //    console.log(this.utf8AbFromStr(messageData));

    }


}

function waitForSocketConnection(socket, callback){

    var timer = 0;

    setTimeout(
        function () {
            if (socket.readyState === 1) {
                if(callback != null){
                    callback();
                }
                return;

            } else {
                console.log("wait for connection... state:" + socket.readyState);
                timer+=5;

            //    if (timer => 5000) {

                    // reset the connection
                //    transporter.resetConnection();
            //    } else {
                    waitForSocketConnection(socket, callback);
            //    }
            }

        }, 5); // wait 5 milisecond for the connection...
}
