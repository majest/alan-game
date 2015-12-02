
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
        this.hpbar.alpha = 0.6;
        this.bgbar.alpha = 0.6;
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

    destroy() {
        this.hpbar.destroy();
        this.bgbar.destroy();
    }
}

class Shield {

    shieldVisibleTime
    sprite;

    constructor(x,y) {
        var shield = game.add.sprite(x,y,'shield');
        shield.anchor.setTo(0.5,0.48);
        shield.scale.setTo(0.4,0.4);
        shield.visible = false;
        shield.tint = 0x0099ff;
        this.sprite = shield;
    }

    update(x, y) {

        this.sprite.x = x;
        this.sprite.y = y;

        if (game.time.now > this.shieldVisibleTime) {
            this.sprite.visible = false;
        }
    }

    show() {
        this.shieldVisibleTime = game.time.now + 50;
        this.sprite.visible = true;
    }


}


module Ship {

    export class Broadcast {

        public static Properties(id, properties) {
            var message = new Message();
            message.setId(id);
            message.setProperties(properties);
            transporter.sendMessage(message);
        }

        public static Location(id, x, y) {
           console.log(id + ':Player::moveToPointer');
           var loc = new Loc();
           loc.set(x, y);
           var message = new Message();
           message.setId(id);
           message.setDestination(loc);
           transporter.sendMessage(message);
        }


        public static Destroy(id) {
            var message = new Message();
            message.setId(id);
            message.setDestroy();
            transporter.sendMessage(message);
        }

        // sends the message to shoot specific ship
        public static Target(id: string, target: string) {
            var message = new Message();
            message.setId(id);
            message.target = target;
            message.action = 'target';
            transporter.sendMessage(message);
        }

        public static Fire(id) {
            var message = new Message();
            message.setId(id);
            message.action = 'fire';
            transporter.sendMessage(message);
        }
        // public static Location(pointer: any) {
        //     console.log(this.id + ':Player::moveToPointer');
        //
        //     var loc = new Loc();
        //     loc.set(pointer.worldX, pointer.worldY);
        //
        //     var message = new Message();
        //     message.setId(this.id);
        //     message.setDestination(loc);
        //     //message.setLocation(this.getLocation());
        //     transporter.sendMessage(message);
        // }

    }

    export class Missile extends Phaser.Sprite {

        emitter;

        constructor(game, x, y, key) {
            super(game, x, y, key);
            this.create();
        }

        create() {
            var emitter = game.add.emitter(200 , 200, 400);
            emitter.makeParticles('smoke');
            emitter.setXSpeed(0, 0);
            emitter.setYSpeed(0, 0);
            emitter.setAlpha(0.1, 0.4, 30);
            emitter.gravity = 0;

            emitter.width = 6;
            emitter.setScale(1, 2,1,2);
            emitter.x = this.x;
            emitter.y = this.y;
            emitter.setScale(0.1, 0.15, 0.1, 0.15, 8000, Phaser.Easing.Quintic.In);
            emitter.minParticleScale = 0.05;
            emitter.maxParticleScale = 0.09;
            emitter.start(false, 2000, 20);
            this.emitter = emitter;
        }

        kill() {
            this.emitter.on = false;
            return super.kill();
        }

        update() {

            if (this.alive) {
                this.emitter.on = true;
                this.emitter.visible = true;
                this.emitter.emitX = this.x;
                this.emitter.emitY = this.y;
                var weapon = <Weapon>this.parent;

                var targetAngle = game.math.angleBetween(
                    this.x, this.y,
                    weapon.target.x, weapon.target.y
                );

                // Gradually (this.TURN_RATE) aim the missile towards the target angle
                if (this.rotation !== targetAngle) {
                    // Calculate difference between the current angle and targetAngle
                    var delta = targetAngle - this.rotation;

                    // Keep it in range from -180 to 180 to make the most efficient turns.
                    if (delta > Math.PI) delta -= Math.PI * 2;
                    if (delta < -Math.PI) delta += Math.PI * 2;

                    if (delta > 0) {
                        // Turn clockwise
                        this.angle += weapon.properties.turnRate;
                    } else {
                        // Turn counter-clockwise
                        this.angle -= weapon.properties.turnRate;
                    }

                    // Just set angle to target angle if they are close
                    if (Math.abs(delta) < game.math.degToRad(weapon.properties.turnRate)) {
                        this.rotation = targetAngle;
                    }
                }

                // Calculate velocity vector based on this.rotation and this.SPEED
                this.body.velocity.x = Math.cos(this.rotation) * weapon.properties.speed;
                this.body.velocity.y = Math.sin(this.rotation) * weapon.properties.speed;
            }
        }
    }

    export class Projectile extends Phaser.Sprite {

        update() {
        }
    }

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
        actionHandler : ActionHandler;

        // sets the targeted ship
        target = null;

