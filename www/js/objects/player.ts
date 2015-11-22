
/// <reference path="../phaser/typescript/phaser.d.ts" />



module Ship {

    export class Ship extends Phaser.Sprite {

        properties: Properties;
        destination: Loc;
        public id: string;
        name: any; // players name on the screen
        sprites; //Phaser.Sprite[] = [];

        crosshair;

        fireRate = 100;
        nextFire = 0;
        fireDuration = 0;
        bullets;
        actionHandler;

        // sets the targeted ship
        target;
        constructor(game: Phaser.Game, x: number, y: number, id: string) {
            super(game, x, y, 'ship', 0);
            console.log('Ship::constructor - x,y' + x + ',' + y);


            this.properties = new Properties();
            //game.add.existing(this);

            game.physics.enable(this, Phaser.Physics.ARCADE);

            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

            this.bullets.createMultiple(50, 'bullet');
            this.bullets.setAll('checkWorldBounds', true);
            this.bullets.setAll('outOfBoundsKill', true);

            //this.ship.body.setZeroRotation();
            //this.ship.body.allowRotation = true;
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
            this.body.angularDrag = 50;
            this.body.id = id;
            this.id = id;
            this.scale.setTo(0.4, 0.4);
            this.anchor.setTo(0.5, 0.5);
            this.inputEnabled = true;
            this.addName();
            this.events.onInputDown.add(this.acquireTarget, this);

            this.actionHandler = ActionHandler.getInstance();
              // .existing(crosshair);
            //this.crosshair = Phaser.Sprite.call(this,game,x,y,'crosshair');
            this.sprites = this.game.add.group();
            this.crosshair = this.game.add.sprite(x,y,'crosshair');
            this.crosshair.anchor.setTo(0.5,0.5);
            this.crosshair.visible = false;
            this.sprites.add(this.crosshair);
            //this.game.input.onDown.add(this.acquireTarget, this);
            //this.crosshair.visible = true;
            // this.sprites.forEach(function(sprite){
            //     // Here you can apply the same properties to every cup.
            // //    sprite.anchor.setTo(0.5,0.5);
            //     sprite.visible = false;
            // });

            console.log('--------------------');
            // console.log(crosshair);
            // this.sprites.push(crosshair);
        }

        update() {

            this.crosshair.x = this.x;
            this.crosshair.y = this.y;
            // if (this.id != playerId) {
            // this.sprites.forEach(function(cup){
            //     cup.x= this.x
            //     cup.y= this.y
            // });
            // }

            this.updateName();

            if (this.target) {
                this.fire(this.target);
            }
            //  Run collision
            if (this.bullets) {
                this.game.physics.arcade.overlap(this.bullets, this.actionHandler.getShips(), this.bulletCollisionHandler, null, this);
            }

            this.moveToLocation();
        }

        bulletCollisionHandler(bullet, ship) {

            // ignore the colision for ourselfs
            if (ship.id == this.id) return;

            bullet.kill();
        }

        // fires a bullet
        fire(ship) {
            // if current time is less than a time + fire duration  - this makes sure we fire only one serie
            // and ship we are shooting at is not us
            // and curretnt ime is more than a next fire - which means it's time to shoot a bullet
            // and number of dead bullets is more than
            if (this.game.time.now < this.fireDuration && ship.id != this.id && this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
            {
                console.log('shoot2');
                // correct the time so we should the next one after firerate
                this.nextFire = this.game.time.now + this.fireRate;

                // get the first dead bullet
                var bullet = this.bullets.getFirstDead();

                // reset the position the bullet so it looks like it comes out from our ship
                bullet.reset(this.x - 4, this.y - 4);

                // shoot the bullets towards the target
                this.game.physics.arcade.moveToXY(bullet, ship.x, ship.y, 300);// .moveToPointer(bullet, 300);
            }

        }

        // acquire target - makes the crosshair visible on the ship we have clicked on
        acquireTarget(ship, pointer) {
            console.log(playerId + ':Ship::acquireTarget');
            if (ship.id !=  playerId) {

                var player = this.actionHandler.getPlayer().getShip();
                console.log(playerId + ':Ship::acquireTarget  - setting this ship: ' + this.id + ' as a target of ship: ' + player.id);
                // set this ship which is targetted on the ship which is targetting - current player
                player.setTarget(this);

                // make the crosshair visible
                this.crosshair.visible = true;
                return this.crosshair;
            }
        }

        setTarget(target : Ship.Ship) {
            console.log(playerId + ':Ship::setTarget');
            this.fireDuration = this.game.time.now + 1000;
            this.target = target;


        }

        handleMessage(message: Message) {

            console.log(playerId + ':Ship::handleMessage - action:' + message.action );
            // accept messages which are designated only for this ship
            if (message.id != this.id) {
                console.log(playerId + ':Ship::handleMessage I\'m ' + this.id + ' and this message is for: ' + message.id);
                return;
            }

            if (message.location) {
               console.log(playerId + ':Ship::handleMessage - handling location for ship ' + message.id);
               this.setLocation(message.location);
            }

            // handle destination at all times
            if (message.destination) {
                console.log(playerId + ':Ship::handleMessage - handling destination');
                console.log(message.destination);
                this.destination = message.destination;
                // handle location changes only if it's a ship that is not a current plater
            }

            // 
            // if (message.fire) {
            //
            // }

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




            // this.sprites.x = this.x;
            // this.sprites.y = this.y;
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

        updateSprites() {

        }

        getLocation() : Loc {
            var loc =  new Loc(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            console.log(loc);
            return loc;
        }

        setLocation(location: Loc) {
            //this.setLocation(message.location);
             this.x = location.x;
             this.y = location.y;

             // lag correction
             var xfix = 3 * Math.cos(Phaser.Math.degToRad(this.angle));
             var yfix = 3 * Math.sin(Phaser.Math.degToRad(this.angle));
             this.x += xfix;
             this.y += yfix;


             if (typeof location.rotation != 'undefined') {
                this.rotation = location.rotation;
             }

             if (typeof location.angle != 'undefined') {
                this.angle = location.angle;
             }

             if (typeof  location.velocityx != 'undefined') {
                this.body.velocity.x = location.velocityx;
             }

             if (typeof  location.velocityy != 'undefined') {
                this.body.velocity.y = location.velocityy;
             }
        }

    }
}

module Group {
        export class Ship extends Phaser.Group {

            //ships: Ship.Ship[] = [];

            constructor(game) {
                super(game);
            }

            objectMap : Phaser.Sprite[]// : Phaser.Sprite;

            add(sprite: Ship.Ship) {
                super.add(sprite);
                //this.ships.push(sprite);
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
