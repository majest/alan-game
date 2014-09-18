Ship = function(game, id, player) {

    var sprite;
    var bullet;
    var bullets;
    var bulletTime = 0;
    var alive;
    var last_input;

    this.alive = true;
    this.game = game;
    this.alive_time = 0;

    this.input = {
        left: false,
        right: false,
        up: false,
        fire: false
    }

    this.last_input = {
        left: false,
        right: false,
        up: false,
        fire: false
    }

    console.log(game.centerX + "-" + game.world.centerY)
    //  Our player ship
    this.ship = this.game.add.sprite(300, 300, 'ship');
    this.ship.id = id
    //this.ship.anchor.set(0.5);

    //  and its physics settings
    // this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.game.physics.p2.enable(this.ship);
    this.ship.body.setZeroRotation();
    // this.ship.body.drag.set(100);
};

Ship.prototype.movementChanged = function() {


    var inputChanged = (
        this.last_input.left != this.input.left ||
        this.last_input.right != this.input.right ||
        this.last_input.up != this.input.up ||
        this.last_input.fire != this.input.fire
    );

    // saving last state
    if (inputChanged) {
        this.last_input.left = this.input.left;
        this.last_input.right = this.input.right;
        this.last_input.up = this.input.up;
        this.last_input.fire = this.input.fire;
    }

    return inputChanged;
}

Ship.prototype.update = function() {


    // init values
    // this.input.rotation = this.ship.rotation;
    // this.input.acceleration = this.ship.body.acceleration;

    // sent only when state changes
    if (this.ship.id == playerId && (this.movementChanged() || this.game.time.now % 500 == 0)) {
        this.input.x = this.ship.x;
        this.input.y = this.ship.y;
        this.input.angle = this.ship.angle
        eurecaServer.handleKeys(this.input);
    }

    if (this.input.up) {
        this.ship.body.thrust(100);
    } else {
        this.ship.body.setZeroRotation();
    }


    // left right
    if (this.input.left) {
        this.ship.body.rotateLeft(100);

    } else if (this.input.right) {
        this.ship.body.rotateRight(100);

    } else {
        this.ship.body.setZeroRotation();
    }

    // if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    //     this.fireBullet();
    // }


    if (this.ship.id == playerId) {
        if (!this.game.camera.atLimit.x) {
            space.tilePosition.x += (this.ship.body.velocity.x * 16) * this.game.time.physicsElapsed;
        }

        if (!this.game.camera.atLimit.y) {
            space.tilePosition.y += (this.ship.body.velocity.y * 16) * this.game.time.physicsElapsed;
        }
    }

    //screenWrap(this.ship);
    //this.bullets.forEachExists(screenWrap, this);
}


Ship.prototype.addBullets = function() {
    //  Our ships bullets
    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 40 of them
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    this.bullets = bullets;
}


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

Ship.prototype.kill = function() {
    delete shipList[this.ship.id];
    this.ship.kill();
}