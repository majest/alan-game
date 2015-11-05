var ready = false;
var eurecaServer;
//this function will handle client communication with the server
var cursors;
var ship;
var player;
var playerId = 0;
var bulletTime = 0;
var game;
var space;
var conn;

var webs = function() {
    if (window["WebSocket"]) {
        conn = new WebSocket("ws://localhost:9090/ws");
        conn.onclose = function(evt) {
            console.log('closed');
        }
        conn.onmessage = function(evt) {
            console.log(evt.data);
        }
    } else {
        console.log('no support');
    }
}

var eurecaClientSetup = function() {
    //create an instance of eureca.io client

    //
    //
    // //methods defined under "exports" namespace become available in the server side
    // eurecaClient.exports.loadWorld = function(world) {
    //     worldLoader(world);
    // };
    //
    // eurecaClient.exports.setId = function(id) {
    //     //create() is moved here to make sure nothing is created before uniq id assignation
    //     playerId = id;
    //     create();
    //     eurecaServer.handshake();
    //     ready = true;
    // };
    //
    // eurecaClient.exports.kill = function(id) {
    //     if (shipList[id]) {
    //         shipList[id].kill();
    //         console.log('killing ', id, shipList[id]);
    //     }
    // };
    //
    // eurecaClient.exports.spawnEnemy = function(i, x, y) {
    //
    //     if (i == playerId) return; //this is me
    //     console.log("current Id: " + playerId);
    //     console.log("new player id: " + i);
    //     var ship = new Ship(game, i, ship);
    //     shipList[i] = ship;
    // };
    //
    // eurecaClient.exports.updateState = function(id, state) {
    //
    //     if (shipList[id] && id != playerId) {
    //         shipList[id].input = state
    //         shipList[id].ship.x = state.x;
    //         shipList[id].ship.y = state.y;
    //         shipList[id].ship.angle = state.angle;
    //         shipList[id].update();
    //     }
    // };
}


game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser', {
    preload: preload,
    create: create,
    update: update,
    render: render
});



function preload() {
    game.load.image('space', 'assets/deep-space.jpg');
    game.load.image('bullet', 'assets/bullets.png');
    game.load.image('ship', 'assets/ship2.png');
    game.load.image('dust', 'assets/pixel.png');
    game.load.image('planet-desert', 'assets/planets/desert.png');
}

function create() {


    game.world.setBounds(0, 0, 20000, 20000);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.p2.defaultRestitution = 0.0; // to jak sie statek odbija

    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    space = game.add.tileSprite(0, 0, 800, 600, 'space');
    space.fixedToCamera = true;

    //  This will run in Canvas mode, so let's gain a little speed and display
    //game.renderer.clearBeforeRender = false;
    //game.renderer.roundPixels = true;


    new Planet(game, 0, 0, 0, 'planet-desert');

    shipList = {};
    player = new Player(game, playerId, playerId);
    shipList[playerId] = player;

    game.camera.follow(player.ship);
    ready = true;

    //game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    // addDust();
    this.game.time.events.loop(50, send, this);
}

function worldLoader(worldObjects) {
    // for key in world {
    //     var element = world[key];
    //     if (element.object == 'planet') {
    //         new Planet(game, element.x, element.y, element.scale, element.type);
    //     }
    // }
}

function send() {
    //conn.send(JSON.stringify(player.input));
}

function update() {



    if (!ready) return;
    cursors = this.game.input.keyboard.createCursorKeys();
    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;

    //conn.send(player.input);

    for (var i in shipList) {
        if (!shipList[i]) continue;
        var curBullets = shipList[i].bullets;
        var curShip = shipList[i].ship;

        // for (var j in shipList) {
        //
        //     if (!shipList[j]) continue;
        //
        //     if (j != i) {
        //         var targetShip = shipList[j].ship;
        //         game.physics.arcade.overlap(curBullets, targetShip, bulletHitPlayer, null, this);
        //     }
        //
        //
        // }

        // if the ship is alive
        if (shipList[i].alive) {
            shipList[i].update(space);
        }
    }
}



function bulletHitPlayer(ship, bullet) {
    bullet.kill();
}

// function screenWrap(sprite) {

//     if (sprite.x < 0) {
//         sprite.x = game.width;
//     } else if (sprite.x > game.width) {
//         sprite.x = 0;
//     }

//     if (sprite.y < 0) {
//         sprite.y = game.height;
//     } else if (sprite.y > game.height) {
//         sprite.y = 0;
//     }

// }

function render() {
    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteInfo(player.ship, 32, 128);

}

webs();