        firing = false;

        fireButton;

        shieldHpBar;
        hullHpBar;

        healthPercentage = 100;

        explosion;
        thruster;
        emitter;

        weapons: Weapon[] = [];

        constructor(game: Phaser.Game, x: number, y: number, id: string) {
            super(game, x, y, 'ship', 0);

            game.physics.enable(this, Phaser.Physics.ARCADE);


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
            this.crosshair.scale.setTo(1.3,1.4);
            this.crosshair.alpha = 0.4


            this.shield = new Shield(this.x,this.y);
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


            this.explosion = game.add.sprite(0, 0, 'explosion');
            this.explosion.anchor.setTo(0.5,0.5);
            this.explosion.visible = false;
            this.explosion.animations.add('explode');

            this.thruster = game.add.sprite(0, 0, 'thruster');
            this.thruster.anchor.setTo(0.5,1.2);
            this.thruster.visible = false;
            this.thruster.scale.setTo(0.5,0.5);
            this.thruster.animations.add('thruster');
            this.thruster.animations.play('thruster', 30, true);
            this.thruster.angle=-90;
            this.addChild(this.thruster);
            // game.onPause.add(this.gamePause, this);
            // game.onResume.add(this.gameResume, this);

            game.stage.backgroundColor = '#03273e';


  //	Emitters have a center point and a width/height, which extends from their center point to the left/right and up/down

  //this.addChild(this.emitter);

        }

        gamePause() {
            console.log('pause');
        }

        gameResume() {
            console.log('resume');
        }

        update() {

            if (!this.alive) return;

            this.handleKeys();
            this.crosshair.x = this.x;
            this.crosshair.y = this.y;



            this.crosshair.rotation = this.crosshair.rotation + 0.01;
            this.shield.update(this.x, this.y);
            this.updateName();

            this.shieldHpBar.update(this.x - this.width + 10, this.y +  this.height - 10);
            this.hullHpBar.update(this.x - this.width + 10, this.y +  this.height - 7);

            if (this.destination != null && !this.thruster.visible) {
                this.thruster.visible = true;
            } else if (this.destination == null && this.thruster.visible) {
                this.thruster.visible = false;
            }

            // do we have any weapons on this ship?
            if (this.weapons != null && this.target) {

                // fire all weapons
                for (var i in this.weapons) {
                    this.firingAnim(this.target, this.weapons[i]);
                    game.physics.arcade.overlap(this.weapons[i], this.actionHandler.getShips(), this.bulletCollisionHandler, null, this);
                }
            }

            this.moveToLocation();
        }

        bulletCollisionHandler(bullet, ship) {


            // ignore the colision for ourselfs
            if (ship.id == this.id) return;

            // check if targetted ship still has shield
            var damage = 0;

            if (ship.hasShield()) {
                damage = bullet.parent.properties.damageShield;
            } else {
                damage = bullet.parent.properties.damageHull;
            }

            ship.takeHit(damage);
            bullet.kill();
        }

        sendFire() {
            Broadcast.Fire(this.id);
        }

