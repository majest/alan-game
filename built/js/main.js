var resx = 1280;
var resy = 720;
var game;
var playerId;
var Game = (function () {
    function Game() {
        this.ready = false;
        this.fullScreenEnabled = false;
        this.game = new Phaser.Game(resx, resy, Phaser.WEBGL, 'phaser', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });
    }
    Game.prototype.gofullScreen = function () {
        if (this.game.scale.isFullScreen) {
        }
        else {
            this.game.scale.startFullScreen(true);
        }
    };
    Game.prototype.create = function () {
        console.log('Creating world');
        this.game.world.setBounds(0, 0, 20000000, 20000000);
        this.game.physics.startSystem(Phaser.Physics.AUTO);
        this.game.renderer.clearBeforeRender = false;
        this.game.time.advancedTiming = true;
        var playerId = Math.random() + '';
        this.playerId = playerId;
        this.actionHandler = new ActionHandler(this.game, this.playerId);
        this.scene = new Scene(this.game);
        this.transporter = new MessageTransport(this.actionHandler);
        this.actionHandler.setTransporter(this.transporter);
        this.actionHandler.createPlayer();
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.input.onDown.add(goFullScreen, this);
        this.ready = true;
    };
    Game.prototype.preload = function () {
        this.game.stage.disableVisibilityChange = true;
        this.game.config.forceSetTimeOut = true;
        this.game.load.image('space1', 'assets/space1.jpg');
        this.game.load.image('space2', 'assets/space2.jpg');
        this.game.load.image('bullet', 'assets/bullets.png');
        this.game.load.image('ship', 'assets/ships/fury.png');
        this.game.load.image('dust', 'assets/pixel.png');
        this.game.load.image('planet-earth', 'assets/planets/earth.png');
        this.game.load.image('planet-desert', 'assets/planets/desert.png');
    };
    Game.prototype.render = function () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
        this.game.debug.text(this.game.time.fps + ' FPS', 740, 32);
        var currentPLayer = this.actionHandler.getPlayers().getCurrentPlayer();
        if (currentPLayer) {
        }
    };
    Game.prototype.update = function () {
        if (!this.ready || this.actionHandler.getPlayers().length() == 0)
            return;
        var players = this.actionHandler.getPlayers().values();
        for (var key in players) {
            var player = players[key];
            player.update();
            if (player.isCurrentPlayer()) {
                this.scene.update(player.getObject());
            }
        }
    };
    return Game;
})();
var Scene = (function () {
    function Scene(game) {
        this.game = game;
        this.space1 = this.game.add.tileSprite(0, 0, resx, resy, 'space1');
        this.space1.fixedToCamera = true;
        this.space2 = this.game.add.tileSprite(0, 0, resx, resy, 'space2');
        this.space2.fixedToCamera = true;
        this.space2.alpha = 0.4;
        this.createPlanets();
    }
    Scene.prototype.createPlanets = function () {
        var planet = this.game.add.sprite(500, 400, "planet-earth");
        planet.scale.set(0.4);
        planet.anchor.setTo(0.5, 0.5);
        var planet = this.game.add.sprite(1500, 600, "planet-desert");
        planet.scale.set(0.3);
        planet.anchor.setTo(0.5, 0.5);
    };
    Scene.prototype.update = function (object) {
        if (!this.game.camera.atLimit.x) {
            this.space1.tilePosition.x -= (object.body.velocity.x) * this.game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.x -= (object.body.velocity.x) * this.game.time.physicsElapsed;
        }
        if (!this.game.camera.atLimit.y) {
            this.space1.tilePosition.y -= (object.body.velocity.y) * this.game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.y -= (object.body.velocity.y) * this.game.time.physicsElapsed;
        }
    };
    return Scene;
})();
var Connection = (function () {
    function Connection(transporter) {
        if (window['WebSocket']) {
            console.log('Connecting');
            this.conn = new WebSocket("ws://arturg.co.uk:9090/ws");
            this.conn.onclose = function (evt) {
                console.log('Connection closed');
            };
            this.conn.onmessage = function (evt) {
                transporter.parse(evt.data);
            };
        }
        else {
            console.log('No browser support');
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
})();
var MessageTransport = (function () {
    function MessageTransport(actionHandler) {
        console.log('Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }
    MessageTransport.prototype.parse = function (messageData) {
        console.log('MessageTransport::parse');
        var data = JSON.parse(messageData);
        var message = Message.fromJson(data);
        this.actionHandler.handleMessage(message);
    };
    MessageTransport.prototype.sendMessage = function (message) {
        console.log('MessageTransport::sendMessage');
        console.log(message);
        var messageData = JSON.stringify(message.toJson());
        this.connection.sendMessage(messageData);
    };
    return MessageTransport;
})();
var ActionHandler = (function () {
    function ActionHandler(game, playerId) {
        console.log('ActionHandler::constructor');
        this.players = new Players();
        this.game = game;
        this.playerId = playerId;
    }
    ActionHandler.prototype.createPlayer = function () {
        var message = new Message(this.playerId);
        message.addPlayer(new Loc(800, 400));
        this.transporter.sendMessage(message);
        var message = new Message(this.playerId);
        message.logIn();
        this.transporter.sendMessage(message);
    };
    ActionHandler.prototype.setTransporter = function (transporter) {
        console.log('ActionHandler::setTransporter');
        this.transporter = transporter;
    };
    ActionHandler.prototype.getPlayers = function () {
        return this.players;
    };
    ActionHandler.prototype.handleMessage = function (message) {
        console.log('ActionHandler::handleMessage');
        var player = this.players.getPlayer(message.id);
        if (!player) {
            console.log('ActionHandler::handleMessage - creating new player, id:' + message.id);
            player = new Player(this.game, message.id);
            this.players.add(message.id, player);
        }
        console.log(this.playerId + ' ' + message.id);
        if (message.shouldLogIn() && parseFloat(this.playerId) === parseFloat(message.id)) {
            console.log('ActionHandler::handleMessage - player logged in');
            player.setCurrentPlayer();
            player.setTransporter(this.transporter);
        }
        player.handleMessage(message);
    };
    return ActionHandler;
})();
var Players = (function () {
    function Players() {
        this._keys = [];
        this._values = [];
    }
    Players.prototype.add = function (key, player) {
        this[key] = player;
        this._keys.push(key);
        this._values.push(player);
    };
    Players.prototype.remove = function (key) {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        delete this[key];
    };
    Players.prototype.keys = function () {
        return this._keys;
    };
    Players.prototype.values = function () {
        return this._values;
    };
    Players.prototype.length = function () {
        return this._values.length;
    };
    Players.prototype.containsKey = function (key) {
        if (typeof this[key] === "undefined") {
            return false;
        }
        return true;
    };
    Players.prototype.getCurrentPlayer = function () {
        for (var key in this._values) {
            var player = this._values[key];
            if (player.isCurrentPlayer()) {
                return player;
            }
        }
        return null;
    };
    Players.prototype.getPlayer = function (id) {
        if (this.containsKey(id)) {
            return this[id];
        }
        console.log('Players::getPlayer - No player found , id:' + id);
        return null;
    };
    Players.prototype.toLookup = function () {
        return this;
    };
    return Players;
})();
function waitForSocketConnection(socket, callback) {
    setTimeout(function () {
        if (socket.readyState === 1) {
            console.log("Connection is made");
            if (callback != null) {
                callback();
            }
            return;
        }
        else {
            console.log("wait for connection...");
            waitForSocketConnection(socket, callback);
        }
    }, 5);
}
function goFullScreen() {
    game.gofullScreen();
}
