var Connection = (function () {
    function Connection(transporter) {
        if (window['WebSocket']) {
            console.log('Connecting');
            this.conn = new WebSocket("ws://localhost:9090/ws");
            this.conn.binaryType = 'blob';
            this.conn.onclose = function (evt) {
                console.log('Connection closed');
            };
            this.conn.onmessage = function (evt) {
                transporter.parse(evt.data);
            };
            this.conn.onopen = function (evt) {
                console.log("Connection established");
            };
            this.conn.onerror = function (evt) {
                console.log("Conenction ERROR: " + evt.data);
            };
        }
    }
    Connection.prototype.getMessage = function () {
        return this.data;
    };
    Connection.prototype.sendMessage = function (message) {
        var ws = this.conn;
        waitForSocketConnection(ws, function () {
            ws.send(message);
        });
    };
    return Connection;
}());
var MessageTransport = (function () {
    function MessageTransport(actionHandler) {
        console.log('Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }
    MessageTransport.prototype.resetConnection = function () {
        this.connection = new Connection(this);
    };
    // b64EncodeUnicode(str) {
    // return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    //     return String.fromCharCode('0x' + p1);
    // }));
    // }
    MessageTransport.prototype.parse = function (messageData) {
        var message = Serializer.load(JSON.parse(messageData));
        console.log('MessageTransport::parse - received message: ' + message.action + ' for ' + message.id);
        // do not handle current's player messages from outside
        this.actionHandler.handleMessage(message);
    };
    MessageTransport.prototype.sendMessage = function (message) {
        console.log('MessageTransport::sendMessage - ' + message.action + ' to ' + message.id);
        var messageData = JSON.stringify(message.serialize());
        //var l = atob(messageData);
        this.connection.sendMessage(messageData);
    };
    return MessageTransport;
}());
function waitForSocketConnection(socket, callback) {
    var timer = 0;
    setTimeout(function () {
        if (socket.readyState === 1) {
            if (callback != null) {
                callback();
            }
            return;
        }
        else {
            console.log("wait for connection... state:" + socket.readyState);
            timer += 5;
            //    if (timer => 5000) {
            // reset the connection
            //    transporter.resetConnection();
            //    } else {
            waitForSocketConnection(socket, callback);
        }
    }, 5); // wait 5 milisecond for the connection...
}