        takeHit(hit) {

            // if we still have shield
            if (this.hasShield()) {

                this.shield.show();
                this.shieldHpBar.shieldVisibleTime = this.game.time.now + 50;

                this.shield.visible = true;
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

            // if we are still alive and we don't have any hull, and this is the current player
            // or it's ai
            // broadcast destroy
            if (!this.hasHull() && this.alive && (this.id == playerId || this.properties.type == 'ai')) {
                Broadcast.Destroy(this.id);
            }
        }

        updateHpBars() {
            this.hullHpBar.set(this.properties.getHullPercentage());
            this.shieldHpBar.set(this.properties.getShieldPercentage());
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
        firingAnim(ship, weapon) {

            // if current time is less than a time + fire duration  - this makes sure we fire only one serie
            // and ship we are shooting at is not us
            // and curretnt ime is more than a next fire - which means it's time to shoot a bullet
            // and number of dead bullets is more than
            if (weapon.isReady()) {
                weapon.fire();

            } else {
                // make the ship we are shooting at send an update about it's health
                if (weapon.finishedShooting()) {
                    ship.finishedShooting();
                }
            }


        }

        // only update properties if we are the owner of the ship.
        finishedShooting() {
            if (this.id == playerId) {
                Broadcast.Properties(this.id, this.properties);
            }
        }

        die() {

            this.explosion.x = this.x;
            this.explosion.y = this.y;
            this.explosion.visible = true;
            this.explosion.animations.play('explode', 30, false);
            this.crosshair.destroy();
            this.shieldHpBar.destroy();
            this.hullHpBar.destroy();
            this.name.destroy();
            this.kill();
        }


        // acquire target - makes the crosshair visible on the ship we have clicked on
        acquireTarget(ship, pointer) {

            if (ship != null && ship.id !=  playerId) {

                // don't do anything for target that is already targetted
                // otherwise in the rare cases target might be removed before
                // the message for targetting it again arrives
                // and firinganim will hang the app
                if (this.target != null && this.target.id == ship.id) {
                    return;
                }

                console.log(this.id + ':Ship::acquireTarget');

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

        sendTarget(target) {
            Broadcast.Target(this.id, target);
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

        setTarget(target : Ship.Ship) {
            console.log(this.id + ':Ship::setTarget');

            for (var i in this.weapons) {
                var weapon = this.weapons[i];
                weapon.setTarget(target);
            }

            this.target = target;
        }

        handleKeys() {
            // handle key action
            if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !this.firing && playerId == this.id && this.target){
                console.log(this.id + ':Ship::handleKeys - Keyboard Firing firing:' + this.firing);
                Broadcast.Fire(this.id);
            }
        }

        /**
        * Makes the ship fire the weapon
        * Sets a firing flag so that the anim will know when to trigger
        */
        fire() {
            /// prevent of triggering the method multiple times
            if (this.target != null && !this.firing) {

                console.log(this.id + ':Ship::fire');
                for (var i in this.weapons) {
                    this.weapons[i].makeReady();
                }

            } else {
                console.log('No target');
            }
        }

        handleMessage(message: Message) {

            // accept messages which are designated only for this ship
            if (message.id != this.id) {
                //console.log(this.id + ':Ship::handleMessage I\'m ' + this.id + ' and this message is for: ' + message.id);
                return;
            }


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
                console.log(this.id + ':Ship::handleMessage - FIRE, firing:' + this.firing);
                console.log(this.target);
                this.fire();
            }

            if (message.action == 'destroy') {
                console.log(this.id + ':Ship::handleMessage - action DIE');
                this.die();
            }

            // set the ship properties if they have been passed
            // available for action login and create
            // action properties will occur only for ships that are not the current player
            // as the players themselfs are source of thruth
            if (message.action == 'login' || message.action == 'create' || (message.action == 'properties' && playerId != this.id)) {
                console.log(message);
                console.log(this.id + ':Ship.handleMessage - Setting ship properties');

                // set the ship properties like hp/shield
                this.setProperties(message.properties);
                this.initWeapons(message.weapons);

            }

        }

        initWeapons(weaponProperties) {
            for (var i in weaponProperties) {
                var weapon = Weapon.init(this, weaponProperties[i]);
                this.weapons.push(weapon);
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
            this.updateHpBars();
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





        class Weapon extends Phaser.Group {

            fireDuration = 0;
            nextFire = 0;
            properties : WeaponProperties;
            target;
            ship;
            firing;

            constructor(ship, properties) {
                super(game);
                this.ship = ship;
                console.log(ship);
                this.properties = properties;
            }

            setTarget(target) {
                this.target = target;
            }

            public static init(ship: Ship.Ship, properties: WeaponProperties) : Weapon {

                var bullets = new Weapon(ship, properties);
                bullets.classType = Weapon.getType(properties.type);
                bullets.enableBody = true;
                bullets.physicsBodyType = Phaser.Physics.ARCADE;
                bullets.createMultiple(properties.multiple, properties.gfx);
                bullets.setAll('checkWorldBounds', true);
                bullets.setAll('outOfBoundsKill', true);
                bullets.setAll('lifespan',properties.lifespan);
                return bullets;
            }

            public static getType(type) {
                if (type == 'missile') {
                    return Ship.Missile;
                } else if (type == 'projectile') {
                    return Ship.Projectile
                }
            }


            fire() {

                // correct the time so we should the next one after firerate
                this.nextFire = game.time.now + this.properties.fireRate;

                // get the first dead bullet
                var bullet = this.getFirstDead();

                bullet.rotation = game.physics.arcade.angleBetween(this.ship, this.target);

                // reset the position the bullet so it looks like it comes out from our ship
                bullet.reset(this.ship.x - 4, this.ship.y - 4);

                // shoot the bullets towards the target
                game.physics.arcade.moveToXY(bullet, this.target.x, this.target.y, this.properties.speed);
            }



            finishedShooting() {

                if (this.firing) {
                    this.firing = false;
                    return true;
                }
                return false;
            }

            getProperties() {
                return this.properties;
            }

            makeReady() {
                console.log('--------------');
                console.log(this.properties.fireDuration);
                this.fireDuration = game.time.now + this.properties.fireDuration;
                this.firing = true;
            }

            isReady() {
            //    console.log((game.time.now < this.fireDuration) + '-'  + (game.time.now > this.nextFire) + '-' + (this.countDead() > 0));
                if (game.time.now < this.fireDuration &&  game.time.now > this.nextFire && this.countDead() > 0) {
                    return true;
                }

                return false;
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

            getById(id: string) : Ship.Ship  {

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
