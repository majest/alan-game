/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>



class Game {

    ready: boolean = false;
    game;
    player;
    space;

    playerId;

    connection;
    transporter;
    actionHandler;

    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.WEBGL, 'phaser', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });
    }

    // init the world
    create() {
        console.log('Creating world');

        this.game.world.setBounds(0, 0, 20000000, 20000000);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        //game.physics.p2.defaultRestitution = 0.0; // to jak sie statek odbija

        this.game.renderer.clearBeforeRender = false;
        this.game.renderer.roundPixels = true;


        this.space = this.game.add.tileSprite(0, 0, 800, 600, 'space');
        this.space.fixedToCamera = true;

        this.game.time.advancedTiming = true;

        //  This will run in Canvas mode, so let's gain a little speed and display
        //game.renderer.clearBeforeRender = false;
        //game.renderer.roundPixels = true;

        this.actionHandler = new ActionHandler(this.game);

        var playerId = Math.random() + '';
        this.playerId = playerId;

        //new Planet(game, 0, 0, 0, 'planet-desert');
        this.transporter = new MessageTransport(this.actionHandler, this.playerId);
        this.actionHandler.setTransporter(this.transporter);

        this.ready = true;


        var message = new Message(playerId);
        message.addPlayer(new Loc(400,400));
        this.actionHandler.handleMessage(message);

        var message = new Message(playerId);
        message.logIn();
        this.actionHandler.handleMessage(message);

    }

    // preload
    preload() {
        this.game.stage.disableVisibilityChange = true;
        this.game.config.forceSetTimeOut = true;
        this.game.load.image('space', 'assets/deep-space.jpg');
        this.game.load.image('bullet', 'assets/bullets.png');
        this.game.load.image('ship', 'assets/ships/fury.png');
        this.game.load.image('dust', 'assets/pixel.png');
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
            player.update(this.space);
        }
    }


}

class Connection {

    conn: any;
    data: String;

    constructor(transporter: MessageTransport) {
        if (window['WebSocket']) {
            console.log('Connecting');
            this.conn = new WebSocket("ws://localhost:9090/ws");

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
        this.conn.send(message)
    }
}


class MessageTransport {

    connection;
    actionHandler: ActionHandler;

    constructor(actionHandler: ActionHandler, private playerId) {
        console.log('Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }

    parse(messageData) {
        console.log('MessageTransport::parse');
        var data = JSON.parse(messageData);
        var message = Message.fromJson(data);

        // do not handle current's player messages from outside
        if (this.playerId !== message.id) {
            this.actionHandler.handleMessage(message);
        }
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
    game;

    constructor(game) {
        console.log('ActionHandler::constructor');
        this.players = new Players();
        this.game = game;
    }

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
            player = new Player(this.game, message.id);
            this.players.add(message.id, player);
        }

        // log in player if required
        if (message.shouldLogIn()) {
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

        console.log('--------------- No player by id found : ' + id + '-------------------')
        return null;
    }

    toLookup(): PlayerListInterface {
        return this;
    }
}

var game = new Game();
