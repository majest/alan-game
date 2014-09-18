var express = require('express'),
    app = express(app),
    server = require('http').createServer(app);


// serve static files from the current directory
app.use(express.static(__dirname));


//get EurecaServer class
var EurecaServer = require('eureca.io').EurecaServer;

var eurecaServer = new EurecaServer({
    allow: ['setId', 'spawnEnemy', 'kill', 'updateState', 'loadWorld']
});


var clients = {};

var world = [{
    id: 1,
    object: 'planet',
    type: 'desert',
    x: 300,
    y: 300,
    scale: 0.6
}, {
    id: 2,
    object: 'planet',
    type: 'desert',
    x: 900,
    y: 900,
    scale: 0.1
}];



//attach eureca.io to our http server
eurecaServer.attach(server);

//detect client connection
eurecaServer.onConnect(function(conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

    //the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);

    //register the client
    clients[conn.id] = {
        id: conn.id,
        remote: remote
    }

    //here we call setId (defined in the client side)
    remote.setId(conn.id);


    remote.loadWorld(world)
});

//detect client disconnection
eurecaServer.onDisconnect(function(conn) {
    console.log('Client disconnected ', conn.id);

    var removeId = clients[conn.id].id;

    delete clients[conn.id];

    for (var c in clients) {
        var remote = clients[c].remote;

        //here we call kill() method defined in the client side
        remote.kill(conn.id);
    }
});

eurecaServer.exports.handshake = function() {
    for (var c in clients) {
        var remote = clients[c].remote;
        for (var cc in clients) {
            //send latest known position
            var x = clients[cc].laststate ? clients[cc].laststate.x : 0;
            var y = clients[cc].laststate ? clients[cc].laststate.y : 0;

            // span on all clients
            remote.spawnEnemy(clients[cc].id, x, y);
        }
    }
}

eurecaServer.exports.handleKeys = function(keys) {
    var conn = this.connection;
    var updatedClient = clients[conn.id];

    for (var c in clients) {
        var remote = clients[c].remote;

        // dont brodacst your own position
        if (updatedClient.id != c) {
            console.log("Updating " + updatedClient.id);
            // update on all clients
            remote.updateState(updatedClient.id, keys);
        }

        //keep last known state so we can send it to new connected clients
        clients[c].laststate = keys;
    }
}

server.listen(8000);