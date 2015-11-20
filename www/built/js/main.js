var resx = 1280;
var resy = 800;
var game;
var firstRunLandscape;
var playerId;
var gameRatio;
var Game = (function () {
    function Game() {
        this.ready = false;
        this.fullScreenEnabled = false;
        gameRatio = window.innerWidth / window.innerHeight;
        this.game = new Phaser.Game(Math.ceil(resx * gameRatio), resy, Phaser.WEBGL, 'phaser', {
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
        }
    };
    Game.prototype.create = function () {
        console.log('Creating world');
        this.game.world.setBounds(0, 0, 20000000, 20000000);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.renderer.clearBeforeRender = false;
        this.game.time.advancedTiming = true;
        this.playerId = playerId;
        this.scene = new Scene(this.game);
        this.actionHandler = ActionHandler.getInstance();
        this.actionHandler.init(this.game, this.playerId);
        this.transporter = new MessageTransport(this.actionHandler);
        this.actionHandler.setTransporter(this.transporter);
        this.actionHandler.createPlayer();
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.input.onDown.add(goFullScreen, this);
        this.ready = true;
    };
    Game.prototype.preload = function () {
        firstRunLandscape = this.game.scale.isGameLandscape;
        console.log('=========== firstRunLandscape' + firstRunLandscape + '==================');
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.stage.disableVisibilityChange = true;
        this.game.config.forceSetTimeOut = true;
        this.game.scale.forceOrientation(false, true);
        this.game.scale.enterIncorrectOrientation.add(handleIncorrect);
        this.game.scale.leaveIncorrectOrientation.add(handleCorrect);
        this.game.load.image('space1', 'assets/space1.jpg');
        this.game.load.image('space2', 'assets/space2.jpg');
        this.game.load.image('bullet', 'assets/bullets.png');
        this.game.load.image('ship', 'assets/ships/fury.png');
        this.game.load.image('dust', 'assets/pixel.png');
        this.game.load.image('planet-earth', 'assets/planets/earth.png');
        this.game.load.image('planet-desert', 'assets/planets/desert.png');
        this.game.load.image('crosshair', 'assets/crosshair.png');
    };
    Game.prototype.handleCorrect = function () {
        if (!this.game.device.desktop) {
            if (firstRunLandscape) {
                gameRatio = window.innerWidth / window.innerHeight;
                this.game.width = Math.ceil(resx * gameRatio);
                this.game.height = Math.ceil(resy * gameRatio);
                ;
                this.game.renderer.resize(this.game.width, this.game.height);
            }
        }
    };
    Game.prototype.handleIncorrect = function () {
    };
    Game.prototype.render = function () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
        this.game.debug.text(this.game.time.fps + ' FPS', 740, 32);
    };
    Game.prototype.update = function () {
        if (!this.ready || this.actionHandler.getUpdateGroups().length == 0)
            return;
        this.actionHandler.sortedCollide(this.game, this.actionHandler.getUpdateGroups().children);
        this.scene.update(this.actionHandler.getPlayer().getShip());
        this.actionHandler.getUpdateGroups().update();
    };
    return Game;
})();
var Scene = (function () {
    function Scene(game) {
        this.game = game;
        this.space1 = this.game.add.tileSprite(0, 0, Math.ceil(resx * gameRatio), resy, 'space1');
        this.space1.fixedToCamera = true;
        this.space2 = this.game.add.tileSprite(0, 0, Math.ceil(resx * gameRatio), resy, 'space2');
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
        console.log(message);
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
    ActionHandler.prototype.init = function (game, playerId) {
        console.log(playerId + ':ActionHandler::init');
        this.game = game;
        this.playerId = playerId;
        this.ships = new Group.Ship(this.game);
    };
    ActionHandler.prototype.createPlayer = function () {
        this.player = new Player(this.game, this.transporter);
        var message = new Message(this.playerId);
        message.logIn(new Loc(300, 300));
        this.transporter.sendMessage(message);
        var message = new Message('DUMMY');
        message.addPlayer(new Loc(400, 300));
        this.transporter.sendMessage(message);
    };
    ActionHandler.prototype.broadCast = function () {
        console.log(playerId + ':ActionHandler::broadCast');
        var message = new Message(this.playerId);
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
        console.log(message);
        if (message.action == 'login') {
            console.log(playerId + ':ActionHandler::handleMessage - ' + message.id + ' just logged in');
            var ship = new Ship.Ship(this.game, message.location.x, message.location.y, message.id);
            this.game.add.existing(ship);
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
            var ship = new Ship.Ship(this.game, message.location.x, message.location.y, message.id);
            this.game.add.existing(ship);
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
                $this.game.physics.arcade.collide(elem_i, elem_j);
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
