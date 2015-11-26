var game;
var firstRunLandscape;
var playerId;
var transporter;
var player;
var gameinterface;
var Game = (function () {
    function Game() {
        this.ready = false;
        Game.gameRatio = window.innerWidth / window.innerHeight;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        console.log('==========  ratio: ' + Game.gameRatio);
        console.log('==========  width: ' + Game.resx);
        console.log('==========  window width: ' + winWidth);
        console.log('==========  window height: ' + winHeight);
        game = new Phaser.Game(Game.resx, Math.ceil(Game.resx / Game.gameRatio), Phaser.WEBGL, 'phaser');
        game.state.add('setup', Setup);
        game.state.start('setup');
    }
    Game.prototype.create = function () {
    };
    Game.prototype.preload = function () {
    };
    Game.prototype.handleCorrect = function () {
    };
    Game.prototype.handleIncorrect = function () {
    };
    Game.resx = 1000;
    return Game;
})();
var Setup = (function () {
    function Setup() {
    }
    Setup.prototype.render = function () {
        game.debug.text(game.time.fps + ' FPS', 400, 32);
    };
    Setup.prototype.preload = function () {
        game.load.image('space1', 'assets/space1.jpg');
        game.load.image('space2', 'assets/space2.jpg');
        game.load.image('planet-earth', 'assets/planets/earth.png');
        game.load.image('planet-desert', 'assets/planets/desert.png');
        game.load.image('bullet', 'assets/bullets.png');
        game.load.image('ship', 'assets/ships/fury.png');
        game.load.image('dust', 'assets/pixel.png');
        game.load.image('shield', 'assets/shield-1.png');
        game.load.image('crosshair', 'assets/crosshair2.png');
        game.load.spritesheet('button', 'assets/buttons.png', 193, 71);
        game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64);
    };
    Setup.prototype.create = function () {
        console.log('Creating world');
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 20000000, 20000000);
        game.time.advancedTiming = true;
        this.background = new Background();
        this.actionHandler = ActionHandler.getInstance();
        this.actionHandler.init();
        transporter = new MessageTransport(this.actionHandler);
        this.actionHandler.createPlayer();
        this.ready = true;
        var button = game.add.button(10, 20, 'button', this.fire, this, 2, 1, 0);
        button.scale.set(0.5);
        button.fixedToCamera = true;
    };
    Setup.prototype.fire = function () {
        player.ship.sendFire();
    };
    Setup.prototype.update = function () {
        var groupOfShips = this.actionHandler.getUpdateGroups();
        if (!this.ready || groupOfShips.length == 0)
            return;
        this.actionHandler.sortedCollide(game, groupOfShips.children);
        if (typeof groupOfShips != 'undefined') {
            groupOfShips.update();
        }
        if (player.alive) {
            this.background.update(player.getShip());
        }
    };
    return Setup;
})();
var Background = (function () {
    function Background() {
        this.space1 = game.add.tileSprite(0, 0, Game.resx, Math.ceil(Game.resx * Game.gameRatio), 'space1');
        this.space1.fixedToCamera = true;
        this.space2 = game.add.tileSprite(0, 0, Game.resx, Math.ceil(Game.resx * Game.gameRatio), 'space2');
        this.space2.fixedToCamera = true;
        this.space2.alpha = 0.4;
        var planet = game.add.sprite(500, 400, "planet-earth");
        planet.scale.set(0.4);
        planet.anchor.setTo(0.5, 0.5);
        var planet = game.add.sprite(1500, 600, "planet-desert");
        planet.scale.set(0.3);
        planet.anchor.setTo(0.5, 0.5);
    }
    Background.prototype.update = function (player) {
        if (!game.camera.atLimit.x) {
            this.space1.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed;
        }
        if (!game.camera.atLimit.y) {
            this.space1.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed;
        }
    };
    return Background;
})();
var Connection = (function () {
    function Connection(transporter) {
        if (window['WebSocket']) {
            console.log('Connecting');
            this.conn = new WebSocket("ws://arturg.co.uk:9090/ws");
            this.conn.onclose = function (evt) {
                console.log('Connection closed');
                this.conn.close();
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
})();
var MessageTransport = (function () {
    function MessageTransport(actionHandler) {
        console.log('Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }
    MessageTransport.prototype.resetConnection = function () {
        this.connection = new Connection(this);
    };
    MessageTransport.prototype.parse = function (messageData) {
        var data = JSON.parse(messageData);
        var message = Serializer.load(data);
        console.log('MessageTransport::parse - received message: ' + message.action + ' for ' + message.id);
        this.actionHandler.handleMessage(message);
    };
    MessageTransport.prototype.sendMessage = function (message) {
        console.log('MessageTransport::sendMessage - ' + message.action + ' to ' + message.id);
        var messageData = JSON.stringify(message.serialize());
        this.connection.sendMessage(messageData);
    };
    return MessageTransport;
})();
var ActionHandler = (function () {
    function ActionHandler() {
        this._score = 0;
        if (ActionHandler._instance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        ActionHandler._instance = this;
    }
    ActionHandler.getInstance = function () {
        return ActionHandler._instance;
    };
    ActionHandler.prototype.init = function () {
        console.log('ActionHandler::init');
        this.ships = new Group.Ship();
    };
    ActionHandler.prototype.createPlayer = function () {
        player = new Player();
        console.log(player);
        var loc = new Loc();
        loc.set(300, 300);
        var message = new Message();
        message.setId(playerId);
        message.logIn(loc, Properties.factory());
        transporter.sendMessage(message);
        var loc = new Loc();
        loc.set(400, 400);
        var message = new Message();
        message.setId('DUMMY');
        message.addPlayer(loc, Properties.factory('ai'));
        transporter.sendMessage(message);
    };
    ActionHandler.prototype.broadCast = function () {
        console.log('ActionHandler::broadCast');
        var message = new Message();
        message.setId(playerId);
        message.addPlayer(player.getShip().getLocation(), Properties.factory());
        transporter.sendMessage(message);
    };
    ActionHandler.prototype.getShips = function () {
        return this.ships;
    };
    ActionHandler.prototype.getUpdateGroups = function () {
        return this.ships;
    };
    ActionHandler.prototype.handleMessage = function (message) {
        console.log('ActionHandler::handleMessage - ' + message.action);
        if (message.action == 'login') {
            console.log('ActionHandler::handleMessage - ' + message.id + ' just logged in');
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
            if (message.id == playerId) {
                console.log('ActionHandler::handleMessage - oh it\'s us. take the ship');
                player.takeControllOver(ship);
            }
            else {
                console.log('ActionHandler::handleMessage - let it know where we are');
                this.broadCast();
            }
        }
        else if (message.action == 'create' && message.id != playerId) {
            console.log('ActionHandler::handleMessage - received broadcast for: ' + message.id);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
        }
        this.ships.forEach(function (ship) {
            ship.handleMessage(message);
        }, this);
    };
    ActionHandler.prototype.leftOfBody = function (b) {
        return b.x - b.halfWidth;
    };
    ActionHandler.prototype.rightOfBody = function (b) {
        return b.x + b.halfWidth;
    };
    ActionHandler.prototype.sortedCollide = function (game, arr) {
        var $this = this;
        arr.sort(function (a, b) {
            return $this.leftOfBody(a.body) - $this.leftOfBody(b.body);
        });
        for (var i = 0; i < arr.length; ++i) {
            var elem_i = arr[i];
            for (var j = i + 1; j < arr.length; ++j) {
                var elem_j = arr[j];
                if ($this.rightOfBody(elem_i.body) < $this.leftOfBody(elem_j.body)) {
                    break;
                }
                game.physics.arcade.collide(elem_i, elem_j);
            }
        }
    };
    ActionHandler._instance = new ActionHandler();
    return ActionHandler;
})();
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
            waitForSocketConnection(socket, callback);
        }
    }, 5);
}
function goFullScreen() {
    game.gofullScreen();
}
function handleIncorrect() {
    game.handleIncorrect();
}
function handleCorrect() {
    game.handleCorrect();
}
