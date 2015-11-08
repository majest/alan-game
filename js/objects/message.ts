/**
* Message container
* has action which defines the type of the message
*/
class Properties {
    // how fast ship is turning
    turnRate: number = 1;
    speed: number = 80;
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
    public action: string[] = [];
    public destination: Loc;
    public movement: Movement;
    public location: Loc;
    public properties: Properties;

    public login: boolean = false;

    constructor(id: string) {
        this.id = id;
    }

    public static fromJson(json: any) : Message{

        var message = new Message(json.id);
        message.action = json.action;
        message.destination = Loc.fromJson(json['destination']);
        message.location = Loc.fromJson(json['location']);
        message.movement = Movement.fromJson(json['movement']);
        message.properties = Properties.fromJson(json['properties']);
        return message;
    }

    containsAction(action: string) {
        if (this.action.indexOf(action) >  -1 ) {
            return true;
        }
        return false;
    }

    addPlayer(location: Loc) {
        this.location = location;
        this.properties = new Properties();
    }

    logIn() {
        this.login = true;
    }

    shouldLogIn() {
        return this.login;
    }

    setDestination(destination: Loc) {
        this.action.push('destination')
        this.destination = destination;
        this.movement = new Movement();
        this.properties = new Properties();
    }

    setLocation(location: Loc) {
        this.action.push('location')
        this.location = location;
        this.properties = new Properties();
    }

    setMovement(movement: Movement) {
        this.action.push('move')
        this.movement = movement;
        this.properties = new Properties();
    }

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
            "destination": this.destination.toJson(),
            "movement": this.movement.toJson(),
            "location": this.location.toJson(),
        }

        if (this.properties) {
            result["properties"] = this.properties.toJson();
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
        return {
            "x" : this.x,
            "y": this.y,
            "rotation" : this.rotation,
            "angle" : this.angle,
            "velocityx" : this.velocityx,
            "velocityy" : this.velocityy
        }
    }

    public static fromJson(json: any) : Loc{
        var loc = new Loc(json['x'], json['y']);

        if (json['angle'] && json['velocityy'] && json['velocityx'] && json['angle']) {
            loc.velocityx = json['velocityy'];
            loc.velocityy = json['velocityx'];
            loc.rotation = json['rotation'];
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
