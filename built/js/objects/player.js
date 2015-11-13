var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ship;
(function (Ship_1) {
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship(game, x, y, id) {
            _super.call(this, game, x, y, 'ship', 0);
            this.fireRate = 100;
            this.nextFire = 0;
            this.fireDuration = 0;
            console.log('Ship::constructor - x,y' + x + ',' + y);
            this.properties = new Properties();
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(50, 'bullet');
            this.bullets.setAll('checkWorldBounds', true);
            this.bullets.setAll('outOfBoundsKill', true);
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
            this.body.angularDrag = 50;
            this.body.id = id;
            this.id = id;
            this.scale.setTo(0.5, 0.5);
            this.anchor.setTo(0.5, 0.5);
            this.inputEnabled = true;
            this.addName();
            this.events.onInputDown.add(this.acquireTarget, this);
            this.actionHandler = ActionHandler.getInstance();
            this.sprites = this.game.add.group();
            this.crosshair = this.game.add.sprite(x, y, 'crosshair');
            this.crosshair.anchor.setTo(0.5, 0.5);
            this.crosshair.visible = false;
            this.sprites.add(this.crosshair);
            console.log('--------------------');
        }
        Ship.prototype.update = function () {
            this.crosshair.x = this.x;
            this.crosshair.y = this.y;
            if (this.target) {
                this.fire(this.target);
            }
            if (this.bullets) {
                this.game.physics.arcade.overlap(this.bullets, this.actionHandler.getShips(), this.bulletCollisionHandler, null, this);
            }
            this.moveToLocation();
        };
        Ship.prototype.bulletCollisionHandler = function (bullet, ship) {
            if (ship.id == playerId)
                return;
            bullet.kill();
        };
        Ship.prototype.fire = function (ship) {
            if (this.game.time.now < this.fireDuration && ship.id != playerId && this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                console.log('shoot2');
                this.nextFire = this.game.time.now + this.fireRate;
                var bullet = this.bullets.getFirstDead();
                bullet.reset(this.x - 8, this.y - 8);
                this.game.physics.arcade.moveToXY(bullet, ship.x, ship.y, 300);
            }
        };
        Ship.prototype.acquireTarget = function (ship, pointer) {
            console.log(playerId + ':Ship::acquireTarget');
            if (ship.id != playerId) {
                var player = this.actionHandler.getPlayer().getShip();
                console.log(playerId + ':Ship::acquireTarget  - setting this ship: ' + this.id + ' as a target of ship: ' + player.id);
                player.setTarget(this);
                this.crosshair.visible = true;
                return this.crosshair;
            }
        };
        Ship.prototype.setTarget = function (target) {
            console.log(playerId + ':Ship::setTarget');
            this.fireDuration = this.game.time.now + 1000;
            this.target = target;
        };
        Ship.prototype.handleMessage = function (message) {
            console.log(playerId + ':Ship::handleMessage - action:' + message.action);
            if (message.id != this.id) {
                console.log(playerId + ':Ship::handleMessage I\'m ' + this.id + ' and this message is for: ' + message.id);
                return;
            }
            if (message.location) {
                console.log(playerId + ':Ship::handleMessage - handling location for ship ' + message.id);
                this.x = message.location.x;
                this.y = message.location.y;
                var xfix = 3 * Math.cos(Phaser.Math.degToRad(this.angle));
                var yfix = 3 * Math.sin(Phaser.Math.degToRad(this.angle));
                this.x += xfix;
                this.y += yfix;
                if (typeof message.location.rotation != 'undefined') {
                    this.rotation = message.location.rotation;
                }
                if (typeof message.location.angle != 'undefined') {
                    this.angle = message.location.angle;
                }
                if (typeof message.location.velocityx != 'undefined') {
                    this.body.velocity.x = message.location.velocityx;
                }
                if (typeof message.location.velocityy != 'undefined') {
                    this.body.velocity.y = message.location.velocityy;
                }
            }
            if (message.destination) {
                console.log(playerId + ':Ship::handleMessage - handling destination');
                console.log(message.destination);
                this.destination = message.destination;
            }
        };
        Ship.prototype.move = function () {
            if (!this.destination) {
                return;
            }
            var distanceToTarget = parseFloat(this.game.physics.arcade.distanceToXY(this, this.destination.x, this.destination.y).toFixed(2));
            if (distanceToTarget < 8.0) {
                this.destination = null;
            }
            else {
                return this.game.physics.arcade.moveToXY(this, this.destination.x, this.destination.y, this.properties.speed);
            }
        };
        Ship.prototype.rotationSpeed = function (rotation) {
            if (rotation && this.rotation !== rotation) {
                var delta = rotation - this.rotation;
                if (delta > Math.PI)
                    delta -= Math.PI * 2;
                if (delta < -Math.PI)
                    delta += Math.PI * 2;
                if (delta > 0) {
                    this.angle += this.properties.turnRate;
                }
                else {
                    this.angle -= this.properties.turnRate;
                }
                var deltaAbs = parseFloat(Math.abs(delta).toFixed(2));
                var target = parseFloat(Math.abs(Phaser.Math.degToRad(this.properties.turnRate)).toFixed(2));
                if (deltaAbs <= target) {
                    this.rotation = rotation;
                }
            }
            this.body.velocity.x = Math.cos(this.rotation) * this.properties.speed;
            this.body.velocity.y = Math.sin(this.rotation) * this.properties.speed;
        };
        Ship.prototype.moveToLocation = function () {
            if (!this.destination) {
                return;
            }
            this.rotationSpeed(this.move());
            this.updateName();
        };
        Ship.prototype.addName = function () {
            console.log('Ship::addName');
            var style = { font: "11px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
            this.name = this.game.add.text(this.x, this.y, this.id, style);
            this.updateName();
        };
        Ship.prototype.updateName = function () {
            this.name.x = Math.floor(this.x + this.width / 2) - this.width + 10;
            this.name.y = Math.floor(this.y + this.height / 2) - this.height - 10;
        };
        Ship.prototype.updateSprites = function () {
        };
        Ship.prototype.getLocation = function () {
            var loc = new Loc(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            console.log(loc);
            return loc;
        };
        Ship.prototype.setLocation = function (loc) {
            this.rotation = loc.rotation;
            this.angle = loc.angle;
            this.body.velocity.x = loc.velocityx;
            this.body.velocity.y = loc.velocityy;
        };
        return Ship;
    })(Phaser.Sprite);
    Ship_1.Ship = Ship;
})(Ship || (Ship = {}));
var Group;
(function (Group) {
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship(game) {
            _super.call(this, game);
        }
        Ship.prototype.add = function (sprite) {
            _super.prototype.add.call(this, sprite);
        };
        return Ship;
    })(Phaser.Group);
    Group.Ship = Ship;
})(Group || (Group = {}));
