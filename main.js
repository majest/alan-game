/// <reference path="../phaser/typescript/phaser.d.ts" />
//
// class ObjectControll {
//
//     // object
//     public object;
//
//     // object properties
//     public properties;
//
//     // current message
//     public message;
//
//     // object id
//     public id;
//
//     // data transporter
//     transporter: MessageTransport;
//
//     // stors the phaser game object
//     game;
//
//     text;
//
//     constructor(game, id) {
//         this.game = game;
//         this.id = id;
//         console.log('ObjectControll::constructor - id:' + id);
//     }
//
//     // set the transport object
//     setTransporter(transporter: MessageTransport) {
//         console.log('setting transporter');
//         console.log(transporter);
//         this.transporter = transporter;
//     }
//
//     sendMessage(message: Message) {
//     }
//
//     handleMessage(message: Message) {
//         console.log(message);
//         console.log('ObjectControll::handleMessage');
//         this.message = message;
//
//         this.properties = message.properties;
//
//         if (!this.object) {
//             console.log('Creating object');
//             this.create();
//
//         }
//
//         this.object.handleMessage(message);
//
//         if (this.message.location) {
//             this.updateState(this.message);
//         }
//     }
//
//     updateState(location: Loc) {
//
//         if (typeof location.rotation != 'undefined') {
//             this.object.x = location.x;
//             this.object.y = location.y;
//             this.object.rotation = location.rotation;
//             this.object.angle = location.angle;
//             this.object.body.velocity.x = location.velocityx;
//             this.object.body.velocity.y = location.velocityy;
//         }
//     }
//
//     resetMessage() {
//         this.message = null;
//     }
//
//     getObject() {
//         return this.object;
//     }
//
//     getRotation() {
//         return this.object.rotation;
//     }
//
//     setRotation(rotation) {
//         this.object.rotation = rotation;
//     }
//
//     getSpeed(): Number {
//         return Math.sqrt(Math.pow(this.object.body.velocity.x,2) + Math.pow(this.object.body.velocity.y,2));
//     }
//
//     getLocation() : Loc {
//         var loc =  new Loc(this.object.x, this.object.y);
//         loc.setState(this.getRotation(), this.getAngle(), this.object.body.velocity.x, this.object.body.velocity.y);
//         return loc;
//     }
//
//     getAngle() : number {
//         return this.object.angle;
//     }
//
//     create() {
//
//         if (!this.properties) {
//             console.error('Missing object properties');
//             return;
//         }
//         console.log('ObjectControll::create - Creating object at x:' + this.message.location.x + ', y:' + this.message.location.y);
//         //this.object = this.game.add.sprite(this.message.location.x, this.message.location.y, this.message.properties.object);
//
//         this.object = new Ship.Ship(this.game, this.message.location.x, this.message.location.y, this.id);
//         this.game.add.existing(this.object);
//         this.object.id = this.message.id;
//
//
//
//     }
//
// }
var Player = (function () {
    function Player(game, transporter) {
        this.game = game;
        this.transporter = transporter;
        this.game = game;
        this.transporter = transporter;
    }
    Player.prototype.takeControllOver = function (ship) {
        console.log('Player::takecontrollOver - taking ship id:' + ship.id);
        this.ship = ship;
        // handle click&move
        this.game.input.onDown.add(this.moveToPointer, this);
        // follow this player
        this.game.camera.follow(this.ship);
    };
    Player.prototype.moveToPointer = function (pointer) {
        if (!this.ship)
            return;
        // set the destination
        var message = new Message(this.ship.id);
        message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        message.setLocation(this.ship.getLocation());
        this.transporter.sendMessage(message);
    };
    Player.prototype.getShip = function () {
        return this.ship;
    };
    return Player;
})();
/// <reference path="../phaser/typescript/phaser.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ship;
(function (Ship_1) {
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship(game, x, y, id) {
            console.log('Ship::constructor - x,y' + x + ',' + y);
            _super.call(this, game, x, y, 'ship', 0);
            this.properties = new Properties();
            //game.add.existing(this);
            this.id = id;
            game.physics.enable(this, Phaser.Physics.ARCADE);
            //this.ship.body.setZeroRotation();
            //this.ship.body.allowRotation = true;
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
            this.body.angularDrag = 50;
            this.scale.setTo(0.5, 0.5);
            this.anchor.setTo(0.5, 0.5);
            this.addName();
        }
        Ship.prototype.update = function () {
            this.moveToLocation();
        };
        Ship.prototype.handleMessage = function (message) {
            console.log(playerId + ':Ship::handleMessage - action:' + message.action);
            // accept messages which are designated only for this ship
            if (message.id != this.id) {
                console.log(playerId + ':Ship::handleMessage I\'m ' + this.id + ' and this message is for: ' + message.id);
                return;
            }
            // handle destination at all times
            if (message.destination) {
                console.log(playerId + ':Ship::handleMessage - handling destination');
                console.log(message.destination);
                this.destination = message.destination;
            }
            else if (message.location && message.id != playerId) {
                console.log(playerId + ':Ship::handleMessage - handling location for ship ' + message.id);
            }
        };
        Ship.prototype.move = function () {
            if (!this.destination) {
                return;
            }
            // calcualte distance to target
            var distanceToTarget = parseFloat(this.game.physics.arcade.distanceToXY(this, this.destination.x, this.destination.y).toFixed(2));
            // finish processing the message once we have reached the target
            if (distanceToTarget < 8.0) {
                this.destination = null;
            }
            else {
                return this.game.physics.arcade.moveToXY(this, this.destination.x, this.destination.y, this.properties.speed);
            }
        };
        Ship.prototype.rotationSpeed = function (rotation) {
            if (rotation && this.rotation !== rotation) {
                // Calculate difference between the current angle and targetAngle
                var delta = rotation - this.rotation;
                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI)
                    delta -= Math.PI * 2;
                if (delta < -Math.PI)
                    delta += Math.PI * 2;
                if (delta > 0) {
                    this.angle += this.properties.turnRate;
                }
                else {
                    this.angle -= this.properties.turnRate;
                }
                var deltaAbs = parseFloat(Math.abs(delta).toFixed(2));
                var target = parseFloat(Math.abs(Phaser.Math.degToRad(this.properties.turnRate)).toFixed(2));
                // Just set angle to target angle if they are close
                if (deltaAbs <= target) {
                    this.rotation = rotation;
                }
            }
            this.body.velocity.x = Math.cos(this.rotation) * this.properties.speed;
            this.body.velocity.y = Math.sin(this.rotation) * this.properties.speed;
        };
        Ship.prototype.moveToLocation = function () {
            if (!this.destination) {
                return;
            }
            this.rotationSpeed(this.move());
            this.updateName();
        };
        Ship.prototype.addName = function () {
            console.log('Ship::addName');
            var style = { font: "11px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
            this.name = this.game.add.text(this.x, this.y, this.id, style);
            this.updateName();
        };
        Ship.prototype.updateName = function () {
            this.name.x = Math.floor(this.x + this.width / 2) - this.width + 10;
            this.name.y = Math.floor(this.y + this.height / 2) - this.height - 10;
        };
        Ship.prototype.getLocation = function () {
            var loc = new Loc(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            console.log(loc);
            console.log(this);
            return loc;
        };
        Ship.prototype.setLocation = function (loc) {
            this.rotation = loc.rotation;
            this.angle = loc.angle;
            this.body.velocity.x = loc.velocityx;
            this.body.velocity.y = loc.velocityy;
        };
        return Ship;
    })(Phaser.Sprite);
    Ship_1.Ship = Ship;
})(Ship || (Ship = {}));
var Group;
(function (Group) {
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship(game) {
            _super.call(this, game);
        }
        Ship.prototype.add = function (sprite) {
            _super.prototype.add.call(this, sprite);
        };
        return Ship;
    })(Phaser.Group);
    Group.Ship = Ship;
})(Group || (Group = {}));
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
        this.id = id;
    }
    Message.fromJson = function (json) {
        var message = new Message(json.id);
        message.action = json.action;
        if (json['destination']) {
            message.destination = Loc.fromJson(json['destination']);
        }
        if (json['location']) {
            message.location = Loc.fromJson(json['location']);
        }
        if (json['properties']) {
            message.properties = Properties.fromJson(json['properties']);
        }
        return message;
    };
    Message.prototype.addPlayer = function (location) {
        this.action = 'create';
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.logIn = function (location) {
        this.action = 'login';
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.setDestination = function (destination) {
        this.action = 'destination';
        this.destination = destination;
        this.properties = new Properties();
    };
    Message.prototype.setLocation = function (location) {
        this.action = 'location';
        this.location = location;
        this.properties = new Properties();
    };
    // setMovement(movement: Movement) {
    //     this.action = 'move';
    //     this.movement = movement;
    //     this.properties = new Properties();
    // }
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
        if (this.destination) {
            result['destination'] = this.destination.toJson();
        }
        // if (this.movement) {
        //     result['movement'] = this.movement.toJson();
        // }
        if (this.properties) {
            result["properties"] = this.properties.toJson();
        }
        if (this.location) {
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
        var loc = {
            "x": this.x,
            "y": this.y,
            "rotation": this.rotation,
            "velocityx": this.velocityx,
            "velocityy": this.velocityy
        };
        if (typeof this.angle != 'undefined') {
            loc['angle'] = this.angle;
        }
        if (typeof this.rotation != 'undefined') {
            loc['rotation'] = this.rotation;
        }
        if (typeof this.velocityx != 'undefined') {
            loc['velocityx'] = this.velocityx;
        }
        if (typeof this.velocityy != 'undefined') {
            loc['velocityy'] = this.velocityy;
        }
        return loc;
    };
    Loc.fromJson = function (json) {
        if (!json) {
            return null;
        }
        var loc = new Loc(json['x'], json['y']);
        if (json['velocityy']) {
            loc.velocityx = json['velocityy'];
        }
        if (json['velocityx']) {
            loc.velocityy = json['velocityx'];
        }
        if (json['rotation']) {
            loc.rotation = json['rotation'];
        }
        if (json['angle']) {
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
/// <reference path="phaser/typescript/phaser.d.ts" />
/// <reference path="objects/controll.ts"/>
/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>
var resx = 800;
var resy = 600;
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
        }
    };
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
        this.playerId = playerId;
        this.scene = new Scene(this.game);
        this.actionHandler = new ActionHandler(this.game, this.playerId);
        //new Planet(game, 0, 0, 0, 'planet-desert');
        this.transporter = new MessageTransport(this.actionHandler);
        this.actionHandler.setTransporter(this.transporter);
        this.actionHandler.createPlayer();
        //this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        // Keep original size
        // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
        //
        // Maintain aspect ratio
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.input.onDown.add(goFullScreen, this);
        this.ready = true;
    };
    Game.prototype.sortedCollide = function (game, arr) {
        arr.sort(function (a, b) {
            return leftOfBody(a.body) - leftOfBody(b.body);
        });
        for (var i = 0; i < arr.length; ++i) {
            var elem_i = arr[i];
            for (var j = i + 1; j < arr.length; ++j) {
                var elem_j = arr[j];
                if (rightOfBody(elem_i.body) < leftOfBody(elem_j.body)) {
                    break;
                }
                this.game.physics.arcade.collide(elem_i, elem_j);
            }
        }
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
        this.game.load.image('planet-earth', 'assets/planets/earth.png');
        this.game.load.image('planet-desert', 'assets/planets/desert.png');
    };
    // debug
    Game.prototype.render = function () {
        // addcamera info
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
        // add fps
        this.game.debug.text(this.game.time.fps + ' FPS', 740, 32);
        // add currents player sprite info
        // var currentPLayer = this.actionHandler.getPlayers().getCurrentPlayer();
        // if (currentPLayer) {
        //     //this.game.debug.spriteInfo(currentPLayer.ship, 32, 128);
        // }
    };
    //update the state
    Game.prototype.update = function () {
        if (!this.ready || this.actionHandler.getUpdateGroups().length == 0)
            return;
        this.game.physics.arcade.collide(this.actionHandler.getUpdateGroups());
        this.scene.update(this.actionHandler.getPlayer().getShip());
        this.actionHandler.getUpdateGroups().update();
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
        //planet.scale.set(scale);
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
        // do not handle current's player messages from outside
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
    function ActionHandler(game, playerId) {
        console.log(playerId + ':ActionHandler::constructor');
        this.game = game;
        this.playerId = playerId;
        this.ships = this.game.add.group();
    }
    ActionHandler.prototype.createPlayer = function () {
        this.player = new Player(this.game, this.transporter);
        var message = new Message(this.playerId);
        message.logIn(new Loc(300, 300));
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
    /**
    * Set the message transporter
    */
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
        // login detected
        if (message.action == 'login') {
            console.log(playerId + ':ActionHandler::handleMessage - ' + message.id + ' just logged in');
            var ship = new Ship.Ship(this.game, message.location.x, message.location.y, message.id);
            //var ship = new Phaser.Sprite(this.game, 100, 100, 'ship');
            this.game.add.existing(ship);
            this.ships.add(ship);
            // this is us, tale controll over the ship
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
        // handle message async, it will handle stuff like location and destination
        this.ships.forEach(function (ship) {
            ship.handleMessage(message);
        });
    };
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
    }, 5); // wait 5 milisecond for the connection...
}
function goFullScreen() {
    game.gofullScreen();
}
function leftOfBody(b) {
    return b.x - b.halfWidth;
}
function rightOfBody(b) {
    return b.x + b.halfWidth;
}
