var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Serializer = (function () {
    function Serializer() {
    }
    Serializer.prototype.serialize = function () {
        var res = {};
        res['@object'] = this.getClassName();
        for (var k in this) {
            var type = typeof this[k];
            if (type == 'string' || type == 'number') {
                res[k] = this[k];
            }
            else if (type == 'object') {
                res[k] = this[k].serialize();
            }
        }
        return res;
    };
    Serializer.prototype.getClassName = function () {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(this["constructor"].toString());
        return (results && results.length > 1) ? results[1] : "";
    };
    Serializer.load = function (json) {
        var object = Serializer.getObjectByName(json['@object']);
        for (var k in json) {
            var type = typeof json[k];
            if (type == 'string' || type == 'number') {
                object[k] = json[k];
            }
            else if (type == 'object') {
                object[k] = this.load(json[k]);
            }
        }
        return object;
    };
    Serializer.getObjectByName = function (name) {
        if (name == 'Properties') {
            return new Properties();
        }
        else if (name == 'Message') {
            return new Message();
        }
        else if (name == 'Weapon') {
            return new Weapon();
        }
        else if (name == 'Loc') {
            return new Loc();
        }
        else if (name == 'Movement') {
            return new Movement();
        }
        return null;
    };
    return Serializer;
})();
var Item = (function (_super) {
    __extends(Item, _super);
    function Item() {
        _super.apply(this, arguments);
    }
    return Item;
})(Serializer);
var Weapon = (function (_super) {
    __extends(Weapon, _super);
    function Weapon() {
        _super.apply(this, arguments);
    }
    return Weapon;
})(Item);
var Properties = (function (_super) {
    __extends(Properties, _super);
    function Properties() {
        _super.apply(this, arguments);
    }
    Properties.prototype.getCurrentHull = function () {
        return this.currentHull;
    };
    Properties.prototype.getCurrentShield = function () {
        return this.currentShield;
    };
    Properties.prototype.getMaxShield = function () {
        return this.maxShield;
    };
    Properties.prototype.getHullPercentage = function () {
        return (this.getCurrentHull() * 100 / this.getMaxHull());
    };
    Properties.prototype.getShieldPercentage = function () {
        return (this.getCurrentShield() * 100) / this.getMaxShield();
    };
    Properties.prototype.getMaxHull = function () {
        return this.maxHull;
    };
    Properties.prototype.setShield = function (shield) {
        this.currentShield = shield;
    };
    Properties.prototype.setHull = function (hull) {
        this.currentHull = hull;
    };
    Properties.factory = function (type) {
        if (type === void 0) { type = "player"; }
        var properties = new Properties();
        properties.turnRate = 3;
        properties.speed = 60;
        properties.breakingForce = 80;
        properties.object = 'ship';
        properties.currentHull = 140;
        properties.currentShield = 250;
        properties.maxHull = 140;
        properties.maxShield = 250;
        properties.type = type;
        var weapon = new Weapon();
        weapon.damageShield = 3;
        weapon.damageHull = 3;
        weapon.name = 'Projectile Turrent';
        weapon.type = 'weapon';
        weapon.object = 'bullets';
        weapon.range = 10;
        properties.slot1 = weapon;
        return properties;
    };
    return Properties;
})(Serializer);
var Message = (function (_super) {
    __extends(Message, _super);
    function Message() {
        _super.apply(this, arguments);
    }
    Message.prototype.setId = function (id) {
        this.id = id;
    };
    Message.prototype.addPlayer = function (location, properties) {
        this.action = 'create';
        this.location = location;
        this.properties = properties;
    };
    Message.prototype.shootAt = function (ship) {
        this.action = 'shoot';
        this.target = ship.id;
    };
    Message.prototype.logIn = function (location, properties) {
        this.action = 'login';
        this.location = location;
        this.properties = properties;
    };
    Message.prototype.setDestination = function (destination) {
        this.action = 'destination';
        this.destination = destination;
    };
    Message.prototype.setLocation = function (location) {
        this.action = 'location';
        this.location = location;
    };
    Message.prototype.setProperties = function (properties) {
        this.action = 'properties';
        this.properties = properties;
    };
    Message.prototype.setDestroy = function () {
        this.action = 'destroy';
    };
    Message.prototype.hasDestination = function () {
        if (typeof this.destination !== 'undefined') {
            return true;
        }
        return false;
    };
    return Message;
})(Serializer);
var Loc = (function (_super) {
    __extends(Loc, _super);
    function Loc() {
        _super.apply(this, arguments);
    }
    Loc.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
    };
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
    return Loc;
})(Serializer);
var Movement = (function (_super) {
    __extends(Movement, _super);
    function Movement() {
        _super.apply(this, arguments);
        this.rotationFinished = false;
        this.movementFinished = false;
        this.moving = false;
        this.rotating = false;
    }
    return Movement;
})(Serializer);
