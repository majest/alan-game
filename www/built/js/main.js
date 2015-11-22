var game;
var firstRunLandscape;
var playerId;
var Game = (function () {
    function Game() {
        this.ready = false;
        Game.gameRatio = window.innerWidth / window.innerHeight;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        console.log('==========  ratio: ' + Game.gameRatio);
        console.log('==========  width: ' + Game.resx);
        console.log('==========  height: ' + Game.resy);
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
    Game.resx = 800;
    return Game;
})();
var Setup = (function () {
    function Setup() {
    }
    Setup.prototype.render = function () {
        game.debug.cameraInfo(game.camera, 32, 32);
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
        game.load.image('crosshair', 'assets/crosshair.png');
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
        this.transporter = new MessageTransport(this.actionHandler);
        this.actionHandler.setTransporter(this.transporter);
        this.actionHandler.createPlayer();
        this.ready = true;
    };
    Setup.prototype.update = function () {
        if (!this.ready || this.actionHandler.getUpdateGroups().length == 0)
            return;
        this.actionHandler.sortedCollide(game, this.actionHandler.getUpdateGroups().children);
        this.actionHandler.getUpdateGroups().update();
        this.background.update(this.actionHandler.getPlayer().getShip());
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
        console.log(playerId + ':Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }
    MessageTransport.prototype.parse = function (messageData) {
        console.log(playerId + ':MessageTransport::parse');
        var data = JSON.parse(messageData);
        var message = Message.fromJson(data);
        this.actionHandler.handleMessage(message);
    };
    MessageTransport.prototype.sendMessage = function (message) {
        console.log(playerId + ':MessageTransport::sendMessage');
        var messageData = JSON.stringify(message.toJson());
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
        console.log(playerId + ':ActionHandler::init');
        this.ships = new Group.Ship(game);
    };
    ActionHandler.prototype.createPlayer = function () {
        this.player = new Player(game, this.transporter);
        var message = new Message(playerId);
        message.logIn(new Loc(300, 300));
        this.transporter.sendMessage(message);
        var message = new Message('DUMMY');
        message.addPlayer(new Loc(400, 300));
        this.transporter.sendMessage(message);
    };
    ActionHandler.prototype.broadCast = function () {
        console.log(playerId + ':ActionHandler::broadCast');
        var message = new Message(playerId);
        message.addPlayer(this.player.getShip().getLocation());
        this.transporter.sendMessage(message);
    };
    ActionHandler.prototype.getPlayer = function () {
        return this.player;
    };
    ActionHandler.prototype.getShips = function () {
        return this.ships;
    };
    ActionHandler.prototype.setTransporter = function (transporter) {
        console.log(playerId + ':ActionHandler::setTransporter');
        this.transporter = transporter;
    };
    ActionHandler.prototype.getUpdateGroups = function () {
        return this.ships;
    };
    ActionHandler.prototype.handleMessage = function (message) {
        console.log('ActionHandler::handleMessage - ' + message.action);
        if (message.action == 'login') {
            console.log(playerId + ':ActionHandler::handleMessage - ' + message.id + ' just logged in');
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
            if (message.id == playerId) {
                console.log(playerId + ':ActionHandler::handleMessage - oh it\'s us. take the ship');
                this.player.takeControllOver(ship);
            }
            else {
                console.log(playerId + ':ActionHandler::handleMessage - let it know where we are');
                this.broadCast();
            }
        }
        else if (message.action == 'create' && message.id != playerId) {
            console.log(playerId + ':ActionHandler::handleMessage - received broadcast for: ' + message.id);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
        }
        this.ships.forEach(function (ship) {
            ship.handleMessage(message);
        });
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
    setTimeout(function () {
        if (socket.readyState === 1) {
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
function handleIncorrect() {
    game.handleIncorrect();
}
function handleCorrect() {
    game.handleCorrect();
}
