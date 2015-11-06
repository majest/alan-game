var Phaser;
var accelerateToPointer;
var Input = (function () {
    function Input() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.fire = false;
        this.rotationFinished = false;
        this.movementFinished = false;
    }
    Input.prototype.reset = function () {
        this.rotationFinished = false;
        this.movementFinished = false;
    };
    Input.prototype.load = function (input) {
        this.left = input.left;
        this.right = input.right;
        this.up = input.up;
        this.fire = input.fire;
    };
    Input.prototype.compare = function (input) {
        return (this.left != input.left ||
            this.right != input.right ||
            this.up != input.up ||
            this.fire != input.fire);
    };
    return Input;
})();
var Command = (function () {
    function Command() {
        this.destination = new Destination();
    }
    return Command;
})();
var Destination = (function () {
    function Destination() {
    }
    Destination.prototype.reset = function () {
        this.x = null;
        this.y = null;
    };
    return Destination;
})();
var ShipProperties = (function () {
    function ShipProperties() {
        // how fast ship is turning
        this.turnRate = 10;
        this.speed = 80;
        this.breakingForce = 80;
    }
    return ShipProperties;
})();
var Player = (function () {
    function Player(game, id, currentPlayerId, server) {
        this.game = game;
        this.currentPlayerId = currentPlayerId;
        this.server = server;
        this.alive = true;
        // command for the ship action
        this.command = new Command();
        this.properties = new ShipProperties();
        this.input = new Input();
        this.last_input = new Input();
        this.createShip(id);
        this.game.input.onDown.add(this.moveToPointer, this);
    }
    Player.prototype.createShip = function (id) {
        this.ship = this.game.add.sprite(300, 300, 'ship');
        this.ship.id = id;
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        //this.ship.body.setZeroRotation();
        //this.ship.body.allowRotation = true;
        this.ship.body.drag.set(this.properties.breakingForce);
        this.ship.body.maxVelocity.set(this.properties.speed);
        this.ship.anchor.setTo(0.5, 0.5);
        //this.ship.body.maxAngular = 500;
        this.ship.body.angularDrag = 50;
        this.ship.rotation = 0;
        this.ship.angle = 0;
        this.ship.scale.setTo(0.5, 0.5);
        //this.ship.body.rotation = 90;
        //this.ship.rotation = 1;
    };
    Player.prototype.getRotation = function () {
        return this.ship.rotation;
    };
    Player.prototype.setRotation = function (rotation) {
        this.ship.rotation = rotation;
    };
    Player.prototype.movementChanged = function () {
        var inputChanged = this.last_input.compare(this.input);
        // saving last state
        if (inputChanged) {
            this.last_input.load(this.input);
        }
        return inputChanged;
    };
    Player.prototype.serialize = function () {
        return {
            "id": this.ship.id,
            "loc": {
                "x": this.ship.x,
                "y": this.ship.y,
                "a": this.ship.angle,
                "v": { "s": this.getSpeed(), "x": this.ship.body.velocity.x, "y": this.ship.body.velocity.y }
            }
        };
    };
    Player.prototype.getSpeed = function () {
        return Math.sqrt(Math.pow(this.ship.body.velocity.x, 2) + Math.pow(this.ship.body.velocity.y, 2));
    };
    Player.prototype.moveToPointer = function (pointer) {
        this.command.destination.x = pointer.worldX;
        this.command.destination.y = pointer.worldY;
        this.input.reset();
    };
    Player.prototype.moveToLocation = function (command) {
        var x = command.destination.x;
        var y = command.destination.y;
        var distanceToTarget = parseFloat(this.game.physics.arcade.distanceToXY(this.ship, x, y).toFixed(2));
        var targetAngle;
        if (distanceToTarget < 4.0) {
            this.input.rotationFinished = true;
            this.input.movementFinished = true;
        }
        if (x && y && !this.input.movementFinished) {
            //console.log('------------------------ MOVEMENT ------------------' + this.input.movementFinished);
            var rotation = this.game.physics.arcade.moveToXY(this.ship, x, y, this.properties.speed);
            // var targetAngle = this.game.math.angleBetween(
            //     x, y,
            //     this.ship.x, this.ship.y // ----- >>>> HOW TO CALL PLAYER ???
            // );
            if (!targetAngle) {
                targetAngle = rotation;
            }
            if (this.getRotation() !== targetAngle && !this.input.rotationFinished) {
                //console.log('------------------------ ROTATION ------------------');
                // Calculate difference between the current angle and targetAngle
                var delta = targetAngle - this.getRotation();
                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI)
                    delta -= Math.PI * 2;
                if (delta < -Math.PI)
                    delta += Math.PI * 2;
                if (delta > 0) {
                    this.ship.angle += this.properties.turnRate;
                }
                else {
                    this.ship.angle -= this.properties.turnRate;
                }
                var deltaAbs = parseFloat(Math.abs(delta).toFixed(2));
                var target = parseFloat(Math.abs(this.game.math.degToRad(this.properties.turnRate)).toFixed(2));
                // Just set angle to target angle if they are close
                if (deltaAbs <= target) {
                    // modify the angle
                    this.setRotation(targetAngle);
                    this.input.rotationFinished = true;
                }
            }
            // Calculate velocity vector based on this.rotation and this.SPEED
            this.ship.body.velocity.x = Math.cos(this.ship.rotation) * this.properties.speed;
            this.ship.body.velocity.y = Math.sin(this.ship.rotation) * this.properties.speed;
        }
    };
    Player.prototype.update = function (space, command) {
        this.moveToLocation(this.command);
        //this.ship.rotation = this.game.physics.arcade.angleToPointer(this.ship, this.clickPointer);
        //    this.ship.rotation = this.game.physics.arcade.angleToPointer(this.ship, this.game.input.activePointer);
        // sent only when state changes
        // if (this.ship.id  && (this.movementChanged() || this.game.time.now % 500 == 0)) {
        //     this.input.x = this.ship.x;
        //     this.input.y = this.ship.y;
        //     this.input.angle = this.ship.angle
        // }
        //
        // if (this.input.up) {
        //
        //     // Maximum speed
        //     if (this.getSpeed() < 6) {
        //         this.ship.body.thrust(100);
        //     }
        //
        // } else {
        //     this.ship.body.setZeroRotation();
        // }
        //
        //
        // // left right
        // if (this.input.left) {
        //     this.ship.body.rotateLeft(100);
        //
        // } else if (this.input.right) {
        //     this.ship.body.rotateRight(100);
        //
        // } else {
        //     this.ship.body.setZeroRotation();
        // }
        // if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        //     this.fireBullet();
        // }
        if (this.ship.id == this.currentPlayerId) {
            if (!this.game.camera.atLimit.x) {
                space.tilePosition.x -= (this.ship.body.velocity.x) * this.game.time.physicsElapsed;
            }
            if (!this.game.camera.atLimit.y) {
                space.tilePosition.y -= (this.ship.body.velocity.y) * this.game.time.physicsElapsed;
            }
        }
        //screenWrap(this.ship);
        //this.bullets.forEachExists(screenWrap, this);
    };
    return Player;
})();
