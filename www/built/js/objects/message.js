var Properties = (function () {
    function Properties() {
        this.turnRate = 3;
        this.speed = 60;
        this.breakingForce = 80;
        this.object = 'ship';
    }
    Properties.prototype.toJson = function () {
        return {
            "turnRate": this.turnRate,
            "speed": this.speed,
            "breakingForce": this.breakingForce,
            "object": this.object
        };
    };
    Properties.fromJson = function (json) {
        var properties = new Properties();
        properties.turnRate = json['turnRate'];
        properties.speed = json['speed'];
        properties.breakingForce = json['breakingForce'];
        properties.object = json['object'];
        return properties;
    };
    return Properties;
})();
var Message = (function () {
    function Message(id) {
        this.target = '';
        this.id = id;
    }
    Message.fromJson = function (json) {
        var message = new Message(json.id);
        message.action = json.action;
        if (json['destination']) {
            message.destination = Loc.fromJson(json['destination']);
        }
        if (json['location']) {
            message.location = Loc.fromJson(json['location']);
        }
        if (json['properties']) {
            message.properties = Properties.fromJson(json['properties']);
        }
        if (json['target']) {
            message.target = json['target'];
        }
        return message;
    };
    Message.prototype.addPlayer = function (location) {
        this.action = 'create';
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.shootAt = function (ship) {
        this.action = 'shoot';
        this.target = ship.id;
    };
    Message.prototype.logIn = function (location) {
        this.action = 'login';
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.setDestination = function (destination) {
        this.action = 'destination';
        this.destination = destination;
        this.properties = new Properties();
    };
    Message.prototype.setLocation = function (location) {
        this.action = 'location';
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.hasDestination = function () {
        if (typeof this.destination !== 'undefined') {
            return true;
        }
        return false;
    };
    Message.prototype.toJson = function () {
        var result = {
            "id": this.id,
            "action": this.action,
            "target": this.target
        };
        if (this.destination) {
            result['destination'] = this.destination.toJson();
        }
        if (this.properties) {
            result["properties"] = this.properties.toJson();
        }
        if (this.location) {
            result["location"] = this.location.toJson();
        }
        return result;
    };
    return Message;
})();
var Loc = (function () {
    function Loc(x, y) {
        this.x = x;
        this.y = y;
    }
    Loc.prototype.reset = function () {
        this.x = null;
        this.y = null;
    };
    Loc.prototype.isSet = function () {
        if (this.x && this.y) {
            return true;
        }
        return false;
    };
    Loc.prototype.setState = function (rotation, angle, velocityx, velocityy) {
        this.rotation = rotation;
        this.angle = angle;
        this.velocityx = velocityx;
        this.velocityy = velocityy;
    };
    Loc.prototype.toJson = function () {
        var loc = {
            "x": this.x,
            "y": this.y,
            "rotation": this.rotation,
            "velocityx": this.velocityx,
            "velocityy": this.velocityy
        };
        if (typeof this.angle != 'undefined') {
            loc['angle'] = this.angle;
        }
        if (typeof this.rotation != 'undefined') {
            loc['rotation'] = this.rotation;
        }
        if (typeof this.velocityx != 'undefined') {
            loc['velocityx'] = this.velocityx;
        }
        if (typeof this.velocityy != 'undefined') {
            loc['velocityy'] = this.velocityy;
        }
        return loc;
    };
    Loc.fromJson = function (json) {
        if (!json) {
            return null;
        }
        var loc = new Loc(json['x'], json['y']);
        if (json['velocityy']) {
            loc.velocityx = json['velocityy'];
        }
        if (json['velocityx']) {
            loc.velocityy = json['velocityx'];
        }
        if (json['rotation']) {
            loc.rotation = json['rotation'];
        }
        if (json['angle']) {
            loc.angle = json['angle'];
        }
        return loc;
    };
    return Loc;
})();
var Movement = (function () {
    function Movement() {
        this.rotationFinished = false;
        this.movementFinished = false;
        this.moving = false;
        this.rotating = false;
    }
    Movement.prototype.finishMovement = function () {
        this.moving = false;
        this.movementFinished = true;
    };
    Movement.prototype.finishRotation = function () {
        this.rotating = false;
        this.rotationFinished = true;
    };
    Movement.prototype.toJson = function () {
        return {
            "rotationFinished": this.rotationFinished,
            "movementFinished": this.movementFinished,
            "moving": this.moving,
            "rotating": this.rotating
        };
    };
    Movement.fromJson = function (json) {
        var movement = new Movement();
        movement.rotating = json['rotating'];
        movement.rotationFinished = json['rotationFinished'];
        movement.movementFinished = json['movementFinished'];
        movement.moving = json['moving'];
        return movement;
    };
    return Movement;
})();
