/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>

var resx: number = 1280;
var resy: number = 720;
var game;
var playerId;

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
        this.game = new Phaser.Game(resx, resy, Phaser.WEBGL, 'phaser', {
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
            this.game.scale.startFullScreen(true);
        }
    }

    // init the world
    create() {
        console.log('Creating world');

        this.game.world.setBounds(0, 0, 20000000, 20000000);
        this.game.physics.startSystem(Phaser.Physics.AUTO);
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
        this.game.stage.disableVisibilityChange = true;
        this.game.config.forceSetTimeOut = true;
        this.game.load.image('space1', 'assets/space1.jpg');
        this.game.load.image('space2', 'assets/space2.jpg');
        this.game.load.image('bullet', 'assets/bullets.png');
        this.game.load.image('ship', 'assets/ships/fury.png');
        this.game.load.image('dust', 'assets/pixel.png');
        this.game.load.image('planet-earth', 'assets/planets/earth.png');
        this.game.load.image('planet-desert', 'assets/planets/desert.png');
    }

    // debug
    render() {

        // addcamera info
        this.game.debug.cameraInfo(this.game.camera, 32, 32);

        // add fps
        this.game.debug.text(this.game.time.fps + ' FPS', 740, 32 );

        // add currents player sprite info
        var currentPLayer = this.actionHandler.getPlayers().getCurrentPlayer();
        if (currentPLayer) {
            //this.game.debug.spriteInfo(currentPLayer.ship, 32, 128);
        }
    }

    //update the state
    update() {
        if (!this.ready || this.actionHandler.getPlayers().length() == 0) return;

        var players = this.actionHandler.getPlayers().values();

        for (var key in players) {
            var player = players[key];
            player.update();

            if (player.isCurrentPlayer()) {
                this.scene.update(player.getObject());
            }
        }
    }


}

class Scene {

    space1;
    space2;

    constructor(private game: any) {
        this.space1 = this.game.add.tileSprite(0, 0, resx, resy, 'space1');
        this.space1.fixedToCamera = true;

        this.space2 = this.game.add.tileSprite(0, 0, resx, resy, 'space2');
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
        console.log('Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }

    parse(messageData) {
        console.log('MessageTransport::parse');
        var data = JSON.parse(messageData);
        var message = Message.fromJson(data);

        // do not handle current's player messages from outside
        this.actionHandler.handleMessage(message);
    }

    sendMessage(message: Message) {
        console.log('MessageTransport::sendMessage');
        console.log(message);
        var messageData = JSON.stringify(message.toJson());
        this.connection.sendMessage(messageData);
    }
}


class ActionHandler {

    transporter: MessageTransport;
    players: Players;
    playerId;
    game;

    constructor(game, playerId) {
        console.log('ActionHandler::constructor');
        this.players = new Players();
        this.game = game;
        this.playerId = playerId;

    }

    createPlayer() {
        var message = new Message(this.playerId);
        message.addPlayer(new Loc(800,400));
        this.transporter.sendMessage(message);

        var message = new Message(this.playerId);
        message.logIn();
        this.transporter.sendMessage(message);
    }

    /**
    * Set the message transporter
    */
    setTransporter(transporter: MessageTransport) {
        console.log('ActionHandler::setTransporter');
        this.transporter = transporter;
    }

    getPlayers(): Players {
        return this.players;
    }

    handleMessage(message: Message) {

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

    }

}



interface PlayerListInterface {
    add(key: string, value: Player): void;
    remove(key: string): void;
    containsKey(key: string): boolean;
    keys(): string[];
    values(): Player[];
}

class Players {
    _keys: string[] = [];
    _values: Player[] = [];

    add(key: string, player: Player) {
        this[key] = player;
        this._keys.push(key);
        this._values.push(player);
    }

    remove(key: string) {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);

        delete this[key];
    }

    keys(): string[] {
        return this._keys;
    }

    values(): Player[] {
        return this._values;
    }

    length(): number {
        return this._values.length;
    }

    containsKey(key: string):boolean {
        if (typeof this[key] === "undefined") {
            return false;
        }

        return true;
    }

    getCurrentPlayer(): Player {
        for (var key in this._values) {
            var player = this._values[key];
            if (player.isCurrentPlayer()) {
                return player;
            }
        }
        return null;
    }

    getPlayer(id: string) {
        if (this.containsKey(id)){
            return this[id];
        }

        console.log('Players::getPlayer - No player found , id:'  + id);
        return null;
    }

    toLookup(): PlayerListInterface {
        return this;
    }
}

function waitForSocketConnection(socket, callback){
    setTimeout(
        function () {
            if (socket.readyState === 1) {
                console.log("Connection is made")
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
