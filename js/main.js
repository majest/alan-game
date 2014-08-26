var ready = false;
var eurecaServer;
//this function will handle client communication with the server
var cursors;
var ship;
var player;
var playerId = 0;
var bulletTime = 0;
var game;


var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();

    eurecaClient.ready(function(proxy) {
        eurecaServer = proxy;
    });


    //methods defined under "exports" namespace become available in the server side

    eurecaClient.exports.setId = function(id) {
        //create() is moved here to make sure nothing is created before uniq id assignation
        playerId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    }

    eurecaClient.exports.kill = function(id) {
        if (tanksList[id]) {
            tanksList[id].kill();
            console.log('killing ', id, tanksList[id]);
        }
    }

    eurecaClient.exports.spawnEnemy = function(i, x, y) {

        console.log(i + playerId);
        if (i == playerId) return; //this is me

        console.log('SPAWN');
        var ship = new Ship(i, game, ship);
        shipList[i] = ship;
    }

    eurecaClient.exports.updateState = function(id, state) {
        if (shipList[id]) {
            shipList[id].cursor = state;
            shipList[id].ship.x = state.x;
            shipList[id].ship.y = state.y;
            shipList[id].update();
        }
    }

}


game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser', {
    preload: preload,
    create: eurecaClientSetup,
    update: update,
    render: render
});


Ship = function(game, id, player) {

    if (game == null) {
        return;
    }

    var sprite;
    var bullet;
    var bullets;
    var bulletTime = 0;
    var alive;

    this.alive = true;
    this.game = game;

    this.cursor = {
        left: false,
        right: false,
        up: false,
        fire: false
    }

    this.input = {
        left: false,
        right: false,
        up: false,
        fire: false
    }

    this.player = player

    //  Our player ship
    this.ship = game.add.sprite(300, 300, 'ship');
    this.ship.id = id
    this.ship.anchor.set(0.5);

    //  and its physics settings
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);

    this.ship.body.drag.set(100);
    this.ship.body.maxVelocity.set(200);

    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 40 of them
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);


    this.bullets = bullets;
};


Ship.prototype.update = function() {

    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.up != this.input.up ||
        this.cursor.fire != this.input.fire
    );


    if (inputChanged) {
        //Handle input change here
        //send new values to the server        
        if (this.ship.id == playerId) {
            // send latest valid state to the server
            this.input.x = this.ship.x;
            this.input.y = this.ship.y;
            // this.input.angle = this.tank.angle;
            // this.input.rot = this.turret.rotation;
            eurecaServer.handleKeys(this.input);
        }
    }


    if (this.cursor.up) {
        this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, 200, this.ship.body.acceleration);
    } else {
        this.ship.body.acceleration.set(0);
    }


    // left right
    if (this.cursor.left) {
        this.ship.body.angularVelocity = -300;

    } else if (this.cursor.right) {
        this.ship.body.angularVelocity = 300;

    } else {
        this.ship.body.angularVelocity = 0;
    }

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        this.fireBullet();
    }


    screenWrap(this.ship);

    this.bullets.forEachExists(screenWrap, this);

};



Ship.prototype.fireBullet = function() {

    if (this.game.time.now > bulletTime) {
        bullet = this.bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(this.ship.body.x + 16, this.ship.body.y + 16);
            bullet.lifespan = 2000;
            bullet.rotation = this.ship.rotation;
            this.game.physics.arcade.velocityFromRotation(this.ship.rotation, 400, bullet.body.velocity);
            bulletTime = this.game.time.now + 50;
        }
    }

}

// var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser', {
//     preload: preload,
//     create: create,
//     update: update,
//     render: render
// });


function preload() {
    game.load.image('space', 'assets/deep-space.jpg');
    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('ship', 'assets/ship.png');

}

function create() {


    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A spacey background
    game.add.tileSprite(0, 0, game.width, game.height, 'space');


    shipList = {};
    player = new Ship(game, playerId, ship);
    shipList[playerId] = player;

    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
}


function update() {

    if (!ready) return;

    cursors = this.game.input.keyboard.createCursorKeys();
    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;
    // player.input.fire = game.input.activePointer.isDown;
    // player.input.tx = game.input.x + game.camera.x;
    // player.input.ty = game.input.y + game.camera.y;



    for (var i in shipList) {
        if (!shipList[i]) continue;
        var curBullets = shipList[i].bullets;
        var curShip = shipList[i].ship;

        for (var j in shipList) {
            if (!shipList[j]) continue;
            if (j != i) {

                var targetShip = shipList[j].ship;

                game.physics.arcade.overlap(curBullets, targetShip, bulletHitPlayer, null, this);

            }


            if (shipList[j].alive) {

                shipList[j].update();
            }
        }
    }
}

function bulletHitPlayer(ship, bullet) {
    bullet.kill();
}

function screenWrap(sprite) {

    if (sprite.x < 0) {
        sprite.x = game.width;
    } else if (sprite.x > game.width) {
        sprite.x = 0;
    }

    if (sprite.y < 0) {
        sprite.y = game.height;
    } else if (sprite.y > game.height) {
        sprite.y = 0;
    }

}

function render() {}