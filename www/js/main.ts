/// <reference path="phaser/typescript/phaser.d.ts" />
/// <reference path="objects/controll.ts"/>
/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>


var game;
var firstRunLandscape;
var playerId;
var transporter;

class Game {

    connection;
    transporter;
    actionHandler;

    ready = false;
    // static variables
    public static gameRatio;
    public static resx: number = 800;

    constructor() {

        Game.gameRatio = window.innerWidth/window.innerHeight;
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

    // init the world
    create() {
        // console.log('Creating world');
        //
        // game.world.setBounds(0, 0, 20000000, 20000000);
        // game.physics.startSystem(Phaser.Physics.ARCADE);
        // //game.physics.p2.defaultRestitution = 0.0; // to jak sie statek odbija
        //
        //game.renderer.clearBeforeRender = false;
        //game.renderer.roundPixels = true;
        //
        // game.time.advancedTiming = true;
        // console.log('-------------------------------------------');
        // //  This will run in Canvas mode, so let's gain a little speed and display
        // //game.renderer.clearBeforeRender = false;
        // //game.renderer.roundPixels = true;
        //
        // this.actionHandler = ActionHandler.getInstance();
        // this.actionHandler.init();
        //
        // //new Planet(game, 0, 0, 0, 'planet-desert');
        // this.transporter = new MessageTransport(this.actionHandler);
        // this.actionHandler.setTransporter(this.transporter);
        // this.actionHandler.createPlayer();

        //game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

         // Keep original size
         // game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
         //
         // Maintain aspect ratio
        //game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

        //game.input.onDown.add(goFullScreen, this);
    }

    // preload
    preload() {



        //game.stage.disableVisibilityChange = true;
        //game.config.forceSetTimeOut = true;
        //var firstRunLandscape = game.scale.isGameLandscape;

        /* resize game */
        // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // game.scale.pageAlignHorizontally = true;
        // game.scale.pageAlignVertically = true;
        // game.scale.forceLandscape = true;
        // game.scale.parentIsWindow = true;
        // game.scale.refresh();

        // game.load.image('bullet', 'assets/bullets.png');
        // game.load.image('ship', 'assets/ships/fury.png');
        // game.load.image('dust', 'assets/pixel.png');
        // game.load.image('crosshair', 'assets/crosshair.png');
    }

    handleCorrect() {
        // if(!game.device.desktop){
        //     if(firstRunLandscape){
        //         gameRatio = window.innerWidth/window.innerHeight;
        //         game.width = Math.ceil(resx*gameRatio);
        //         game.height = Math.ceil(resy*gameRatio);;
        //         game.renderer.resize(game.width,game.height);
        //         //game.state.start("Play");
        //     }
        // //    document.getElementById("turn").style.display="none";
        // }
    }

    handleIncorrect() {
        // if(!game.device.desktop){
        //     gameRatio = window.innerWidth/window.innerHeight;
        //     game.width = Math.ceil(resx*gameRatio);
        //     game.height = Math.ceil(resy*gameRatio);;
        //     game.renderer.resize(game.width,game.height);
        // }
    }
    // debug



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
        game.debug.cameraInfo(game.camera, 32, 32);

        // add fps
        game.debug.text(game.time.fps + ' FPS', 400, 32 );
    }

    preload() {
        game.load.image('space1', 'assets/space1.jpg');
        game.load.image('space2', 'assets/space2.jpg');
        game.load.image('planet-earth', 'assets/planets/earth.png');
        game.load.image('planet-desert', 'assets/planets/desert.png');
        game.load.image('bullet', 'assets/bullets.png');
        game.load.image('ship', 'assets/ships/fury.png');
        game.load.image('dust', 'assets/pixel.png');
        game.load.image('crosshair', 'assets/crosshair.png');
    }
    create() {

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
    }

    //update the state
    update() {
        if (!this.ready || this.actionHandler.getUpdateGroups().length == 0) return;
        this.actionHandler.sortedCollide(game, this.actionHandler.getUpdateGroups().children);
        this.actionHandler.getUpdateGroups().update();
        this.background.update(this.actionHandler.getPlayer().getShip());
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
        this.space2.alpha = 0.4;

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
            this.space2.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed ;
        }

        if (!game.camera.atLimit.y) {
            this.space1.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed ;
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
        } else {
            console.log('No browser support');
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


class MessageTransport {

    connection;
    actionHandler: ActionHandler;

    constructor(actionHandler: ActionHandler) {
        console.log(playerId + ':Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }

    parse(messageData) {
        console.log(playerId + ':MessageTransport::parse');
        var data = JSON.parse(messageData);
        var message = Message.fromJson(data);

        // do not handle current's player messages from outside
        this.actionHandler.handleMessage(message);
    }

    sendMessage(message: Message) {
        console.log(playerId + ':MessageTransport::sendMessage');
        var messageData = JSON.stringify(message.toJson());
        this.connection.sendMessage(messageData);
    }
}


class ActionHandler {

    transporter: MessageTransport;
    player: Player;
    ships;
    playerId;
    game;

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
        console.log(playerId + ':ActionHandler::init');
        this.ships = new Group.Ship();
    }

    createPlayer() {
        this.player = new Player();

        var message = new Message(playerId);
        message.logIn(new Loc(300,300));
        transporter.sendMessage(message);

        var message = new Message('DUMMY');
        message.addPlayer(new Loc(400,300));
        transporter.sendMessage(message);
        //
        // var spr = game.add.group();
        // spr.create(300, 300, 'crosshair');
    }

    broadCast() {
        console.log(playerId + ':ActionHandler::broadCast');
        var message = new Message(playerId);
        message.addPlayer(this.player.getShip().getLocation());
        transporter.sendMessage(message);
    }

    getPlayer() {
        return this.player;
    }

    getShips() {
        return this.ships;
    }


    getUpdateGroups() {
        return this.ships;
    }

    handleMessage(message: Message) {

        console.log('ActionHandler::handleMessage - ' + message.action);
        // login detected
        if (message.action == 'login') {

            console.log(playerId + ':ActionHandler::handleMessage - ' + message.id + ' just logged in')
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            //var ship = new Phaser.Sprite(game, 100, 100, 'ship');
            game.add.existing(ship);
            this.ships.add(ship);

            // this is us, tale controll over the ship
            if (message.id == playerId) {
                console.log(playerId + ':ActionHandler::handleMessage - oh it\'s us. take the ship');
                this.player.takeControllOver(ship);

            // it's not me who logged in, I neeed to broadcast myself so they can see me
            } else {
                console.log(playerId + ':ActionHandler::handleMessage - let it know where we are');
                this.broadCast();
            }

        // broadcasted position when login action was called, don't add self again
        } else if (message.action == 'create' && message.id != playerId) {

            console.log(playerId + ':ActionHandler::handleMessage - received broadcast for: ' + message.id);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
        }


        // handle message async, it will handle stuff like location and destination
        this.ships.forEach(function(ship) {
            ship.handleMessage(message);
        });
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
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                if(callback != null){
                    callback();
                }
                return;

            } else {
                console.log("wait for connection...")
                waitForSocketConnection(socket, callback);
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
