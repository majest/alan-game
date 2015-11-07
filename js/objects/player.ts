/// <reference path="../main.ts"/>

var Phaser:any;
var accelerateToPointer: any;

class Input {
    public left: boolean = false;
    public right: boolean = false;
    public up: boolean = false;
    public fire: boolean = false;

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

class ShipProperties {

    // how fast ship is turning
    turnRate: number = 1;
    speed: number = 80;
    breakingForce: number = 80;
}


class Player {

    // input: Input;
    // last_input: Input;
    ship: any;
    alive: boolean = true;
    tween: any;
    message: Message;
    properties: ShipProperties = new ShipProperties();
    transporter: MessageTransport;

    // defines whether the player is the current player
    currentPlayer : boolean;

    // stors the phaser game object
    game;
    // player id
    id;

    constructor(game, id) {
        this.id = id;
        this.game = game;
        this.createShip(id);
    }

    // set the transport object
    setTransporter(transporter: MessageTransport) {
        this.transporter = transporter;
    }

    isCurrentPlayer() {
        if (this.currentPlayer) {
            return true;
        }
        return false;
    }

    setCurrentPlayer() {

        // set that this object is the current player
        this.currentPlayer = true;

        // handle click&move
        this.game.input.onDown.add(this.moveToPointer, this);

        // follow this player
        this.game.camera.follow(this.ship);
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
        this.ship.rotation = 0;
        this.ship.angle = 0;
        this.ship.scale.setTo(0.5, 0.5);
        //this.ship.body.rotation = 90;
        //this.ship.rotation = 1;

    }

    getRotation() {
        return this.ship.rotation;
    }

    setRotation(rotation) {
        this.ship.rotation = rotation;
    }

    // movementChanged() {
    //
    //     var inputChanged = this.last_input.compare(this.input);
    //
    //     // saving last state
    //     if (inputChanged) {
    //         this.last_input.load(this.input);
    //     }
    //
    //     return inputChanged;
    // }

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

    setMessage(message: Message) {
        this.message = message;
    }

    moveToPointer(pointer) {
        // set the destination
        this.message = new Message(this.id);
        this.message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        this.message.setMovement(new Movement());
        this.message.setLocation(new Loc(this.ship.x, this.ship.y));
        //this.sendData(this.message);
    }

    sendData(message: Message) {
        this.transporter.sendMessage(message);
    }

    moveToLocation(message: Message) {

        if (!message) return;

        var movement = message.movement;
        var destination = message.destination;

        var x = destination.x;
        var y = destination.y;

        // calcualte distance to target
        var distanceToTarget: number = parseFloat(this.game.physics.arcade.distanceToXY(this.ship, x, y).toFixed(2));

        if (distanceToTarget < 8.0) {
            this.message= null;
        }

        // if the destiantion is Set
        // and movement is not finished (needs to continue performing movement untill end)
        // or we are not moving and movement is finished
        if (destination.isSet() && (!movement.movementFinished || (movement.movementFinished && !movement.moving))) {

            var rotation = this.game.physics.arcade.moveToXY(this.ship, x, y, this.properties.speed);

            if (this.getRotation() !== rotation && (!movement.rotationFinished || (movement.rotationFinished && !movement.rotating))) {

                // Calculate difference between the current angle and targetAngle
                var delta: number = rotation - this.getRotation();

                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI) delta -= Math.PI * 2;
                if (delta < -Math.PI) delta += Math.PI * 2;


                if (delta > 0) {
                    this.ship.angle += this.properties.turnRate;
                } else {
                    this.ship.angle -= this.properties.turnRate;
                }

                var deltaAbs: number = parseFloat(Math.abs(delta).toFixed(2));
                var target: number = parseFloat(Math.abs(this.game.math.degToRad(this.properties.turnRate)).toFixed(2));

                // Just set angle to target angle if they are close
                if (deltaAbs <=  target) {
                    // modify the angle
                    this.setRotation(rotation);
                    movement.finishRotation();
                }
            }

	    // Calculate velocity vector based on this.rotation and this.SPEED
	           this.ship.body.velocity.x = Math.cos(this.ship.rotation) * this.properties.speed
	          this.ship.body.velocity.y = Math.sin(this.ship.rotation) * this.properties.speed


            //console.log('distance:' + distanceToTarget + '-  deltAbs:' + deltaAbs + ' <= deltaTarget:' + targetDelta);

        }
    }


    update(space) {

        this.moveToLocation(this.message);


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


        if (this.currentPlayer) {
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
