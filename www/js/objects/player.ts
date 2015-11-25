
/// <reference path="../phaser/typescript/phaser.d.ts" />


class HPBar {

    hpbar;
    bgbar;

    name;

    width = 50;
    height = 3;
    animDuration = 1;

    hp = 100;

    constructor(name, x, y, color, percentage) {
        this.name = name;
        this.bgbar = this.drawBar(x,y, '#ff0000');
        this.hpbar = this.drawBar(x,y, color);
        this.set(percentage);
    }

    drawBar(x,y,color) {
        var hpb = game.add.bitmapData(this.width, this.height);
        hpb.ctx.beginPath();
        hpb.ctx.rect(0, 0, this.width, this.height);
        hpb.ctx.fillStyle = color;
        hpb.ctx.fill();

        var hpbar = game.add.sprite(x, y, hpb);
        //hpbar.anchor.set(0.5);
        return hpbar;
    }

    update(x, y) {
        this.hpbar.x = x;
        this.hpbar.y = y

        this.bgbar.x = x;
        this.bgbar.y = y;
    }


    set(newValue) {
        if(newValue < 0) newValue = 0;
        if(newValue > 100) newValue = 100;

        var newWidth =  (newValue * this.width) / 100;

        this.setWidth(newWidth);
    }

    setWidth(newWidth){
        game.add.tween(this.hpbar).to( { width: newWidth }, this.animDuration, Phaser.Easing.Linear.None, true);
    };

}


module Ship {

    export class Ship extends Phaser.Sprite {

        // ship properties
        properties: Properties;

        // current destination
        destination: Loc;

        // ship id
        public id: string;

        // players name on the screen
        name: any;

        // crosshair sprite
        crosshair;

        shield;

        // shooting details
        fireRate = 100;
        nextFire = 0;
        fireDuration = 0;


        // bullets
        bullets;

        // action handler to access other ships
        actionHandler;

        // sets the targeted ship
        target = null;

        firing = false;

        fireButton;

        shieldHpBar;
        hullHpBar;

        healthPercentage = 100;

        constructor(game: Phaser.Game, x: number, y: number, id: string) {
            super(game, x, y, 'ship', 0);

            game.physics.enable(this, Phaser.Physics.ARCADE);

            this.bullets = this.game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

            this.bullets.createMultiple(50, 'bullet');
            this.bullets.setAll('checkWorldBounds', true);
            this.bullets.setAll('outOfBoundsKill', true);

            this.body.bounce.x = 0.5;
            this.body.bounce.y = 0.5;

            this.body.drag.set(1);
            this.body.maxVelocity.set(1);

            this.body.id = id;
            this.id = id;
            this.scale.setTo(0.4, 0.4);
            this.anchor.setTo(0.5, 0.5);
            this.inputEnabled = true;
            this.addName();

            this.events.onInputDown.add(this.acquireTarget, this);

            this.actionHandler = ActionHandler.getInstance();
            this.crosshair = this.game.add.sprite(x,y,'crosshair');
            this.crosshair.visible = false;
            this.crosshair.anchor.setTo(0.5,0.65);
            this.crosshair.alpha = 0.5

            this.shield = this.game.add.sprite(x,y,'shield');
            this.shield.anchor.setTo(0.5,0.48);
            this.shield.scale.setTo(0.3,0.3);
            this.shield.visible = false;
            //this.shield.alpha = 0.5


            this.shieldHpBar = new HPBar('shield', this.x - this.width, this.y + this.height - 10, '#0099ff', 100);
            this.hullHpBar = new HPBar('hull', this.x - this.width, this.y + this.height - 10, '#00ff00', 100);


            // var hull = this.game.add.bitmapData(this.width, 3);
            // hull.ctx.beginPath();
            // hull.ctx.rect(0, 0, this.width, 3);
            // hull.ctx.fillStyle = '#00ff00';
            // hull.ctx.fill();
            //
            // this.hullHpBar = this.game.add.sprite(this.x + 3, this.y + this.height - 10, hull);
            // this.hullHpBar.anchor.set(0.5);

            //var healthbar = this.game.add.sprite(this.x - 15,this.y + 25,'healthbar');
            // healthbar.cropEnabled = true;
            // healthbar.crop.width = (character.health / character.maxHealth) * healthbar.width

            console.log(this.id + ':Ship::constructor - x,y' + x + ',' + y);

            // game.onPause.add(this.gamePause, this);
            // game.onResume.add(this.gameResume, this);
        }

