var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Serializer = (function () {
    function Serializer() {
        this.gid = this.guid();
    }
    Serializer.prototype.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    Serializer.prototype.serialize = function () {
        var res = {};
        res['@object'] = this.getClassName();
        for (var k in this) {
            var type = typeof this[k];
            if (type == 'function')
                continue;
            if (type == 'string' || type == 'number') {
                res[k] = this[k];
            }
            else if (type == 'object' && !Array.isArray(this[k])) {
                res[k] = this[k].serialize();
            }
            else if (type == 'object' && Array.isArray(this[k])) {
                var a = [];
                for (var i in this[k]) {
                    var obj = this[k][i];
                    a.push(obj.serialize());
                }
                res[k] = a;
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
        console.log('loading ' + json['@object']);
        var object = Serializer.getObjectByName(json['@object']);
        for (var k in json) {
            var type = typeof json[k];
            if (type == 'function')
                continue;
            if (type == 'string' || type == 'number') {
                object[k] = json[k];
            }
            else if (type == 'object' && json[k] != null && !Array.isArray(json[k])) {
                object[k] = this.load(json[k]);
            }
            else if (type == 'object' && json[k] != null && Array.isArray(json[k])) {
                var a = [];
                for (var i in json[k]) {
                    a.push(this.load(json[k][i]));
                }
                object[k] = a;
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
        else if (name == 'WeaponProperties') {
            return new WeaponProperties();
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
var ItemProperties = (function (_super) {
    __extends(ItemProperties, _super);
    function ItemProperties() {
        _super.apply(this, arguments);
        this.modDamageHull = 0;
        this.modDamageShield = 0;
        this.modSpeed = 0;
    }
    ItemProperties.createWarpDrive = function () {
        var ip = new ItemProperties();
        ip.name = 'Warp Drive Mk1';
        ip.modSpeed = 500;
        ip.type = "warpDrive";
        return ip;
    };
    return ItemProperties;
})(Serializer);
var WeaponProperties = (function (_super) {
    __extends(WeaponProperties, _super);
    function WeaponProperties() {
        _super.apply(this, arguments);
    }
    WeaponProperties.createProjectileTurret = function () {
        var weapon = new WeaponProperties();
        weapon.damageShield = 3;
        weapon.damageHull = 3;
        weapon.name = 'Projectile Turrent';
        weapon.type = 'projectile';
        weapon.range = 10;
        weapon.multiple = 10;
        weapon.gfx = 'bullet';
        weapon.fireRate = 100;
        weapon.fireDuration = 500;
        weapon.lifespan = 1000;
        weapon.tracking = false;
        weapon.speed = 300;
        weapon.turnRate = 0;
        return weapon;
    };
    WeaponProperties.createMissileTurret = function () {
        var weapon = new WeaponProperties();
        weapon.damageShield = 20;
        weapon.damageHull = 15;
        weapon.name = 'Missile Turrent';
        weapon.type = 'missile';
        weapon.gfx = 'missile';
        weapon.range = 15;
        weapon.multiple = 1;
        weapon.fireRate = 1000;
        weapon.fireDuration = 1100;
        weapon.lifespan = 3000;
        weapon.tracking = true;
        weapon.speed = 100;
        weapon.turnRate = 5;
        return weapon;
    };
    return WeaponProperties;
})(Serializer);
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
    Message.prototype.addItem = function (item) {
        if (this.items == null) {
            this.items = [];
        }
        this.items.push(item);
    };
    Message.prototype.addWeapon = function (weapon) {
        if (this.weapons == null) {
            this.weapons = [];
        }
        this.weapons.push(weapon);
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
    Message.prototype.setWeapons = function (weapons) {
        this.action = 'weapons';
        this.weapons = weapons;
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
