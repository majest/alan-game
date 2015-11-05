var Phaser:any;
var accelerateToPointer: any;

class Input {
    public left: boolean = false;
    public right: boolean = false;
    public up: boolean = false;
    public fire: boolean = false;
    public rotationFinished: boolean = false;
    public movementFinished: boolean = false;

    reset() {
        this.rotationFinished = false;
        this.movementFinished = false;
    }

    load(input: Input) {
        this.left = input.left;
        this.right = input.right;
        this.up = input.up;
        this.fire = input.fire;
    }

    compare(input: Input) {
        return (
            this.left != input.left ||
            this.right != input.right ||
            this.up != input.up ||
            this.fire != input.fire
        );
    }
}

class Command {
    destination: Destination = new Destination();
}

class Destination {
    public x: number;
    public y: number;

    reset() {
        this.x = null;
        this.y = null;
    }
}

class ShipProperties {

    // how fast ship is turning
    turnRate: number = 1;
    speed: number = 80;
    breakingForce: number = 80;
}


class Player {

    input: Input;
    last_input: Input;
    ship: any;
    alive: boolean = true;
    tween: any;

    // command for the ship action
    command: Command = new Command();

    properties: ShipProperties = new ShipProperties();

    constructor(private game, id, public currentPlayerId) {
        this.input = new Input();
        this.last_input = new Input();
        this.createShip(id);
        this.game.input.onDown.add(this.moveToPointer, this);
    }

    createShip(id) {
        this.ship = this.game.add.sprite(300, 300, 'ship');

        this.ship.id = id;
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        //this.ship.body.setZeroRotation();
        //this.ship.body.allowRotation = true;
        this.ship.body.drag.set(this.properties.breakingForce);
        this.ship.body.maxVelocity.set(this.properties.speed);
        this.ship.anchor.setTo(0.5, 0.5);
        //this.ship.body.maxAngular = 500;
        this.ship.body.angularDrag = 50;
        this.ship.rotation = 90;

    }

    movementChanged() {

        var inputChanged = this.last_input.compare(this.input);

        // saving last state
        if (inputChanged) {
            this.last_input.load(this.input);
        }

        return inputChanged;
    }

    serialize(): Object {
        return {
            "id" : this.ship.id,
            "loc" : {
                "x" : this.ship.x,
                "y" : this.ship.y,
                "a" : this.ship.angle,
                "v" : {"s" : this.getSpeed(), "x": this.ship.body.velocity.x, "y": this.ship.body.velocity.y}
            }
        };
    }

    getSpeed(): Number {
        return Math.sqrt(Math.pow(this.ship.body.velocity.x,2) + Math.pow(this.ship.body.velocity.y,2));
    }


    moveToPointer(pointer) {
        this.command.destination.x = pointer.worldX;
        this.command.destination.y = pointer.worldY;
        this.input.reset();
    }

    moveToLocation(command: Command) {

        var x = command.destination.x;
        var y = command.destination.y;
        var distanceToTarget: number = parseFloat(this.game.physics.arcade.distanceToXY(this.ship, x, y).toFixed(2));

        var targetAngle;


        if (distanceToTarget < 4.0) {
            this.input.rotationFinished = true;
            this.input.movementFinished = true;
        }

        if (x && y && !this.input.movementFinished) {
            //console.log('------------------------ MOVEMENT ------------------' + this.input.movementFinished);
            var rotation = this.game.physics.arcade.moveToXY(this.ship, x, y, this.properties.speed);

            var targetAngle = this.game.math.angleBetween(
                x, y,
                this.ship.x, this.ship.y // ----- >>>> HOW TO CALL PLAYER ???
            );

            targetAngle = rotation
            if (this.ship.rotation !== targetAngle && !this.input.rotationFinished) {

                //console.log('------------------------ ROTATION ------------------');
                // Calculate difference between the current angle and targetAngle
                var delta: number = targetAngle - this.ship.rotation;

                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI) delta -= Math.PI * 2;
                if (delta < -Math.PI) delta += Math.PI * 2;

                if (delta > 0) {
                    // Turn clockwise
                    this.ship.angle += this.properties.turnRate;
                } else {
                    // Turn counter-clockwise
                    this.ship.angle -= this.properties.turnRate;
                }

                var deltaAbs: number = parseFloat(Math.abs(delta).toFixed(4));
                var targetDelta: number = parseFloat(Math.abs(this.game.math.degToRad(targetAngle)).toFixed(4));

                // Just set angle to target angle if they are close
                if (deltaAbs <=  targetDelta) {
                    // modify the angle
                    this.ship.rotation = targetAngle;
                    this.input.rotationFinished = true;
                }

                console.log("rotation:" + targetAngle + ", delta:" + delta + ", shiprotation:" + this.ship.rotation);

            }


	    // Calculate velocity vector based on this.rotation and this.SPEED
	           this.ship.body.velocity.x = Math.cos(this.ship.rotation) * this.properties.speed
	          this.ship.body.velocity.y = Math.sin(this.ship.rotation) * this.properties.speed


            //console.log('distance:' + distanceToTarget + '-  deltAbs:' + deltaAbs + ' <= deltaTarget:' + targetDelta);

        }
    }

    update(space, command) {

        this.moveToLocation(this.command);


            //this.ship.rotation = this.game.physics.arcade.angleToPointer(this.ship, this.clickPointer);
    //    this.ship.rotation = this.game.physics.arcade.angleToPointer(this.ship, this.game.input.activePointer);
        // sent only when state changes
        // if (this.ship.id  && (this.movementChanged() || this.game.time.now % 500 == 0)) {
        //     this.input.x = this.ship.x;
        //     this.input.y = this.ship.y;
        //     this.input.angle = this.ship.angle
        // }
        //
        // if (this.input.up) {
        //
        //     // Maximum speed
        //     if (this.getSpeed() < 6) {
        //         this.ship.body.thrust(100);
        //     }
        //
        // } else {
        //     this.ship.body.setZeroRotation();
        // }
        //
        //
        // // left right
        // if (this.input.left) {
        //     this.ship.body.rotateLeft(100);
        //
        // } else if (this.input.right) {
        //     this.ship.body.rotateRight(100);
        //
        // } else {
        //     this.ship.body.setZeroRotation();
        // }

        // if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        //     this.fireBullet();
        // }


        if (this.ship.id == this.currentPlayerId) {
            if (!this.game.camera.atLimit.x) {
                space.tilePosition.x -= (this.ship.body.velocity.x) * this.game.time.physicsElapsed;
            }

            if (!this.game.camera.atLimit.y) {
                space.tilePosition.y -= (this.ship.body.velocity.y) * this.game.time.physicsElapsed;
            }
        }

        //screenWrap(this.ship);
        //this.bullets.forEachExists(screenWrap, this);
    }

}
