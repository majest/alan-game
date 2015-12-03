var game;
var firstRunLandscape;
var playerId;
var transporter;
var player;
var gameinterface;
var Game = (function () {
    function Game() {
        this.ready = false;
        Game.gameRatio = window.innerWidth / window.innerHeight;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        console.log('==========  ratio: ' + Game.gameRatio);
        console.log('==========  width: ' + Game.resx);
        console.log('==========  window width: ' + winWidth);
        console.log('==========  window height: ' + winHeight);
        game = new Phaser.Game(Game.resx, Math.ceil(Game.resx / Game.gameRatio), Phaser.CANVAS, 'phaser');
        game.state.add('setup', Setup);
        game.state.start('setup');
    }
    Game.resx = 1000;
    return Game;
})();
var Setup = (function () {
    function Setup() {
    }
    Setup.prototype.render = function () {
        game.debug.text(game.time.fps + ' FPS', 400, 32);
    };
    Setup.prototype.preload = function () {
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
    };
    Setup.prototype.create = function () {
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
    };
    Setup.prototype.fire = function () {
    };
    Setup.prototype.update = function () {
        var groupOfShips = this.actionHandler.getUpdateGroups();
        if (!this.ready || groupOfShips.length == 0)
            return;
        this.actionHandler.sortedCollide(game, groupOfShips.children);
        if (typeof groupOfShips != 'undefined') {
            groupOfShips.update();
        }
        if (player.ship.alive) {
            this.background.update(player.getShip());
        }
    };
    return Setup;
})();
var Background = (function () {
    function Background() {
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
    }
    Background.prototype.update = function (player) {
        if (!game.camera.atLimit.x) {
            this.space1.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed * 0.6;
        }
        if (!game.camera.atLimit.y) {
            this.space1.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.6;
        }
    };
    return Background;
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
    ActionHandler.prototype.init = function () {
        console.log('ActionHandler::init');
        this.ships = new Group.Ship();
    };
    ActionHandler.prototype.createPlayer = function () {
        player = new Player();
        console.log(player);
        var loc = new Loc();
        loc.set(1400, 400);
        var p = WeaponProperties.createProjectileTurret();
        var m = WeaponProperties.createMissileTurret();
        var wd = ItemProperties.createWarpDrive();
        var message = new Message();
        message.setId(playerId);
        message.logIn(loc, Properties.factory());
        message.addWeapon(p);
        message.addWeapon(m);
        transporter.sendMessage(message);
    };
    ActionHandler.prototype.broadCast = function () {
        console.log('ActionHandler::broadCast');
        var message = new Message();
        message.setId(playerId);
        message.addPlayer(player.getShip().getLocation(), player.getShip().getProperties());
        transporter.sendMessage(message);
    };
    ActionHandler.prototype.getShips = function () {
        return this.ships;
    };
    ActionHandler.prototype.getUpdateGroups = function () {
        return this.ships;
    };
    ActionHandler.prototype.handleMessage = function (message) {
        console.log('ActionHandler::handleMessage - ' + message.action);
        if (message.action == 'login') {
            console.log('ActionHandler::handleMessage - ' + message.id + ' just logged in');
            console.log(message);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
            if (message.id == playerId) {
                console.log('ActionHandler::handleMessage - oh it\'s us. take the ship');
                player.takeControllOver(ship);
            }
            else {
                console.log('ActionHandler::handleMessage - let it know where we are');
                this.broadCast();
            }
        }
        else if (message.action == 'create' && message.id != playerId) {
            console.log(message);
            console.log('ActionHandler::handleMessage - received broadcast for: ' + message.id + ' location x: ' + message.location.x + ' location y:' + +message.location.y);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
        }
        this.ships.forEach(function (ship) {
            ship.handleMessage(message);
        }, this);
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
                game.physics.arcade.collide(elem_i, elem_j);
            }
        }
    };
    ActionHandler._instance = new ActionHandler();
    return ActionHandler;
})();
function goFullScreen() {
    game.gofullScreen();
}
function handleIncorrect() {
    game.handleIncorrect();
}
function handleCorrect() {
    game.handleCorrect();
}
