/// <reference path="phaser/typescript/phaser.d.ts" />
/// <reference path="objects/controll.ts"/>
/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>

var game;
var firstRunLandscape;
var playerId;
var transporter;
var player;
var gameinterface;

class Game {

    connection;
    transporter;
    actionHandler;

    ready = false;
    // static variables
    public static gameRatio;
    public static resx: number = 1000;

    constructor() {

        Game.gameRatio = window.innerWidth/window.innerHeight;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;

        console.log('==========  ratio: ' + Game.gameRatio);
        console.log('==========  width: ' + Game.resx);

        console.log('==========  window width: ' + winWidth);
        console.log('==========  window height: ' + winHeight);


        game = new Phaser.Game(Game.resx, Math.ceil(Game.resx / Game.gameRatio), Phaser.CANVAS, 'phaser');
        //game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'phaser');


        game.state.add('setup', Setup);
        game.state.start('setup');


    }

}


class Setup {

    actionHandler;
    ready;
    background;

    render() {


        // add currents player sprite info
        // var currentPLayer = this.actionHandler.getPlayers().getCurrentPlayer();
        // if (currentPLayer) {
        //     //game.debug.spriteInfo(currentPLayer.ship, 32, 128);
        // }
        // addcamera info
        //game.debug.cameraInfo(game.camera, 32, 32);

        // add fps

        game.debug.text(game.time.fps + ' FPS', 400, 32 );
    }

    preload() {

        game.load.image('space1', 'assets/space1.jpg');
        game.load.image('space2', 'assets/space2.jpg');
        game.load.image('planet-earth', 'assets/planets/earth.png');
        game.load.image('planet-desert', 'assets/planets/desert.png');
        game.load.image('bullet', 'assets/bullets.png');
        game.load.image('missile', 'assets/missile3.png');
        game.load.image('ship', 'assets/ships/fury.png');
        game.load.image('dust', 'assets/pixel.png');
        game.load.image('shield', 'assets/shield-1.png');
        game.load.image('crosshair', 'assets/crosshair2.png');
        game.load.image('button', 'assets/shield-1.png');
        game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64);
        game.load.spritesheet('thruster', 'assets/thruster.png', 50, 178);
        game.forceSingleUpdate = true;

        game.load.image('smoke', 'assets/particles/smoke-puff.png');


    }
    create() {

        console.log('Creating world');
        game.plugins.add(Phaser.Plugin.Debug);
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

        var button = game.add.button(10, 10, 'button', this.fire, this);
        button.scale.set(1);
        button.fixedToCamera = true;



    }

    fire() {
        player.ship.sendFire();
    }

    //update the state
    update() {

        var groupOfShips = this.actionHandler.getUpdateGroups()

        if (!this.ready || groupOfShips.length == 0) return;

        this.actionHandler.sortedCollide(game, groupOfShips.children);

        if (typeof groupOfShips != 'undefined') {
            groupOfShips.update();
        }

        if (player.ship.alive) {
            this.background.update(player.getShip());
        }
    }

}

class Background {

    space1;
    space2;

    constructor() {

        this.space1 = game.add.tileSprite(0, 0, Game.resx, Math.ceil(Game.resx * Game.gameRatio), 'space1');
        this.space1.fixedToCamera = true;

        this.space2 = game.add.tileSprite(0, 0, Game.resx, Math.ceil(Game.resx * Game.gameRatio), 'space2');
        this.space2.fixedToCamera = true;
        this.space2.alpha = 0.5;

        var planet = game.add.sprite(500, 400, "planet-earth");
        planet.scale.set(0.4);
        planet.anchor.setTo(0.5, 0.5);
        var planet = game.add.sprite(1500, 600, "planet-desert");
        planet.scale.set(0.3);
        planet.anchor.setTo(0.5, 0.5);
        //planet.scale.set(scale);
    }

