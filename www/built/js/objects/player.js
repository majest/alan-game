/// <reference path="../phaser/typescript/phaser.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HPBar = (function () {
    function HPBar(name, x, y, color, percentage) {
        this.width = 50;
        this.height = 3;
        this.animDuration = 1;
        this.hp = 100;
        this.name = name;
        this.bgbar = this.drawBar(x, y, '#ff0000');
        this.hpbar = this.drawBar(x, y, color);
        this.hpbar.alpha = 0.6;
        this.bgbar.alpha = 0.6;
        this.set(percentage);
    }
    HPBar.prototype.drawBar = function (x, y, color) {
        var hpb = game.add.bitmapData(this.width, this.height);
        hpb.ctx.beginPath();
        hpb.ctx.rect(0, 0, this.width, this.height);
        hpb.ctx.fillStyle = color;
        hpb.ctx.fill();
        var hpbar = game.add.sprite(x, y, hpb);
        //hpbar.anchor.set(0.5);
        return hpbar;
    };
    HPBar.prototype.update = function (x, y) {
        this.hpbar.x = x;
        this.hpbar.y = y;
        this.bgbar.x = x;
        this.bgbar.y = y;
    };
    HPBar.prototype.set = function (newValue) {
        if (newValue < 0)
            newValue = 0;
        if (newValue > 100)
            newValue = 100;
        var newWidth = (newValue * this.width) / 100;
        this.setWidth(newWidth);
    };
    HPBar.prototype.setWidth = function (newWidth) {
        game.add.tween(this.hpbar).to({ width: newWidth }, this.animDuration, Phaser.Easing.Linear.None, true);
    };
    ;
    HPBar.prototype.destroy = function () {
        this.hpbar.destroy();
        this.bgbar.destroy();
    };
    return HPBar;
}());
var Shield = (function () {
    function Shield(x, y) {
        var shield = game.add.sprite(x, y, 'shield');
        shield.anchor.setTo(0.5, 0.48);
        shield.scale.setTo(0.4, 0.4);
        shield.visible = false;
        shield.tint = 0x0099ff;
        this.sprite = shield;
    }
    Shield.prototype.update = function (x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        if (game.time.now > this.shieldVisibleTime) {
            this.sprite.visible = false;
        }
    };
    Shield.prototype.show = function () {
        this.shieldVisibleTime = game.time.now + 50;
        this.sprite.visible = true;
    };
    return Shield;
}());
var Ship;
(function (Ship_1) {
    var Broadcast = (function () {
        function Broadcast() {
        }
        Broadcast.Properties = function (id, properties) {
            var message = new Message();
            message.setId(id);
            message.setProperties(properties);
            transporter.sendMessage(message);
        };
        Broadcast.Location = function (id, x, y) {
            console.log(id + ':Player::moveToPointer');
            var loc = new Loc();
            loc.set(x, y);
            var message = new Message();
            message.setId(id);
            message.setDestination(loc);
            transporter.sendMessage(message);
        };
        Broadcast.Destroy = function (id) {
            var message = new Message();
            message.setId(id);
            message.setDestroy();
            transporter.sendMessage(message);
        };
        // sends the message to shoot specific ship
        Broadcast.Target = function (id, target) {
            var message = new Message();
            message.setId(id);
            message.target = target;
            message.action = 'target';
            transporter.sendMessage(message);
        };
        Broadcast.Fire = function (id) {
            var message = new Message();
            message.setId(id);
            message.action = 'fire';
            transporter.sendMessage(message);
        };
        return Broadcast;
    }());
    Ship_1.Broadcast = Broadcast;
    var WarpDestination = (function () {
        function WarpDestination() {
        }
        return WarpDestination;
    }());
    Ship_1.WarpDestination = WarpDestination;
    var WarpDrive = (function () {
        function WarpDrive(ship, itemProperties) {
            this.ship = ship;
            this.create();
            this.itemProperties = itemProperties;
        }
        WarpDrive.prototype.create = function () {
            var button2 = game.add.button(10, 100, 'button', this.setWarpDestination, this);
            button2.scale.set(0.8);
            button2.fixedToCamera = true;
        };
        WarpDrive.prototype.setWarpDestination = function () {
            this.warpDestination = { "x": 10000, "y": 400 };
            this.ship.body.maxVelocity.set(this.itemProperties.modSpeed);
        };
        //
        WarpDrive.prototype.warp = function () {
            if (!this.warpDestination)
                return;
            if (!this.ship.moveToLocation(this.warpDestination.x, this.warpDestination.y, this.itemProperties.modSpeed)) {
                this.warpDestination = null;
            }
        };
        return WarpDrive;
    }());
    Ship_1.WarpDrive = WarpDrive;
    var Missile = (function (_super) {
        __extends(Missile, _super);
        function Missile(game, x, y, key) {
            _super.call(this, game, x, y, key);
            this.create();
        }
        Missile.prototype.create = function () {
            var emitter = game.add.emitter(200, 200, 400);
            emitter.makeParticles('smoke');
            emitter.setXSpeed(0, 0);
            emitter.setYSpeed(0, 0);
            emitter.setAlpha(0.1, 0.4, 30);
            emitter.gravity = 0;
            emitter.width = 6;
            emitter.setScale(1, 2, 1, 2);
            emitter.x = this.x;
            emitter.y = this.y;
            emitter.setScale(0.1, 0.15, 0.1, 0.15, 8000, Phaser.Easing.Quintic.In);
            emitter.minParticleScale = 0.05;
            emitter.maxParticleScale = 0.09;
            emitter.start(false, 2000, 20);
            this.emitter = emitter;
        };
        Missile.prototype.kill = function () {
            this.emitter.on = false;
            return _super.prototype.kill.call(this);
        };
        Missile.prototype.update = function () {
            if (this.alive) {
                this.emitter.on = true;
                this.emitter.visible = true;
                this.emitter.emitX = this.x;
                this.emitter.emitY = this.y;
                var weapon = this.parent;
                var targetAngle = game.math.angleBetween(this.x, this.y, weapon.target.x, weapon.target.y);
                // Gradually (this.TURN_RATE) aim the missile towards the target angle
                if (this.rotation !== targetAngle) {
                    // Calculate difference between the current angle and targetAngle
                    var delta = targetAngle - this.rotation;
                    // Keep it in range from -180 to 180 to make the most efficient turns.
                    if (delta > Math.PI)
                        delta -= Math.PI * 2;
                    if (delta < -Math.PI)
                        delta += Math.PI * 2;
                    if (delta > 0) {
                        // Turn clockwise
                        this.angle += weapon.properties.turnRate;
                    }
                    else {
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
        };
        return Missile;
    }(Phaser.Sprite));
    Ship_1.Missile = Missile;
    var Projectile = (function (_super) {
        __extends(Projectile, _super);
        function Projectile() {
            _super.apply(this, arguments);
        }
        return Projectile;
    }(Phaser.Sprite));
    Ship_1.Projectile = Projectile;
    var Ship = (function (_super) {
        __extends(Ship, _super);
        function Ship(game, x, y, id) {
            _super.call(this, game, x, y, 'ship', 0);
            // shooting details
            this.fireRate = 100;
            this.nextFire = 0;
            this.fireDuration = 0;
            // sets the targeted ship
            this.target = null;
            this.firing = false;
            this.healthPercentage = 100;
            this.weapons = [];
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
            this.crosshair = this.game.add.sprite(x, y, 'crosshair');
            this.crosshair.visible = false;
            this.crosshair.anchor.setTo(0.5, 0.65);
            this.crosshair.scale.setTo(1.3, 1.4);
            this.crosshair.alpha = 0.4;
            this.shield = new Shield(this.x, this.y);
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
            this.explosion.anchor.setTo(0.5, 0.5);
            this.explosion.visible = false;
            this.explosion.animations.add('explode');
            this.thruster = game.add.sprite(0, 0, 'thruster');
            this.thruster.anchor.setTo(0.5, 1.2);
            this.thruster.visible = false;
            this.thruster.scale.setTo(0.5, 0.5);
            this.thruster.animations.add('thruster');
            this.thruster.animations.play('thruster', 30, true);
            this.thruster.angle = -90;
            this.addChild(this.thruster);
            // game.onPause.add(this.gamePause, this);
            // game.onResume.add(this.gameResume, this);
            game.stage.backgroundColor = '#03273e';
            this.warpDrive = new WarpDrive(this, ItemProperties.createWarpDrive());
            //	Emitters have a center point and a width/height, which extends from their center point to the left/right and up/down
            //this.addChild(this.emitter);
        }
        Ship.prototype.gamePause = function () {
            console.log('pause');
        };
        Ship.prototype.gameResume = function () {
            console.log('resume');
        };
        Ship.prototype.update = function () {
            if (!this.alive)
                return;
            this.handleKeys();
            this.crosshair.x = this.x;
            this.crosshair.y = this.y;
            this.crosshair.rotation = this.crosshair.rotation + 0.01;
            this.shield.update(this.x, this.y);
            this.updateName();
            this.shieldHpBar.update(this.x - this.width + 10, this.y + this.height - 10);
            this.hullHpBar.update(this.x - this.width + 10, this.y + this.height - 7);
            if (this.destination != null && !this.thruster.visible) {
                this.thruster.visible = true;
            }
            else if (this.destination == null && this.thruster.visible) {
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
            this.warpDrive.warp();
            this.move();
        };
        Ship.prototype.bulletCollisionHandler = function (bullet, ship) {
            // ignore the colision for ourselfs
            if (ship.id == this.id)
                return;
            // check if targetted ship still has shield
            var damage = 0;
            if (ship.hasShield()) {
                damage = bullet.parent.properties.damageShield;
            }
            else {
                damage = bullet.parent.properties.damageHull;
            }
            ship.takeHit(damage);
            bullet.kill();
        };
        Ship.prototype.sendFire = function () {
            Broadcast.Fire(this.id);
        };
        Ship.prototype.takeHit = function (hit) {
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
                }
                else {
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
        };
        Ship.prototype.updateHpBars = function () {
            this.hullHpBar.set(this.properties.getHullPercentage());
            this.shieldHpBar.set(this.properties.getShieldPercentage());
        };
        Ship.prototype.hasHull = function () {
            if (this.properties.getCurrentHull() > 0) {
                return true;
            }
        };
        Ship.prototype.hasShield = function () {
            if (this.properties.getCurrentShield() > 0) {
                return true;
            }
        };
        // fires a bullet
        Ship.prototype.firingAnim = function (ship, weapon) {
            // if current time is less than a time + fire duration  - this makes sure we fire only one serie
            // and ship we are shooting at is not us
            // and curretnt ime is more than a next fire - which means it's time to shoot a bullet
            // and number of dead bullets is more than
            if (weapon.isReady()) {
                weapon.fire();
            }
            else {
                // make the ship we are shooting at send an update about it's health
                if (weapon.finishedShooting()) {
                    ship.finishedShooting();
                }
            }
        };
        // only update properties if we are the owner of the ship.
        Ship.prototype.finishedShooting = function () {
            if (this.id == playerId) {
                Broadcast.Properties(this.id, this.properties);
            }
        };
        Ship.prototype.die = function () {
            this.explosion.x = this.x;
            this.explosion.y = this.y;
            this.explosion.visible = true;
            this.explosion.animations.play('explode', 30, false);
            this.crosshair.destroy();
            this.shieldHpBar.destroy();
            this.hullHpBar.destroy();
            this.name.destroy();
            this.kill();
        };
        // acquire target - makes the crosshair visible on the ship we have clicked on
        Ship.prototype.acquireTarget = function (ship, pointer) {
            if (ship != null && ship.id != playerId) {
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
                player.ship.sendTarget(this.id);
                // make the crosshair visible on self
                this.toggleCrosshair();
            }
        };
        Ship.prototype.sendTarget = function (target) {
            Broadcast.Target(this.id, target);
        };
        // has a target
        Ship.prototype.hasTarget = function () {
            if (this.target) {
                return true;
            }
            return false;
        };
        // removes the current target
        Ship.prototype.removeTarget = function () {
            this.target.toggleCrosshair();
            this.target = null;
        };
        Ship.prototype.toggleCrosshair = function () {
            if (this.crosshair.visible) {
                this.crosshair.visible = false;
            }
            else {
                this.crosshair.visible = true;
            }
        };
        Ship.prototype.setTarget = function (target) {
            console.log(this.id + ':Ship::setTarget');
            for (var i in this.weapons) {
                var weapon = this.weapons[i];
                weapon.setTarget(target);
            }
            this.target = target;
        };
        Ship.prototype.handleKeys = function () {
            // handle key action
            if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !this.firing && playerId == this.id && this.target) {
                console.log(this.id + ':Ship::handleKeys - Keyboard Firing firing:' + this.firing);
                Broadcast.Fire(this.id);
            }
        };
        /**
        * Makes the ship fire the weapon
        * Sets a firing flag so that the anim will know when to trigger
        */
        Ship.prototype.fire = function () {
            /// prevent of triggering the method multiple times
            if (this.target != null && !this.firing) {
                console.log(this.id + ':Ship::fire');
                for (var i in this.weapons) {
                    this.weapons[i].makeReady();
                }
            }
            else {
                console.log('No target');
            }
        };
        Ship.prototype.handleMessage = function (message) {
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
        };
        Ship.prototype.initWeapons = function (weaponProperties) {
            for (var i in weaponProperties) {
                var weapon = Weapon.init(this, weaponProperties[i]);
                this.weapons.push(weapon);
            }
        };
        Ship.prototype.move = function () {
            if (!this.destination)
                return;
            if (!this.moveToLocation(this.destination.x, this.destination.y, this.properties.speed)) {
                this.destination = null;
            }
        };
        Ship.prototype.rotate = function (rotation, speed) {
            if (rotation && this.rotation !== rotation) {
                // Calculate difference between the current angle and targetAngle
                var delta = rotation - this.rotation;
                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI)
                    delta -= Math.PI * 2;
                if (delta < -Math.PI)
                    delta += Math.PI * 2;
                if (delta > 0) {
                    this.angle += this.properties.turnRate;
                }
                else {
                    this.angle -= this.properties.turnRate;
                }
                var deltaAbs = parseFloat(Math.abs(delta).toFixed(2));
                var target = parseFloat(Math.abs(Phaser.Math.degToRad(this.properties.turnRate)).toFixed(2));
                // Just set angle to target angle if they are close
                if (deltaAbs <= target) {
                    this.rotation = rotation;
                }
            }
            this.body.velocity.x = Math.cos(this.rotation) * speed;
            this.body.velocity.y = Math.sin(this.rotation) * speed;
        };
        /**
        * If destination is present initiate the movement
        */
        Ship.prototype.moveToLocation = function (x, y, speed) {
            // finish processing the message once we have reached the target
            if (parseFloat(this.game.physics.arcade.distanceToXY(this, x, y).toFixed(2)) < 8.0) {
                return false;
            }
            this.rotate(this.game.physics.arcade.moveToXY(this, x, y, speed), speed);
            return true;
        };
        Ship.prototype.setProperties = function (properties) {
            console.log(this.id + 'Ship::setProperties');
            this.properties = properties;
            this.body.drag.set(this.properties.breakingForce);
            this.body.maxVelocity.set(this.properties.speed);
            this.updateHpBars();
        };
        Ship.prototype.getProperties = function () {
            return this.properties;
        };
        Ship.prototype.addName = function () {
            //console.log(this.id + ':Ship::addName');
            var style = { font: "9px Arial", fill: "#ffffff", wordWrap: true, wordWrapWidth: this.width, align: "center" };
            this.name = this.game.add.text(this.x, this.y, this.id, style);
            this.updateName();
        };
        Ship.prototype.updateName = function () {
            this.name.x = this.x - 15; //Math.floor(this.x + this.width / 2) - this.width + 10;
            this.name.y = this.y - 30; //Math.floor(this.y + this.height / 2) - this.height - 10;
        };
        Ship.prototype.getLocation = function () {
            var loc = new Loc();
            loc.set(this.x, this.y);
            loc.setState(this.rotation, this.angle, this.body.velocity.x, this.body.velocity.y);
            return loc;
        };
        Ship.prototype.setLocation = function (location) {
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
            if (typeof location.velocityx != 'undefined') {
                this.body.velocity.x = location.velocityx;
            }
            if (typeof location.velocityy != 'undefined') {
                this.body.velocity.y = location.velocityy;
            }
        };
        return Ship;
    }(Phaser.Sprite));
    Ship_1.Ship = Ship;
})(Ship || (Ship = {}));
var Weapon = (function (_super) {
    __extends(Weapon, _super);
    function Weapon(ship, properties) {
        _super.call(this, game);
        this.fireDuration = 0;
        this.nextFire = 0;
        this.ship = ship;
        console.log(ship);
        this.properties = properties;
    }
    Weapon.prototype.setTarget = function (target) {
        this.target = target;
    };
    Weapon.init = function (ship, properties) {
        var bullets = new Weapon(ship, properties);
        bullets.classType = Weapon.getType(properties.type);
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(properties.multiple, properties.gfx);
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('lifespan', properties.lifespan);
        return bullets;
    };
    Weapon.getType = function (type) {
        if (type == 'missile') {
            return Ship.Missile;
        }
        else if (type == 'projectile') {
            return Ship.Projectile;
        }
    };
    Weapon.prototype.fire = function () {
        // correct the time so we should the next one after firerate
        this.nextFire = game.time.now + this.properties.fireRate;
        // get the first dead bullet
        var bullet = this.getFirstDead();
        bullet.rotation = game.physics.arcade.angleBetween(this.ship, this.target);
        // reset the position the bullet so it looks like it comes out from our ship
        bullet.reset(this.ship.x - 4, this.ship.y - 4);
        // shoot the bullets towards the target
        game.physics.arcade.moveToXY(bullet, this.target.x, this.target.y, this.properties.speed);
    };
    Weapon.prototype.finishedShooting = function () {
        if (this.firing) {
            this.firing = false;
            return true;
        }
        return false;
    };
    Weapon.prototype.getProperties = function () {
        return this.properties;
    };
    Weapon.prototype.makeReady = function () {
        console.log('--------------');
        console.log(this.properties.fireDuration);
        this.fireDuration = game.time.now + this.properties.fireDuration;
        this.firing = true;
    };
    Weapon.prototype.isReady = function () {
        //    console.log((game.time.now < this.fireDuration) + '-'  + (game.time.now > this.nextFire) + '-' + (this.countDead() > 0));
        if (game.time.now < this.fireDuration && game.time.now > this.nextFire && this.countDead() > 0) {
            return true;
        }
        return false;
    };
    return Weapon;
}(Phaser.Group));
var Group;
(function (Group) {
    var Ship = (function (_super) {
        __extends(Ship, _super);
        //ships: Ship.Ship[] = [];
        function Ship() {
            _super.call(this, game);
        }
        Ship.prototype.add = function (sprite) {
            _super.prototype.add.call(this, sprite);
            //this.ships.push(sprite);
        };
        Ship.prototype.getById = function (id) {
            var displayObject;
            for (var key in this.children) {
                displayObject = this.children[key];
                if (displayObject.id == id) {
                    return displayObject;
                }
            }
            return null;
        };
        return Ship;
    }(Phaser.Group));
    Group.Ship = Ship;
})(Group || (Group = {}));
