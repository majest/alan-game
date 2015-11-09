var ObjectControll = (function () {
    function ObjectControll(game, id) {
        this.game = game;
        this.id = id;
    }
    ObjectControll.prototype.setTransporter = function (transporter) {
        console.log('setting transporter');
        console.log(transporter);
        this.transporter = transporter;
    };
    ObjectControll.prototype.sendMessage = function (message) {
    };
    ObjectControll.prototype.handleMessage = function (message) {
        console.log('ObjectControll::handleMessage');
        this.message = message;
        this.properties = message.properties;
        if (!this.object) {
            console.log('Creating object');
            this.create();
        }
        if (this.message.location) {
            this.updateState(this.message);
        }
    };
    ObjectControll.prototype.updateState = function (location) {
        if (typeof location.rotation != 'undefined') {
            this.object.x = location.x;
            this.object.y = location.y;
            this.object.rotation = location.rotation;
            this.object.angle = location.angle;
            this.object.body.velocity.x = location.velocityx;
            this.object.body.velocity.y = location.velocityy;
        }
    };
    ObjectControll.prototype.resetMessage = function () {
        this.message = null;
    };
    ObjectControll.prototype.getObject = function () {
        return this.object;
    };
    ObjectControll.prototype.getRotation = function () {
        return this.object.rotation;
    };
    ObjectControll.prototype.setRotation = function (rotation) {
        this.object.rotation = rotation;
    };
    ObjectControll.prototype.getSpeed = function () {
        return Math.sqrt(Math.pow(this.object.body.velocity.x, 2) + Math.pow(this.object.body.velocity.y, 2));
    };
    ObjectControll.prototype.getLocation = function () {
        var loc = new Loc(this.object.x, this.object.y);
        loc.setState(this.getRotation(), this.getAngle(), this.object.body.velocity.x, this.object.body.velocity.y);
        return loc;
    };
    ObjectControll.prototype.getAngle = function () {
        return this.object.angle;
    };
    ObjectControll.prototype.moveToLocation = function () {
        if (!this.message || !this.message.hasDestination()) {
            return;
        }
        var movement = this.message.movement;
        var destination = this.message.destination;
        var x = destination.x;
        var y = destination.y;
        var distanceToTarget = parseFloat(this.game.physics.arcade.distanceToXY(this.object, x, y).toFixed(2));
        if (distanceToTarget < 8.0) {
            this.resetMessage();
        }
        if (destination.isSet() && (!movement.movementFinished || (movement.movementFinished && !movement.moving))) {
            var rotation = this.game.physics.arcade.moveToXY(this.object, x, y, this.properties.speed);
            if (this.getRotation() !== rotation && (!movement.rotationFinished || (movement.rotationFinished && !movement.rotating))) {
                var delta = rotation - this.getRotation();
                if (delta > Math.PI)
                    delta -= Math.PI * 2;
                if (delta < -Math.PI)
                    delta += Math.PI * 2;
                if (delta > 0) {
                    this.object.angle += this.properties.turnRate;
                }
                else {
                    this.object.angle -= this.properties.turnRate;
                }
                var deltaAbs = parseFloat(Math.abs(delta).toFixed(2));
                var target = parseFloat(Math.abs(this.game.math.degToRad(this.properties.turnRate)).toFixed(2));
                if (deltaAbs <= target) {
                    this.setRotation(rotation);
                    movement.finishRotation();
                }
            }
            this.object.body.velocity.x = Math.cos(this.object.rotation) * this.properties.speed;
            this.object.body.velocity.y = Math.sin(this.object.rotation) * this.properties.speed;
        }
    };
    ObjectControll.prototype.create = function () {
        if (!this.properties) {
            console.error('Missing object properties');
            return;
        }
        console.log('ObjectControll::create - Creating object at x:' + this.message.location.x + ', y:' + this.message.location.y);
        this.object = this.game.add.sprite(this.message.location.x, this.message.location.y, this.message.properties.object);
        this.object.id = this.message.id;
        this.game.physics.enable(this.object, Phaser.Physics.ARCADE);
        this.object.body.drag.set(this.properties.breakingForce);
        this.object.body.maxVelocity.set(this.properties.speed);
        this.object.anchor.setTo(0.5, 0.5);
        this.object.body.angularDrag = 50;
        this.object.rotation = 0;
        this.object.angle = 0;
        this.object.scale.setTo(0.5, 0.5);
    };
    ObjectControll.prototype.setProperties = function (properties) {
        this.properties = properties;
    };
    return ObjectControll;
})();
