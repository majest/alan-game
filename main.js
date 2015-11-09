var ObjectControll = (function () {
    function ObjectControll(game, id) {
        this.game = game;
        this.id = id;
    }
    // set the transport object
    ObjectControll.prototype.setTransporter = function (transporter) {
        console.log('setting transporter');
        console.log(transporter);
        this.transporter = transporter;
    };
    ObjectControll.prototype.sendMessage = function (message) {
    };
    ObjectControll.prototype.handleMessage = function (message) {
        console.log('ObjectControll::handleMessage');
        this.message = message;
        this.properties = message.properties;
        if (!this.object) {
            console.log('Creating object');
            this.create();
        }
        if (this.message.location) {
            this.updateState(this.message);
        }
    };
    ObjectControll.prototype.updateState = function (location) {
        if (typeof location.rotation != 'undefined') {
            this.object.x = location.x;
            this.object.y = location.y;
            this.object.rotation = location.rotation;
            this.object.angle = location.angle;
            this.object.body.velocity.x = location.velocityx;
            this.object.body.velocity.y = location.velocityy;
        }
    };
    ObjectControll.prototype.resetMessage = function () {
        this.message = null;
    };
    ObjectControll.prototype.getObject = function () {
        return this.object;
    };
    ObjectControll.prototype.getRotation = function () {
        return this.object.rotation;
    };
    ObjectControll.prototype.setRotation = function (rotation) {
        this.object.rotation = rotation;
    };
    ObjectControll.prototype.getSpeed = function () {
        return Math.sqrt(Math.pow(this.object.body.velocity.x, 2) + Math.pow(this.object.body.velocity.y, 2));
    };
    ObjectControll.prototype.getLocation = function () {
        var loc = new Loc(this.object.x, this.object.y);
        loc.setState(this.getRotation(), this.getAngle(), this.object.body.velocity.x, this.object.body.velocity.y);
        return loc;
    };
    ObjectControll.prototype.getAngle = function () {
        return this.object.angle;
    };
    ObjectControll.prototype.moveToLocation = function () {
        if (!this.message || !this.message.hasDestination()) {
            return;
        }
        var movement = this.message.movement;
        var destination = this.message.destination;
        var x = destination.x;
        var y = destination.y;
        // calcualte distance to target
        var distanceToTarget = parseFloat(this.game.physics.arcade.distanceToXY(this.object, x, y).toFixed(2));
        // finish processing the message once we have reached the target
        if (distanceToTarget < 8.0) {
            this.resetMessage();
        }
        // if the destiantion is Set
        // and movement is not finished (needs to continue performing movement untill end)
        // or we are not moving and movement is finished
        if (destination.isSet() && (!movement.movementFinished || (movement.movementFinished && !movement.moving))) {
            var rotation = this.game.physics.arcade.moveToXY(this.object, x, y, this.properties.speed);
            if (this.getRotation() !== rotation && (!movement.rotationFinished || (movement.rotationFinished && !movement.rotating))) {
                // Calculate difference between the current angle and targetAngle
                var delta = rotation - this.getRotation();
                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI)
                    delta -= Math.PI * 2;
                if (delta < -Math.PI)
                    delta += Math.PI * 2;
                if (delta > 0) {
                    this.object.angle += this.properties.turnRate;
                }
                else {
                    this.object.angle -= this.properties.turnRate;
                }
                var deltaAbs = parseFloat(Math.abs(delta).toFixed(2));
                var target = parseFloat(Math.abs(this.game.math.degToRad(this.properties.turnRate)).toFixed(2));
                // Just set angle to target angle if they are close
                if (deltaAbs <= target) {
                    // modify the angle
                    this.setRotation(rotation);
                    movement.finishRotation();
                }
            }
            this.object.body.velocity.x = Math.cos(this.object.rotation) * this.properties.speed;
            this.object.body.velocity.y = Math.sin(this.object.rotation) * this.properties.speed;
        }
    };
    ObjectControll.prototype.create = function () {
        if (!this.properties) {
            console.error('Missing object properties');
            return;
        }
        console.log('ObjectControll::create - Creating object at x:' + this.message.location.x + ', y:' + this.message.location.y);
        this.object = this.game.add.sprite(this.message.location.x, this.message.location.y, this.message.properties.object);
        this.object.id = this.message.id;
        this.game.physics.enable(this.object, Phaser.Physics.ARCADE);
        //this.ship.body.setZeroRotation();
        //this.ship.body.allowRotation = true;
        this.object.body.drag.set(this.properties.breakingForce);
        this.object.body.maxVelocity.set(this.properties.speed);
        this.object.anchor.setTo(0.5, 0.5);
        //this.ship.body.maxAngular = 500;
        this.object.body.angularDrag = 50;
        this.object.rotation = 0;
        this.object.angle = 0;
        this.object.scale.setTo(0.5, 0.5);
    };
    ObjectControll.prototype.setProperties = function (properties) {
        this.properties = properties;
    };
    return ObjectControll;
})();
/// <reference path="../main.ts"/>
/// <reference path="./controll.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Phaser;
var accelerateToPointer;
//
// class Input {
//     public left: boolean = false;
//     public right: boolean = false;
//     public up: boolean = false;
//     public fire: boolean = false;
//
//     load(input: Input) {
//         this.left = input.left;
//         this.right = input.right;
//         this.up = input.up;
//         this.fire = input.fire;
//     }
//
//     compare(input: Input) {
//         return (
//             this.left != input.left ||
//             this.right != input.right ||
//             this.up != input.up ||
//             this.fire != input.fire
//         );
//     }
// }
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.apply(this, arguments);
        this.alive = true;
        // defines whether the player is the current player
        this.currentPlayer = false;
    }
    Player.prototype.isCurrentPlayer = function () {
        if (this.currentPlayer) {
            return true;
        }
        return false;
    };
    Player.prototype.setCurrentPlayer = function () {
        // set that this object is the current player
        this.currentPlayer = true;
        // handle click&move
        this.game.input.onDown.add(this.moveToPointer, this);
        // follow this player
        this.game.camera.follow(this.object);
    };
    Player.prototype.moveToPointer = function (pointer) {
        // set the destination
        var message = new Message(this.id);
        message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        message.setLocation(this.getLocation());
        this.transporter.sendMessage(message);
    };
    Player.prototype.update = function () {
        this.moveToLocation();
    };
    return Player;
})(ObjectControll);
/**
* Message container
* has action which defines the type of the message
*/
var Properties = (function () {
    function Properties() {
        // how fast ship is turning
        this.turnRate = 7;
        this.speed = 80;
        this.breakingForce = 80;
        this.object = 'ship';
    }
    Properties.prototype.toJson = function () {
        return {
            "turnRate": this.turnRate,
            "speed": this.speed,
            "breakingForce": this.breakingForce,
            "object": this.object
        };
    };
    Properties.fromJson = function (json) {
        var properties = new Properties();
        properties.turnRate = json['turnRate'];
        properties.speed = json['speed'];
        properties.breakingForce = json['breakingForce'];
        properties.object = json['object'];
        return properties;
    };
    return Properties;
})();
var Message = (function () {
    function Message(id) {
        this.action = [];
        this.login = false;
        this.id = id;
    }
    Message.fromJson = function (json) {
        var message = new Message(json.id);
        message.action = json.action;
        if (json['destination']) {
            message.destination = Loc.fromJson(json['destination']);
        }
        if (json['movement']) {
            message.movement = Movement.fromJson(json['movement']);
        }
        message.location = Loc.fromJson(json['location']);
        if (json['properties']) {
            message.properties = Properties.fromJson(json['properties']);
        }
        if (json['login']) {
            message.login = json['login'];
        }
        return message;
    };
    Message.prototype.containsAction = function (action) {
        if (this.action.indexOf(action) > -1) {
            return true;
        }
        return false;
    };
    Message.prototype.addPlayer = function (location) {
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.logIn = function () {
        this.login = true;
    };
    Message.prototype.shouldLogIn = function () {
        return this.login;
    };
    Message.prototype.setDestination = function (destination) {
        this.action.push('destination');
        this.destination = destination;
        this.movement = new Movement();
        this.properties = new Properties();
    };
    Message.prototype.setLocation = function (location) {
        this.action.push('location');
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.setMovement = function (movement) {
        this.action.push('move');
        this.movement = movement;
        this.properties = new Properties();
    };
    Message.prototype.hasDestination = function () {
        if (typeof this.destination !== 'undefined') {
            return true;
        }
        return false;
    };
    Message.prototype.toJson = function () {
        var result = {
            "id": this.id,
            "action": this.action
        };
        if (this.login) {
            result['login'] = this.login;
        }
        if (this.destination) {
            result['destination'] = this.destination.toJson();
        }
        if (this.movement) {
            result['movement'] = this.movement.toJson();
        }
        if (this.properties) {
            result["properties"] = this.properties.toJson();
        }
        if (this.properties) {
            result["location"] = this.location.toJson();
        }
        return result;
    };
    return Message;
})();
/**
* Generic location class containg coordinates
*/
var Loc = (function () {
    function Loc(x, y) {
        this.x = x;
        this.y = y;
    }
    Loc.prototype.reset = function () {
        this.x = null;
        this.y = null;
    };
    Loc.prototype.isSet = function () {
        if (this.x && this.y) {
            return true;
        }
        return false;
    };
    Loc.prototype.setState = function (rotation, angle, velocityx, velocityy) {
        this.rotation = rotation;
        this.angle = angle;
        this.velocityx = velocityx;
        this.velocityy = velocityy;
    };
    Loc.prototype.toJson = function () {
        return {
            "x": this.x,
            "y": this.y,
            "rotation": this.rotation,
            "angle": this.angle,
            "velocityx": this.velocityx,
            "velocityy": this.velocityy
        };
    };
    Loc.fromJson = function (json) {
        if (!json) {
            return null;
        }
        var loc = new Loc(json['x'], json['y']);
        if (json['angle'] && json['velocityy'] && json['velocityx'] && json['angle']) {
            loc.velocityx = json['velocityy'];
            loc.velocityy = json['velocityx'];
            loc.rotation = json['rotation'];
            loc.angle = json['angle'];
        }
        return loc;
    };
    return Loc;
})();
/**
 Defines whether movement occurs
**/
var Movement = (function () {
    function Movement() {
        this.rotationFinished = false;
        this.movementFinished = false;
        this.moving = false;
        this.rotating = false;
    }
    Movement.prototype.finishMovement = function () {
        this.moving = false;
        this.movementFinished = true;
    };
    Movement.prototype.finishRotation = function () {
        this.rotating = false;
        this.rotationFinished = true;
    };
    Movement.prototype.toJson = function () {
        return {
            "rotationFinished": this.rotationFinished,
            "movementFinished": this.movementFinished,
            "moving": this.moving,
            "rotating": this.rotating
        };
    };
    Movement.fromJson = function (json) {
        var movement = new Movement();
        movement.rotating = json['rotating'];
        movement.rotationFinished = json['rotationFinished'];
        movement.movementFinished = json['movementFinished'];
        movement.moving = json['moving'];
        return movement;
    };
    return Movement;
})();
/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>
var Game = (function () {
    function Game() {
        this.ready = false;
        this.game = new Phaser.Game(800, 600, Phaser.WEBGL, 'phaser', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });
    }
    // init the world
    Game.prototype.create = function () {
        console.log('Creating world');
        this.game.world.setBounds(0, 0, 20000000, 20000000);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        //game.physics.p2.defaultRestitution = 0.0; // to jak sie statek odbija
        this.game.renderer.clearBeforeRender = false;
        //this.game.renderer.roundPixels = true;
        this.game.time.advancedTiming = true;
        //  This will run in Canvas mode, so let's gain a little speed and display
        //game.renderer.clearBeforeRender = false;
        //game.renderer.roundPixels = true;
        var playerId = Math.random() + '';
        this.playerId = playerId;
        this.actionHandler = new ActionHandler(this.game, this.playerId);
        this.scene = new Scene(this.game);
        //new Planet(game, 0, 0, 0, 'planet-desert');
        this.transporter = new MessageTransport(this.actionHandler);
        this.actionHandler.setTransporter(this.transporter);
        this.actionHandler.createPlayer();
        this.ready = true;
    };
    // preload
    Game.prototype.preload = function () {
        this.game.stage.disableVisibilityChange = true;
        this.game.config.forceSetTimeOut = true;
        this.game.load.image('space1', 'assets/space1.jpg');
        this.game.load.image('space2', 'assets/space2.jpg');
        this.game.load.image('bullet', 'assets/bullets.png');
        this.game.load.image('ship', 'assets/ships/fury.png');
        this.game.load.image('dust', 'assets/pixel.png');
        this.game.load.image('planet-desert', 'assets/planets/desert.png');
    };
    // debug
    Game.prototype.render = function () {
        // addcamera info
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
        // add fps
        this.game.debug.text(this.game.time.fps + ' FPS', 740, 32);
        // add currents player sprite info
        var currentPLayer = this.actionHandler.getPlayers().getCurrentPlayer();
        if (currentPLayer) {
        }
    };
    //update the state
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
        this.space1 = this.game.add.tileSprite(0, 0, 800, 600, 'space1');
        this.space1.fixedToCamera = true;
        this.space2 = this.game.add.tileSprite(0, 0, 800, 600, 'space2');
        this.space2.fixedToCamera = true;
        this.space2.alpha = 0.3;
    }
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
        // do not handle current's player messages from outside
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
        message.addPlayer(new Loc(400, 400));
        this.transporter.sendMessage(message);
        var message = new Message(this.playerId);
        message.logIn();
        this.transporter.sendMessage(message);
    };
    /**
    * Set the message transporter
    */
    ActionHandler.prototype.setTransporter = function (transporter) {
        console.log('ActionHandler::setTransporter');
        this.transporter = transporter;
    };
    ActionHandler.prototype.getPlayers = function () {
        return this.players;
    };
    ActionHandler.prototype.handleMessage = function (message) {
        console.log('ActionHandler::handleMessage');
        // get the player by id
        var player = this.players.getPlayer(message.id);
        // if could not found player, create new one
        // and add to list
        if (!player) {
            console.log('ActionHandler::handleMessage - creating new player, id:' + message.id);
            player = new Player(this.game, message.id);
            this.players.add(message.id, player);
        }
        // log in player if required
        console.log(this.playerId + ' ' + message.id);
        if (message.shouldLogIn() && parseFloat(this.playerId) === parseFloat(message.id)) {
            console.log('ActionHandler::handleMessage - player logged in');
            player.setCurrentPlayer();
            player.setTransporter(this.transporter);
        }
        // allow controll to process the message
        //console.log('Sending message (actions: ' + message.action.join(',') + ') to player: ' + message.id);
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
    }, 5); // wait 5 milisecond for the connection...
}
var game = new Game();
