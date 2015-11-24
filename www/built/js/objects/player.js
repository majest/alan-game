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
            this.firing = false;
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.bullets.createMultiple(50, 'bullet');
            this.bullets.setAll('checkWorldBounds', true);
            this.bullets.setAll('outOfBoundsKill', true);
            this.body.bounce.x = 0.5;
            this.body.bounce.y = 0.5;
            this.body.drag.set(1);
            this.body.maxVelocity.set(1);
            this.body.id = id;
            this.id = id;
            this.scale.setTo(0.4, 0.4);
            this.anchor.setTo(0.5, 0.5);
            this.inputEnabled = true;
            this.addName();
            this.events.onInputDown.add(this.acquireTarget, this);
            this.actionHandler = ActionHandler.getInstance();
            this.crosshair = this.game.add.sprite(x, y, 'crosshair');
            this.crosshair.anchor.setTo(0.5, 0.65);
            this.crosshair.alpha = 0.5;
            console.log(this.id + ':Ship::constructor - x,y' + x + ',' + y);
        }
        Ship.prototype.update = function () {
            this.crosshair.x = this.x;
            this.crosshair.y = this.y;
            this.crosshair.rotation = this.crosshair.rotation + 0.01;
            this.updateName();
            if (this.firing) {
                this.firingAnim(this.target);
            }
            if (this.bullets) {
                this.game.physics.arcade.overlap(this.bullets, this.actionHandler.getShips(), this.bulletCollisionHandler, null, this);
            }
            this.moveToLocation();
        };
        Ship.prototype.bulletCollisionHandler = function (bullet, ship) {
            if (ship.id == this.id)
                return;
            console.log(ship.id);
            bullet.kill();
        };
        Ship.prototype.firingAnim = function (ship) {
            if (this.game.time.now < this.fireDuration && ship.id != this.id && this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
                console.log(this.id + ':Ship::shooting ' + ship.id);
                this.nextFire = this.game.time.now + this.fireRate;
                var bullet = this.bullets.getFirstDead();
                bullet.reset(this.x - 4, this.y - 4);
                this.game.physics.arcade.moveToXY(bullet, ship.x, ship.y, 300);
            }
            if (this.game.time.now > this.fireDuration) {
                this.firing = false;
            }
        };
        Ship.prototype.acquireTarget = function (ship, pointer) {
            console.log(this.id + ':Ship::makeSelfATarget');
            if (ship.id != playerId) {
                player.ship.sendTarget(this.id);
                this.crosshair.visible = true;
            }
        };
        Ship.prototype.sendLocation = function (pointer) {
            console.log(this.id + ':Player::moveToPointer');
            var loc = new Loc();
            loc.set(pointer.worldX, pointer.worldY);
            var message = new Message();
            message.setId(this.id);
            message.setDestination(loc);
            message.setLocation(this.getLocation());
            transporter.sendMessage(message);
        };
        Ship.prototype.sendTarget = function (id) {
            console.log(this.id + ':Ship::sendTarget  - sending target message to: ' + this.id);
            var message = new Message();
            message.setId(this.id);
            message.target = id;
            message.action = 'target';
            transporter.sendMessage(message);
        };
        Ship.prototype.setTarget = function (target) {
            console.log(this.id + ':Ship::setTarget');
            this.target = target;
        };
        Ship.prototype.fire = function () {
            if (this.target) {
                console.log(this.id + ':Ship::fire');
                this.fireDuration = this.game.time.now + 1000;
                this.firing = true;
            }
            else {
                console.log(this.id + ':Ship:fire  - NO TARGET SET');
            }
        };
        Ship.prototype.handleMessage = function (message) {
            if (message.id != this.id) {
                return;
            }
            console.log(this.id + ':Ship::handleMessage - action:' + message.action);
            if (message.location) {
                console.log(this.id + ':Ship::handleMessage - handling location for ship ' + message.id);
                this.setLocation(message.location);
            }
            if (message.destination) {
                console.log(this.id + ':Ship::handleMessage - handling destination');
                console.log(message.destination);
                this.destination = message.destination;
            }
            if (message.action == 'target') {
                console.log(this.id + ':Ship::handleMessage - TARGET: ' + message.target);
                this.setTarget(this.actionHandler.getUpdateGroups().getById(message.target));
            }
            if (message.properties) {
                console.log(message);
                this.setProperties(message.properties);
            }
        };
        Ship.prototype.move = function () {
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
        };
        Ship.prototype.setProperties = function (properties) {
            console.log(this.id + 'Ship::setProperties');
            this.properties = properties;
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
        };
        Ship.prototype.addName = function () {
            var style = { font: "11px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
            this.name = this.game.add.text(this.x, this.y, this.id, style);
            this.updateName();
        };
        Ship.prototype.updateName = function () {
            this.name.x = Math.floor(this.x + this.width / 2) - this.width + 10;
            this.name.y = Math.floor(this.y + this.height / 2) - this.height - 10;
        };
        Ship.prototype.getLocation = function () {
            var loc = new Loc();
            loc.set(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            return loc;
        };
        Ship.prototype.setLocation = function (location) {
            this.x = location.x;
            this.y = location.y;
            var xfix = 3 * Math.cos(Phaser.Math.degToRad(this.angle));
            var yfix = 3 * Math.sin(Phaser.Math.degToRad(this.angle));
            this.x += xfix;
            this.y += yfix;
            if (typeof location.rotation != 'undefined') {
                this.rotation = location.rotation;
            }
            if (typeof location.angle != 'undefined') {
                this.angle = location.angle;
            }
            if (typeof location.velocityx != 'undefined') {
                this.body.velocity.x = location.velocityx;
            }
            if (typeof location.velocityy != 'undefined') {
                this.body.velocity.y = location.velocityy;
            }
        };
        return Ship;
    })(Phaser.Sprite);
    Ship_1.Ship = Ship;
})(Ship || (Ship = {}));
var Group;
(function (Group) {
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship() {
            _super.call(this, game);
        }
        Ship.prototype.add = function (sprite) {
            _super.prototype.add.call(this, sprite);
        };
        Ship.prototype.getById = function (id) {
            var displayObject;
            for (var key in this.children) {
                displayObject = this.children[key];
                if (displayObject.id == id) {
                    console.log(displayObject);
                    return displayObject;
                }
            }
            return null;
        };
        return Ship;
    })(Phaser.Group);
    Group.Ship = Ship;
})(Group || (Group = {}));
