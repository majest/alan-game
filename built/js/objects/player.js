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
            console.log('Ship::constructor - x,y' + x + ',' + y);
            _super.call(this, game, x, y, 'ship', 0);
            this.properties = new Properties();
            this.id = id;
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
            this.body.angularDrag = 50;
            this.scale.setTo(0.5, 0.5);
            this.anchor.setTo(0.5, 0.5);
            this.addName();
        }
        Ship.prototype.update = function () {
            this.moveToLocation();
        };
        Ship.prototype.handleMessage = function (message) {
            console.log(playerId + ':Ship::handleMessage - action:' + message.action);
            if (message.id != this.id) {
                console.log(playerId + ':Ship::handleMessage I\'m ' + this.id + ' and this message is for: ' + message.id);
                return;
            }
            if (message.destination) {
                console.log(playerId + ':Ship::handleMessage - handling destination');
                console.log(message.destination);
                this.destination = message.destination;
            }
            else if (message.location && message.id != playerId) {
                console.log(playerId + ':Ship::handleMessage - handling location for ship ' + message.id);
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
        Ship.prototype.getLocation = function () {
            var loc = new Loc(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            console.log(loc);
            console.log(this);
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
