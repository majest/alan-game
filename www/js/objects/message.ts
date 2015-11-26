/**
* Message container
* has action which defines the type of the message
*/

interface SlotAble {

    name: string;
    type: string;
}

class Serializer  {

    serialize() {
        var res = {};
        res['@object'] = this.getClassName();
        for (var k in this) {
            var type = typeof this[k];
            if (type == 'string' || type == 'number') {
                res[k] = this[k];
            } else if (type == 'object')  {
                res[k] = this[k].serialize();
            }
        }

        return res;
    }

    public getClassName() {
        var funcNameRegex = /function (.{1,})\(/;
        var results  = (funcNameRegex).exec(this["constructor"].toString());
        return (results && results.length > 1) ? results[1] : "";
    }

    public static load(json) {
        //var input = JSON.parse(json);

        var object = Serializer.getObjectByName(json['@object']);

        for (var k in json) {
            var type = typeof json[k];
                if  (type == 'string' || type == 'number') {
                    object[k] = json[k];
                } else if (type == 'object') {
                    object[k] = this.load(json[k]);
                }
        }
        return object;
    }

    public static getObjectByName(name) : any {
        if (name == 'Properties') { return new Properties();}
        else if (name == 'Message') { return new Message();}
        else if (name == 'Weapon') {return new Weapon();}
        else if (name == 'Loc') {return new Loc();}
        else if (name == 'Movement') {return new Movement();}
        return null
    }
}

class Item extends Serializer implements SlotAble {
    name: string;
    type: string;
}


class Weapon extends Item {

    public damageShield: number;
    public damageHull: number;
    public object: string;
    public range: number;
}


class Properties extends Serializer {
    // how fast ship is turning

    // player type - player/ai
    public type: string;
    public turnRate: number;
    public speed: number;
    public breakingForce: number;
    public object: string;
    public currentHull: number;
    public currentShield: number;
    public maxHull: number;
    public maxShield: number;
    public slot1: Weapon;

    getCurrentHull() {
        return this.currentHull;
    }

    getCurrentShield() {
        return this.currentShield;
    }

    getMaxShield() {
        return this.maxShield;
    }

    getHullPercentage() {
        return (this.getCurrentHull() * 100 / this.getMaxHull());
    }


    getShieldPercentage() {
        return (this.getCurrentShield() * 100) / this.getMaxShield();
    }

    getMaxHull() {
        return this.maxHull;
    }

    setShield(shield: number) {
        this.currentShield = shield;
    }

    setHull(hull: number) {
        this.currentHull = hull;
    }


    public static factory(type = "player") {
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
    }
}


class Message  extends Serializer {

    public id: string;
    public action: string;
    public destination: Loc;
    public location: Loc;
    public properties: Properties;
    public target: string;

    public setId(id) {
        this.id = id;
    }

    addPlayer(location: Loc, properties: Properties) {
        this.action = 'create';
        this.location = location;
        this.properties = properties;
    }

    shootAt(ship: Ship.Ship) {
        this.action = 'shoot';
        this.target = ship.id;
    }

    logIn(location: Loc, properties: Properties) {
        this.action = 'login';
        this.location = location;
        this.properties = properties;
    }

    setDestination(destination: Loc) {
        this.action = 'destination';
        this.destination = destination;
    }

    setLocation(location: Loc) {
        this.action = 'location';
        this.location = location;
    }

    setProperties(properties: Properties) {
        this.action = 'properties';
        this.properties = properties;
    }

    setDestroy() {
        this.action = 'destroy';
    }
    // setMovement(movement: Movement) {
    //     this.action = 'move';
    //     this.movement = movement;
    //     this.properties = new Properties();
    // }

    hasDestination() {
        if (typeof this.destination !== 'undefined') {
            return true;
        }
        return false;
    }
}

/**
* Generic location class containg coordinates
*/
class Loc  extends Serializer {

    public x: number;
    public y: number;
    public rotation: number;
    public angle: number;
    public velocityx: number;
    public velocityy: number;

    set(x,y) {
        this.x = x;
        this.y = y;
    }

    reset() {
        this.x = null;
        this.y = null;
    }

    isSet(): boolean {
        if (this.x && this.y) {
            return true;
        }

        return false;
    }

    setState(rotation, angle, velocityx, velocityy) {
        this.rotation = rotation;
        this.angle = angle;
        this.velocityx = velocityx;
        this.velocityy = velocityy;
    }

}


/**
 Defines whether movement occurs
**/
class Movement extends Serializer {

    public rotationFinished: boolean = false;
    public movementFinished: boolean = false;
    public moving: boolean = false;
    public rotating: boolean = false;

}
