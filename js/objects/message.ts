class Movement {

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
}


class Message {
    public id: string;
    public action: string[] = [];

    public location: Loc;
    public destination: Loc;
    public movement: Movement;

    constructor(id: string) {
        this.id = id;
    }

    setDestination(destination: Loc) {
        this.action.push('destination')
        this.destination = destination;
        this.movement = new Movement();
    }

    setLocation(location: Loc) {
        this.action.push('location')
        this.location = location;
    }

    setMovement(movement: Movement) {
        this.action.push('move')
        this.movement = movement;
    }

    addPlayer(location: Loc) {
        this.action.push('player_add');
        this.location = location;
    }

    logIn(location: Loc) {
        this.action.push('player_login');
        this.location = location;
    }

    containsAction(action: string) {
        if (this.action.indexOf(action) >  -1 ) {
            return true;
        }
        return false;
    }

    toJson() {
        return {
            "id" : this.id,
            "action" : this.action,
            "destination": this.destination.toJson(),
            "movement": this.movement.toJson(),
            "location": this.location.toJson()
        }
    }
}

class Loc {

    public x: number;
    public y: number;

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

    toJson() {
        return {
            "x" : this.x,
            "y": this.y
        }
    }
}
