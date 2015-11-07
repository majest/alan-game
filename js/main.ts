/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>



class Game {

    ready: boolean = false;
    game;
    player;
    space;

    connection;
    transporter;
    actionHandler;

    constructor() {
        this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            render: this.render
        });

        // create message parser for incoming messages

    }

    // init the world
    create() {
        console.log('create');

        this.game.world.setBounds(0, 0, 20000000, 20000000);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        //game.physics.p2.defaultRestitution = 0.0; // to jak sie statek odbija

        this.game.renderer.clearBeforeRender = false;
        this.game.renderer.roundPixels = true;
        this.game.stage.disableVisibilityChange = true;
        this.space = this.game.add.tileSprite(0, 0, 800, 600, 'space');
        this.space.fixedToCamera = true;

        this.game.time.advancedTiming = true;

        //  This will run in Canvas mode, so let's gain a little speed and display
        //game.renderer.clearBeforeRender = false;
        //game.renderer.roundPixels = true;

        this.actionHandler = new ActionHandler(this.game);

        //new Planet(game, 0, 0, 0, 'planet-desert');
        this.transporter = new MessageTransport(this.actionHandler);
        //var playerId = 1;
        // this.player = new Player(this.game, playerId, playerId);
        // this.player.setTransporter(this.transporter);

        // add player to the list
        //this.ships = new List([{'key': playerId, 'value': this.player}]);

        this.ready = true;

        var message = new Message('player678');
        message.logIn(new Loc(300,300));
        this.actionHandler.handleMessage(message);
        //
        var message = new Message('player23');
        message.addPlayer(new Loc(400,400));
        this.actionHandler.handleMessage(message);

        var message = new Message('player23');
        message.setDestination(new Loc(400,400));
        this.actionHandler.handleMessage(message);

        //game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        // addDust();
        //var sendData = this.sendData;

        //this.scene = new Scene(this.game, this.transporter);
        //this.game.time.events.loop(500, sendData, this);


    }

    // preload
    preload() {
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
            this.game.debug.spriteInfo(currentPLayer.ship, 32, 128);
        }
    }

    //update the state
    update() {

        if (!this.ready || this.actionHandler.getPlayers().length() == 0) return;

        var players = this.actionHandler.getPlayers().values();
    //    this.actionHandler.getPlayers().values()[0].update(this.space);
        for (var key in players) {
            var player = players[key];
            player.update(this.space);
        }

        //conn.send(player.input);
        //this.messageParser.
        // for (var i in this.ships) {
        //     if (!this.ships[i]) continue;
        //     var curBullets = this.ships[i].bullets;
        //     var curShip = this.ships[i].ship;
        //
        //     // for (var j in shipList) {
        //     //
        //     //     if (!shipList[j]) continue;
        //     //
        //     //     if (j != i) {
        //     //         var targetShip = shipList[j].ship;
        //     //         game.physics.arcade.overlap(curBullets, targetShip, bulletHitPlayer, null, this);
        //     //     }
        //     //
        //     //
        //     // }
        //
        //     // if the ship is alive
        //     if (ships[i].alive) {
        //         this.ships[i].update(this.space);
        //     }
        // }
    }

    sendData() {
        //this.player.sendData(this.connection);
    }

}

class Connection {

    conn: any;
    data: String;

    constructor(transporter: MessageTransport) {
        if (window['WebSocket']) {
            console.log('Connection');
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

    constructor(actionHandler: ActionHandler) {
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }

    parse(message) {
        var data = JSON.parse(message);
        this.actionHandler.handleMessage(<Message>message);
    }

    sendMessage(message: Message) {

        var messageData = JSON.stringify(message.toJson());
        //console.log(messageData);
        this.connection.sendMessage(messageData);
    }
}


class ActionHandler {

    transporter: MessageTransport;
    players: Players;
    game;

    constructor(game) {
        this.players = new Players();
        this.game = game;
    }

    setTransporter(transporter: MessageTransport) {
        this.transporter = transporter;
    }

    getPlayers(): Players {
        return this.players;
    }

    handleMessage(message: Message) {

        if (message.containsAction('player_login')) {
            var player = new Player(this.game, message.id);

            // tel that it's the current player
            player.setCurrentPlayer();

            // set player's transporter so that it can send messages when action is taken
            player.setTransporter(this.transporter);

            // add player to the list
            this.players.add(player);
        } else if (message.containsAction('player_add')) {
            var player = new Player(this.game, message.id);
            this.players.add(player);

        // message for existing player
        } else if (this.players.containsKey(message.id)){
            this.players[message.id].setMessage(message);
        }


    }

}



interface PlayerListInterface {
    add(value: Player): void;
    remove(key: string): void;
    containsKey(key: string): boolean;
    keys(): string[];
    values(): Player[];
}

class Players {
    _keys: string[] = [];
    _values: Player[] = [];

    add(player: Player) {
        var key = player.id;
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


    toLookup(): PlayerListInterface {
        return this;
    }
}

var game = new Game();

var sendData = function() {
    game.sendData();
}
