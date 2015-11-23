/**
* Message container
* has action which defines the type of the message
*/
class Properties {
    // how fast ship is turning
    turnRate: number = 3;
    speed: number = 60;
    breakingForce: number = 80;
    object: string = 'ship';

    toJson() {
        return {
            "turnRate" : this.turnRate,
            "speed": this.speed,
            "breakingForce": this.breakingForce,
            "object": this.object
        }
    }

    public static fromJson(json: any) : Properties{
        var properties = new Properties();
        properties.turnRate = json['turnRate'];
        properties.speed = json['speed'];
        properties.breakingForce = json['breakingForce'];
        properties.object = json['object'];
        return properties;
    }
}

class Message  {

    public id: string;
    public action: string;
    public destination: Loc;
    public location: Loc;
    public properties: Properties;
    public target: string = '';

    constructor(id: string) {
        this.id = id;
    }

    public static fromJson(json: any) : Message{

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
    }

    addPlayer(location: Loc) {
        this.action = 'create';
        this.location = location;
        this.properties = new Properties();
    }

    shootAt(ship: Ship.Ship) {
        this.action = 'shoot';
        this.target = ship.id;
    }

    logIn(location: Loc) {
        this.action = 'login';
        this.location = location;
        this.properties = new Properties();
    }

    setDestination(destination: Loc) {
        this.action = 'destination';
        this.destination = destination;
        this.properties = new Properties();
    }

    setLocation(location: Loc) {
        this.action = 'location';
        this.location = location;
        this.properties = new Properties();
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

    toJson() {
        var result = {
            "id" : this.id,
            "action" : this.action,
            "target" : this.target
        }

        if (this.destination) {
            result['destination'] = this.destination.toJson();
        }

        // if (this.movement) {
        //     result['movement'] = this.movement.toJson();
        // }

        if (this.properties) {
            result["properties"] = this.properties.toJson();
        }

        if (this.location) {
            result["location"] = this.location.toJson();
        }


        return result;
    }
}

/**
* Generic location class containg coordinates
*/
class Loc  {

    public x: number;
    public y: number;
    public rotation: number;
    public angle: number;
    public velocityx: number;
    public velocityy: number;

    constructor(x,y) {
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

    toJson() {
        var loc = {
            "x" : this.x,
            "y": this.y,
            "rotation" : this.rotation,
            "velocityx" : this.velocityx,
            "velocityy" : this.velocityy
        }

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
    }

    public static fromJson(json: any) : Loc{

        if (!json) {
            return null
        }

        var loc = new Loc(json['x'], json['y']);

        if (json['velocityy'])  {
            loc.velocityx = json['velocityy'];
        }

        if (json['velocityx'])  {
            loc.velocityy = json['velocityx'];
        }

        if (json['rotation'])  {
            loc.rotation = json['rotation'];
        }

        if (json['angle'])  {
            loc.angle = json['angle'];
        }

        return loc;
    }
}


/**
 Defines whether movement occurs
**/
class Movement  {

    public rotationFinished: boolean = false;
    public movementFinished: boolean = false;
    public moving: boolean = false;
    public rotating: boolean = false;

    finishMovement() {
        this.moving = false;
        this.movementFinished = true;
    }

    finishRotation() {
        this.rotating = false;
        this.rotationFinished = true;
    }

    toJson() {
        return {
            "rotationFinished" : this.rotationFinished,
            "movementFinished": this.movementFinished,
            "moving" : this.moving,
            "rotating" : this.rotating
        }
    }

    public static fromJson(json: any) : Movement{
        var movement = new Movement();
        movement.rotating = json['rotating'];
        movement.rotationFinished = json['rotationFinished'];
        movement.movementFinished = json['movementFinished'];
        movement.moving = json['moving'];
        return movement;
    }
}