        gamePause() {
            console.log('pause');
        }

        gameResume() {
            console.log('resume');
        }

        update() {

            this.handleKeys();
            this.crosshair.x = this.x;
            this.crosshair.y = this.y;
            this.crosshair.rotation = this.crosshair.rotation + 0.01;
            this.shield.x = this.x;
            this.shield.y = this.y;
            this.updateName();


            this.shieldHpBar.update(this.x - this.width + 10, this.y +  this.height - 10);
            this.hullHpBar.update(this.x - this.width + 10, this.y +  this.height - 7);


            if (this.firing) {
                this.firingAnim(this.target);
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

            // check if targetted ship still has shield
            var damage = 0;

            if (ship.hasShield()) {
                damage = this.getProperties().slot1.damageShield;

            // damage hull next
            } else {
                damage = this.getProperties().slot1.damageHull;
            }

            ship.takeHit(damage);
            bullet.kill();
        }

        takeHit(hit) {


            // if we still have shield
            if (this.hasShield()) {
                // shield left
                var shieldLeft = this.properties.getCurrentShield() - hit;

                // if shield droppped to less than 0 take from hull
                if (shieldLeft < 0) {

                    // calcualte how much to take from hull
                    hit = Math.abs(shieldLeft);

                    // set shield to 0
                    shieldLeft = 0;

                // still some shield left, no damage left
                } else {
                    hit = 0;
                }

                this.properties.setShield(shieldLeft);
                this.shieldHpBar.set(this.properties.getShieldPercentage());
                console.log(this.id + ':Taking hit : shield Left:' + shieldLeft + '  shieldPercentage:' + this.properties.getShieldPercentage());
            }

            if (hit > 0 && this.hasHull()) {
                var hullLeft = this.properties.getCurrentHull() - hit;
                this.properties.setHull(hullLeft);
                this.hullHpBar.set(this.properties.getHullPercentage());
            }

            if (!this.hasHull()) {
                console.log('DIE');
            }
        }

        hasHull() {
            if (this.properties.getCurrentHull() > 0) {
                return true;
            }
        }

        hasShield() {
            if (this.properties.getCurrentShield() > 0) {
                return true;
            }
        }

        // fires a bullet
        firingAnim(ship) {


            // if current time is less than a time + fire duration  - this makes sure we fire only one serie
            // and ship we are shooting at is not us
            // and curretnt ime is more than a next fire - which means it's time to shoot a bullet
            // and number of dead bullets is more than
            if (this.game.time.now < this.fireDuration && ship.id != this.id && this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
            {
                //console.log(this.id + ':Ship::shooting ' + ship.id);
                // correct the time so we should the next one after firerate
                this.nextFire = this.game.time.now + this.fireRate;

                // get the first dead bullet
                var bullet = this.bullets.getFirstDead();

                // reset the position the bullet so it looks like it comes out from our ship
                bullet.reset(this.x - 4, this.y - 4);

                // shoot the bullets towards the target
                this.game.physics.arcade.moveToXY(bullet, ship.x, ship.y, 300);// .moveToPointer(bullet, 300);
            }

            if (this.game.time.now > this.fireDuration) {
                // setting back
                this.firing = false;
                // console.log(this.id + ':Ship - setting destination true');
            }
        }

        // acquire target - makes the crosshair visible on the ship we have clicked on
        acquireTarget(ship, pointer) {
            console.log(this.id + ':Ship::makeSelfATarget');

            if (ship.id !=  playerId) {

                // remove target if is set
                if (player.ship.hasTarget()) {
                        player.ship.removeTarget();
                }

                // set this ship which is targetted on the ship which is targetting - current player
                player.ship.sendTarget(this.id)

                // make the crosshair visible on self
                this.toggleCrosshair()
            }
        }

        // has a target
        hasTarget() {
            if (this.target) {
                return true;
            }
            return false;
        }

        // removes the current target
        removeTarget() {
            this.target.toggleCrosshair()
            this.target = null;
        }

        toggleCrosshair() {
            if (this.crosshair.visible) {
                this.crosshair.visible = false
            } else {
                this.crosshair.visible = true;
            }
        }

        sendLocation(pointer: any) {
            console.log(this.id + ':Player::moveToPointer');

            var loc = new Loc();
            loc.set(pointer.worldX, pointer.worldY);

            var message = new Message();
            message.setId(this.id);
            message.setDestination(loc);
            //message.setLocation(this.getLocation());
            transporter.sendMessage(message);
        }

        // sends the message to shoot specific ship
        sendTarget(id: string) {
            console.log(this.id + ':Ship::sendTarget  - sending target message to: ' + this.id);
            var message = new Message();
            message.setId(this.id);
            message.target = id;
            message.action = 'target';
            transporter.sendMessage(message);
        }

        setTarget(target : Ship.Ship) {
            console.log(this.id + ':Ship::setTarget');

            // FIRE!!!


            // SET THE TARGET
            this.target = target;
        }

        handleKeys() {
            // handle key action
            if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !this.firing && playerId == this.id){
                this.fire();
            }
        }
        /**
        * Makes the ship fire the weapon
        * Sets a firing flag so that the anim will know when to trigger
        */
        fire() {

            /// prevent of triggering the method multiple times
            if (this.firing) return;

            if (this.target) {
                console.log(this.id + ':Ship::fire');
                this.fireDuration = this.game.time.now + 1000;
                this.firing = true;

                var message = new Message();
                message.setId(this.id);
                message.action = 'fire';
                transporter.sendMessage(message);

            } else {
                console.log(this.id + ':Ship:fire  - NO TARGET SET');
            }
        }

        handleMessage(message: Message) {


            // accept messages which are designated only for this ship
            if (message.id != this.id) {
                //console.log(this.id + ':Ship::handleMessage I\'m ' + this.id + ' and this message is for: ' + message.id);
                return;
            }

            console.log(this.id + ':Ship::handleMessage - action:' + message.action);
            if (message.location) {
               console.log(this.id + ':Ship::handleMessage - handling location for ship ' + message.id);
               this.setLocation(message.location);
            }

            // handle destination at all times
            if (message.destination) {
                console.log(this.id + ':Ship::handleMessage - handling destination');
                console.log(message.destination);
                this.destination = message.destination;
                // handle location changes only if it's a ship that is not a current plater
            }

            //
            if (message.action == 'target') {
                console.log(this.id + ':Ship::handleMessage - TARGET: ' + message.target);
                this.setTarget(this.actionHandler.getUpdateGroups().getById(message.target));
            }

            if (message.action == 'fire') {
                this.fire(this.actionHandler.getUpdateGroups().getById(message.target));
            }

            // set the ship properties if they have been passed
            if (message.action == 'login' || message.action == 'create') {
                console.log(message);
                console.log(this.id + ':Ship.handleMessage - Setting ship properties');
                this.setProperties(message.properties);
            }

        }



        move() {

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

        /**
        * If destination is present initiate the movement
        */
        moveToLocation() {
            if (!this.destination) {
                return;
            }

            this.rotationSpeed(this.move())
        }

        setProperties(properties: Properties) {
            console.log(this.id + 'Ship::setProperties');
            this.properties = properties;
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
        }

        getProperties() : Properties {
            return this.properties;
        }

        addName() {
            //console.log(this.id + ':Ship::addName');
            var style = { font: "9px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
            this.name = this.game.add.text(this.x, this.y, this.id, style);
            this.updateName();
        }

        updateName() {
            this.name.x = this.x - 15; //Math.floor(this.x + this.width / 2) - this.width + 10;
            this.name.y = this.y - 30; //Math.floor(this.y + this.height / 2) - this.height - 10;
        }

        getLocation() : Loc {
            var loc =  new Loc();
            loc.set(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            return loc;
        }

        setLocation(location: Loc) {
            //this.setLocation(message.location);
             this.x = location.x;
             this.y = location.y;

             // lag correction
            //  var xfix = 3 * Math.cos(Phaser.Math.degToRad(this.angle));
            //  var yfix = 3 * Math.sin(Phaser.Math.degToRad(this.angle));
            //  this.x += xfix;
            //  this.y += yfix;


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

            constructor() {
                super(game);
            }

            objectMap : Phaser.Sprite[]// : Phaser.Sprite;

            add(sprite: Ship.Ship) {
                super.add(sprite);
                //this.ships.push(sprite);
            }

            getById(id: string) {

                var displayObject : Ship.Ship
                for (var key in this.children) {

                    displayObject = <Ship.Ship>this.children[key];

                    if (displayObject.id == id) {
                        return displayObject;
                    }
                }

                return null;
            }
        }
}
