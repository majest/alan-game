
/// <reference path="../phaser/typescript/phaser.d.ts" />



module Ship {

    export class Ship extends Phaser.Sprite {

        properties: Properties;
        destination: Loc;
        public id: string;
        name: any; // players name on the screen

        constructor(game: Phaser.Game, x: number, y: number, id: string) {

            console.log('Ship::constructor - x,y' + x + ',' + y);
            super(game, x, y, 'ship', 0);



            this.properties = new Properties();
            //game.add.existing(this);

            this.id = id;



            game.physics.enable(this, Phaser.Physics.ARCADE);

            //this.ship.body.setZeroRotation();
            //this.ship.body.allowRotation = true;
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
            this.body.angularDrag = 50;
            this.scale.setTo(0.5, 0.5);
            this.anchor.setTo(0.5, 0.5);
            this.addName();
        }

        update() {
            this.moveToLocation();
        }

        handleMessage(message: Message) {

            console.log(playerId + ':Ship::handleMessage - action:' + message.action );
            // accept messages which are designated only for this ship
            if (message.id != this.id) {
                console.log(playerId + ':Ship::handleMessage I\'m ' + this.id + ' and this message is for: ' + message.id);
                return;
            }


            // handle destination at all times
            if (message.destination) {
                console.log(playerId + ':Ship::handleMessage - handling destination');
                console.log(message.destination);

                this.destination = message.destination;

                // handle location changes only if it's a ship that is not a current plater
            } else if (message.location && message.id != playerId) {

                console.log(playerId + ':Ship::handleMessage - handling location for ship ' + message.id);
                //this.setLocation(message.location);
            }



        }

        move() {

            if (!this.destination) {
                return;
            }


            // calcualte distance to target
            var distanceToTarget: number = parseFloat(this.game.physics.arcade.distanceToXY(this, this.destination.x, this.destination.y).toFixed(2));

            // finish processing the message once we have reached the target
            if (distanceToTarget < 8.0) {
                this.destination = null;
            } else {
                return this.game.physics.arcade.moveToXY(this, this.destination.x, this.destination.y, this.properties.speed);
            }
        }

        rotationSpeed(rotation) {


            if (rotation && this.rotation !== rotation) {

                // Calculate difference between the current angle and targetAngle
                var delta: number = rotation - this.rotation;

                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI) delta -= Math.PI * 2;
                if (delta < -Math.PI) delta += Math.PI * 2;


                if (delta > 0) {
                    this.angle += this.properties.turnRate;
                } else {
                    this.angle -= this.properties.turnRate;
                }

                var deltaAbs: number = parseFloat(Math.abs(delta).toFixed(2));
                var target: number = parseFloat(Math.abs(Phaser.Math.degToRad(this.properties.turnRate)).toFixed(2));

                // Just set angle to target angle if they are close
                if (deltaAbs <=  target) {
                    this.rotation = rotation;
                }
            }

            this.body.velocity.x = Math.cos(this.rotation) * this.properties.speed
            this.body.velocity.y = Math.sin(this.rotation) * this.properties.speed
        }


        moveToLocation() {

            if (!this.destination) {
                return;
            }

            this.rotationSpeed(this.move())
            this.updateName();
        }


        addName() {
            console.log('Ship::addName');
            var style = { font: "11px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
            this.name = this.game.add.text(this.x, this.y, this.id, style);
            this.updateName();
        }

        updateName() {
            this.name.x = Math.floor(this.x + this.width / 2) - this.width + 10;
            this.name.y = Math.floor(this.y + this.height / 2) - this.height - 10;
        }

        getLocation() : Loc {
            var loc =  new Loc(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            console.log(loc);
            console.log(this);
            return loc;
        }

        setLocation(loc: Loc) {
            this.rotation = loc.rotation;
            this.angle = loc.angle;
            this.body.velocity.x = loc.velocityx;
            this.body.velocity.y = loc.velocityy;
        }

    }
}

module Group {
        export class Ship extends Phaser.Group {

            constructor(game) {
                super(game);
            }

            objectMap : Phaser.Sprite[]// : Phaser.Sprite;

            add(sprite: Ship.Ship) {
                super.add(sprite);
            }
            // getById(id: string) : Ship.Ship  {
            //     super.forEach(function(ship: Ship.Ship) {
            //         if (ship.id == id) {
            //             return ship;
            //         }
            //         return null;
            //     }, this);
            // }

        }
}
