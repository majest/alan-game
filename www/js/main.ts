/// <reference path="phaser/typescript/phaser.d.ts" />
/// <reference path="objects/controll.ts"/>
/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>
/// <reference path="objects/transport.ts"/>
var game;
var firstRunLandscape;
var playerId;
var transporter;
var player;
var gameinterface;

interface TransportHandler {

}

class Game {

    connection;
    transporter;
    actionHandler;

    ready = false;
    // static variables
    public static gameRatio;
    public static resx: number = 1000;

    game;

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

interface A extends Phaser {
  Plugin: any;
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

        game.load.image('spacestation1', 'assets/spacestations/spartanm.png');

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
    //    game.plugins.add(Phaser.Plugin.Debug);
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

        // var button = game.add.button(10, 10, 'button', this.fire, this);
        // button.scale.set(0.8);
        // button.fixedToCamera = true;
    }


    fire() {
    //    Ship.Broadcast.Fire(playerId);
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
        planet.scale.set(1);
        planet.anchor.setTo(0.5, 0.5);
        var planet = game.add.sprite(100000, 600, "planet-desert");
        planet.scale.set(0.7);
        planet.anchor.setTo(0.5, 0.5);

        var ss = game.add.sprite(1800, 400, "spacestation1");
        ss.scale.set(0.5);
        ss.anchor.setTo(0.5, 0.5);
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


class ActionHandler implements TransportHandler{

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
        loc.set(1400,400);

        var p = WeaponProperties.createProjectileTurret();
        var m = WeaponProperties.createMissileTurret();
        var wd = ItemProperties.createWarpDrive();
        var message = new Message();
        message.setId(playerId);
        message.logIn(loc, Properties.factory());
        message.addWeapon(p);
        message.addWeapon(m);
        //message.addItem(wd);
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

            console.log(message);
            console.log('ActionHandler::handleMessage - received broadcast for: ' + message.id + ' location x: ' + message.location.x + ' location y:' + + message.location.y);
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





function goFullScreen() {
    game.gofullScreen();
}

function handleIncorrect(){
    game.handleIncorrect();
}

function handleCorrect(){
    game.handleCorrect();
}
