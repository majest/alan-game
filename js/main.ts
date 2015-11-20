/// <reference path="phaser/typescript/phaser.d.ts" />
/// <reference path="objects/controll.ts"/>
/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>


var resx: number = 640;
var resy: number = 640;
var game;
var firstRunLandscape;
var playerId;
var gameRatio;


class Game {

    ready: boolean = false;
    game;
    player;
    space;

    playerId;

    connection;
    transporter;
    actionHandler;

    scene;

    fullScreenEnabled: boolean = false;

    constructor() {
        gameRatio = window.innerWidth/window.innerHeight;
        this.game = new Phaser.Game(Math.ceil(resx*gameRatio), resy, Phaser.WEBGL, 'phaser', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });
    }

    gofullScreen() {
        if (this.game.scale.isFullScreen)
        {
            //this.game.scale.stopFullScreen();
        }
        else
        {
            //this.game.scale.startFullScreen(true);
        }
    }

    // init the world
    create() {
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
        this.actionHandler = ActionHandler.getInstance();
        this.actionHandler.init(this.game, this.playerId);



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
    }



    // preload
    preload() {
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
    }

    handleCorrect() {
        if(!this.game.device.desktop){
            if(firstRunLandscape){
                gameRatio = window.innerWidth/window.innerHeight;
                this.game.width = Math.ceil(resx*gameRatio);
                this.game.height = resy;
                this.game.renderer.resize(this.game.width,this.game.height);
                this.game.state.start("Play");
            }
        //    document.getElementById("turn").style.display="none";
        }
    }

    handleIncorrect() {
        if(!this.game.device.desktop){
        //    document.getElementById("turn").style.display="block";
        }
    }
    // debug
    render() {

        // addcamera info
        this.game.debug.cameraInfo(this.game.camera, 32, 32);

        // add fps
        this.game.debug.text(this.game.time.fps + ' FPS', 740, 32 );

        // add currents player sprite info
        // var currentPLayer = this.actionHandler.getPlayers().getCurrentPlayer();
        // if (currentPLayer) {
        //     //this.game.debug.spriteInfo(currentPLayer.ship, 32, 128);
        // }
    }

    //update the state
    update() {
        if (!this.ready || this.actionHandler.getUpdateGroups().length == 0) return;
        this.actionHandler.sortedCollide(this.game, this.actionHandler.getUpdateGroups().children);

        this.scene.update(this.actionHandler.getPlayer().getShip());
        this.actionHandler.getUpdateGroups().update();
    }




}

class Scene {

    space1;
    space2;

    constructor(private game: any) {
        this.space1 = this.game.add.tileSprite(0, 0, Math.ceil(resx*gameRatio), resy, 'space1');
        this.space1.fixedToCamera = true;

        this.space2 = this.game.add.tileSprite(0, 0, Math.ceil(resx*gameRatio), resy, 'space2');
        this.space2.fixedToCamera = true;
        this.space2.alpha = 0.4;

        this.createPlanets();
    }

    createPlanets() {
        var planet = this.game.add.sprite(500, 400, "planet-earth");
        planet.scale.set(0.4);
        planet.anchor.setTo(0.5, 0.5);
        var planet = this.game.add.sprite(1500, 600, "planet-desert");
        planet.scale.set(0.3);
        planet.anchor.setTo(0.5, 0.5);
        //planet.scale.set(scale);
    }

    update(object: any) {
        if (!this.game.camera.atLimit.x) {
            this.space1.tilePosition.x -= (object.body.velocity.x) * this.game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.x -= (object.body.velocity.x) * this.game.time.physicsElapsed ;
        }

        if (!this.game.camera.atLimit.y) {
            this.space1.tilePosition.y -= (object.body.velocity.y) * this.game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.y -= (object.body.velocity.y) * this.game.time.physicsElapsed ;
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
        console.log(message);
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

    init(game, playerId) {
        console.log(playerId + ':ActionHandler::init');
        this.game = game;
        this.playerId = playerId;
        this.ships = new Group.Ship(this.game);
    }

    createPlayer() {
        this.player = new Player(this.game, this.transporter);

        var message = new Message(this.playerId);
        message.logIn(new Loc(300,300));
        this.transporter.sendMessage(message);

        var message = new Message('DUMMY');
        message.addPlayer(new Loc(400,300));
        this.transporter.sendMessage(message);
        //
        // var spr = this.game.add.group();
        // spr.create(300, 300, 'crosshair');
    }

    broadCast() {
        console.log(playerId + ':ActionHandler::broadCast');
        var message = new Message(this.playerId);
        message.addPlayer(this.player.getShip().getLocation());
        this.transporter.sendMessage(message);
    }

    getPlayer() {
        return this.player;
    }

    getShips() {
        return this.ships;
    }
    /**
    * Set the message transporter
    */
    setTransporter(transporter: MessageTransport) {
        console.log(playerId + ':ActionHandler::setTransporter');
        this.transporter = transporter;
    }

    getUpdateGroups() {
        return this.ships;
    }

    handleMessage(message: Message) {

        console.log('ActionHandler::handleMessage - ' + message.action);
        console.log(message);
        // login detected
        if (message.action == 'login') {

            console.log(playerId + ':ActionHandler::handleMessage - ' + message.id + ' just logged in')
            var ship = new Ship.Ship(this.game, message.location.x, message.location.y, message.id);
            //var ship = new Phaser.Sprite(this.game, 100, 100, 'ship');
            this.game.add.existing(ship);
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
            var ship = new Ship.Ship(this.game, message.location.x, message.location.y, message.id);
            this.game.add.existing(ship);
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
                $this.game.physics.arcade.collide(elem_i, elem_j)
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