    update(player: any) {
        if (!game.camera.atLimit.x) {
            this.space1.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed * 0.6;
        }

        if (!game.camera.atLimit.y) {
            this.space1.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.6;
        }
    }
}

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
//
// String.prototype.hexEncode = function(){
//     var hex, i;
//
//     var result = "";
//     for (i=0; i<this.length; i++) {
//         hex = this.charCodeAt(i).toString(16);
//         result += ("000"+hex).slice(-4);
//     }
//
//     return result
// }
//
// String.prototype.hexDecode = function(){
//     var j;
//     var hexes = this.match(/.{1,4}/g) || [];
//     var back = "";
//     for(j = 0; j<hexes.length; j++) {
//         back += String.fromCharCode(parseInt(hexes[j], 16));
//     }
//
//     return back;
// }

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


class ActionHandler {

    transporter: MessageTransport;
    ships : Group.Ship;
    playerId;
    game;
    properties;

    private static _instance:ActionHandler = new ActionHandler();

    private _score:number = 0;

    constructor() {
        if(ActionHandler._instance){
         throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        ActionHandler._instance = this;
    }

    public static getInstance():ActionHandler
    {
        return ActionHandler._instance;
    }

    init() {
        console.log('ActionHandler::init');
        this.ships = new Group.Ship();
    }

    createPlayer() {
        player = new Player();
        console.log(player);

        var loc = new Loc();
        loc.set(300,300);

        var p = WeaponProperties.createProjectileTurret();
        var m = WeaponProperties.createMissileTurret();
        var message = new Message();
        message.setId(playerId);
        message.logIn(loc, Properties.factory());
        message.addWeapon(p);
        message.addWeapon(m);

        transporter.sendMessage(message);


        var loc = new Loc();
        loc.set(400,400);

        var message = new Message();
        message.setId('DUMMY');
        message.addPlayer(loc, Properties.factory('ai'));
        transporter.sendMessage(message);
    }

    broadCast() {
        console.log('ActionHandler::broadCast');
        var message = new Message();
        message.setId(playerId);
        message.addPlayer(player.getShip().getLocation(), player.getShip().getProperties());
        transporter.sendMessage(message);
    }

    getShips() {
        return this.ships;
    }


    getUpdateGroups() : Group.Ship {
        return this.ships;
    }

    handleMessage(message: Message) {

        console.log('ActionHandler::handleMessage - ' + message.action);
        // login detected
        if (message.action == 'login') {

            console.log('ActionHandler::handleMessage - ' + message.id + ' just logged in')
            console.log(message);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            //var ship = new Phaser.Sprite(game, 100, 100, 'ship');
            game.add.existing(ship);
            this.ships.add(ship);

            // this is us, tale controll over the ship
            if (message.id == playerId) {
                console.log('ActionHandler::handleMessage - oh it\'s us. take the ship');
                player.takeControllOver(ship);

            // it's not me who logged in, I neeed to broadcast myself so they can see me
            } else {
                console.log('ActionHandler::handleMessage - let it know where we are');
                this.broadCast();
            }

        // broadcasted position when login action was called, don't add self again
        } else if (message.action == 'create' && message.id != playerId) {

            console.log('ActionHandler::handleMessage - received broadcast for: ' + message.id);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
        }


        // handle message async, it will handle stuff like location and destination
        this.ships.forEach((ship) => {
            ship.handleMessage(message);
        }, this);
    }

    leftOfBody(b) {
        return b.x - b.halfWidth
    }
    rightOfBody(b) {
        return b.x + b.halfWidth
    }

    sortedCollide(game, arr) {

        var $this = this;
        arr.sort(function(a,b) {
            return $this.leftOfBody(a.body) - $this.leftOfBody(b.body);
        })
        for (var i = 0; i < arr.length; ++i){
            var elem_i = arr[i]

            for (var j = i + 1; j < arr.length; ++j) {
                var elem_j = arr[j]
                if ($this.rightOfBody(elem_i.body) < $this.leftOfBody(elem_j.body)) {
                    break;
                }
                game.physics.arcade.collide(elem_i, elem_j)
            }
        }
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



function goFullScreen() {
    game.gofullScreen();
}

function handleIncorrect(){
    game.handleIncorrect();
}

function handleCorrect(){
    game.handleCorrect();
}
