var Properties = (function () {
    function Properties() {
        this.turnRate = 7;
        this.speed = 80;
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
        this.action = [];
        this.login = false;
        this.id = id;
    }
    Message.fromJson = function (json) {
        var message = new Message(json.id);
        message.action = json.action;
        if (json['destination']) {
            message.destination = Loc.fromJson(json['destination']);
        }
        if (json['movement']) {
            message.movement = Movement.fromJson(json['movement']);
        }
        message.location = Loc.fromJson(json['location']);
        if (json['properties']) {
            message.properties = Properties.fromJson(json['properties']);
        }
        if (json['login']) {
            message.login = json['login'];
        }
        return message;
    };
    Message.prototype.containsAction = function (action) {
        if (this.action.indexOf(action) > -1) {
            return true;
        }
        return false;
    };
    Message.prototype.addPlayer = function (location) {
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.logIn = function () {
        this.login = true;
    };
    Message.prototype.shouldLogIn = function () {
        return this.login;
    };
    Message.prototype.setDestination = function (destination) {
        this.action.push('destination');
        this.destination = destination;
        this.movement = new Movement();
        this.properties = new Properties();
    };
    Message.prototype.setLocation = function (location) {
        this.action.push('location');
        this.location = location;
        this.properties = new Properties();
    };
    Message.prototype.setMovement = function (movement) {
        this.action.push('move');
        this.movement = movement;
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
            "action": this.action
        };
        if (this.login) {
            result['login'] = this.login;
        }
        if (this.destination) {
            result['destination'] = this.destination.toJson();
        }
        if (this.movement) {
            result['movement'] = this.movement.toJson();
        }
        if (this.properties) {
            result["properties"] = this.properties.toJson();
        }
        if (this.properties) {
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
        return {
            "x": this.x,
            "y": this.y,
            "rotation": this.rotation,
            "angle": this.angle,
            "velocityx": this.velocityx,
            "velocityy": this.velocityy
        };
    };
    Loc.fromJson = function (json) {
        if (!json) {
            return null;
        }
        var loc = new Loc(json['x'], json['y']);
        if (json['angle'] && json['velocityy'] && json['velocityx'] && json['angle']) {
            loc.velocityx = json['velocityy'];
            loc.velocityy = json['velocityx'];
            loc.rotation = json['rotation'];
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