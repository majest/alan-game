var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../phaser/typescript/phaser.d.ts" />
var Player = (function () {
    function Player() {
    }
    Player.prototype.takeControllOver = function (ship) {
        console.log('Player::takecontrollOver - taking ship id:' + ship.id);
        this.ship = ship;
        // handle click&move
        game.input.onUp.add(this.moveToPointer, this);
        // follow this player
        game.camera.follow(this.ship);
        this.createInterface();
    };
    Player.prototype.moveToPointer = function (pointer) {
        // ignore the movemenet if we are clicking on another sprite
        if (!this.ship || pointer.targetObject != null)
            return;
        Ship.Broadcast.Location(this.ship.id, pointer.worldX, pointer.worldY);
        // set the destination
    };
    Player.prototype.createInterface = function () {
        var button = game.add.button(10, 10, 'button', this.ship.sendFire, this.ship);
        button.scale.set(0.8);
        button.fixedToCamera = true;
    };
    // game.input.onTap.add(function(e){
    //     if (Math.floor(e.x/(this.game.width/2)) === LEFT) {
    //         //do left stuff
    //     }
    //
    //     if (Math.floor(e.x/(this.game.width/2)) === RIGHT) {
    //         //do right stuff
    //     }
    // });
    Player.prototype.getShip = function () {
        return this.ship;
    };
    return Player;
}());
/// <reference path="../phaser/typescript/phaser.d.ts" />
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
/**
* Message container
* has action which defines the type of the message
*/
var Serializer = (function () {
    function Serializer() {
        this.gid = this.guid();
    }
    Serializer.prototype.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    Serializer.prototype.serialize = function () {
        var res = {};
        res['@object'] = this.getClassName();
        for (var k in this) {
            var type = typeof this[k];
            if (type == 'function')
                continue;
            if (type == 'string' || type == 'number') {
                res[k] = this[k];
            }
            else if (type == 'object' && !Array.isArray(this[k])) {
                res[k] = this[k].serialize();
            }
            else if (type == 'object' && Array.isArray(this[k])) {
                var a = [];
                for (var i in this[k]) {
                    var obj = this[k][i];
                    a.push(obj.serialize());
                }
                res[k] = a;
            }
        }
        return res;
    };
    Serializer.prototype.getClassName = function () {
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec(this["constructor"].toString());
        return (results && results.length > 1) ? results[1] : "";
    };
    Serializer.load = function (json) {
        //var input = JSON.parse(json);
        console.log('loading ' + json['@object']);
        var object = Serializer.getObjectByName(json['@object']);
        for (var k in json) {
            var type = typeof json[k];
            if (type == 'function')
                continue;
            if (type == 'string' || type == 'number') {
                object[k] = json[k];
            }
            else if (type == 'object' && json[k] != null && !Array.isArray(json[k])) {
                object[k] = this.load(json[k]);
            }
            else if (type == 'object' && json[k] != null && Array.isArray(json[k])) {
                var a = [];
                for (var i in json[k]) {
                    a.push(this.load(json[k][i]));
                }
                object[k] = a;
            }
        }
        return object;
    };
    Serializer.getObjectByName = function (name) {
        if (name == 'Properties') {
            return new Properties();
        }
        else if (name == 'Message') {
            return new Message();
        }
        else if (name == 'WeaponProperties') {
            return new WeaponProperties();
        }
        else if (name == 'Loc') {
            return new Loc();
        }
        else if (name == 'Movement') {
            return new Movement();
        }
        return null;
    };
    return Serializer;
}());
var ItemProperties = (function (_super) {
    __extends(ItemProperties, _super);
    function ItemProperties() {
        _super.apply(this, arguments);
        this.modDamageHull = 0;
        this.modDamageShield = 0;
        this.modSpeed = 0;
    }
    ItemProperties.createWarpDrive = function () {
        var ip = new ItemProperties();
        ip.name = 'Warp Drive Mk1';
        ip.modSpeed = 500;
        ip.type = "warpDrive";
        return ip;
    };
    return ItemProperties;
}(Serializer));
var WeaponProperties = (function (_super) {
    __extends(WeaponProperties, _super);
    function WeaponProperties() {
        _super.apply(this, arguments);
    }
    WeaponProperties.createProjectileTurret = function () {
        var weapon = new WeaponProperties();
        weapon.damageShield = 3;
        weapon.damageHull = 3;
        weapon.name = 'Projectile Turrent';
        weapon.type = 'projectile';
        weapon.range = 10;
        weapon.multiple = 10;
        weapon.gfx = 'bullet';
        weapon.fireRate = 100;
        weapon.fireDuration = 500;
        weapon.lifespan = 1000;
        weapon.tracking = false;
        weapon.speed = 300;
        weapon.turnRate = 0;
        return weapon;
    };
    WeaponProperties.createMissileTurret = function () {
        var weapon = new WeaponProperties();
        weapon.damageShield = 20;
        weapon.damageHull = 15;
        weapon.name = 'Missile Turrent';
        weapon.type = 'missile';
        weapon.gfx = 'missile';
        weapon.range = 15;
        weapon.multiple = 1;
        weapon.fireRate = 1000;
        weapon.fireDuration = 1100;
        weapon.lifespan = 3000;
        weapon.tracking = true;
        weapon.speed = 100;
        weapon.turnRate = 5;
        return weapon;
    };
    return WeaponProperties;
}(Serializer));
var Properties = (function (_super) {
    __extends(Properties, _super);
    function Properties() {
        _super.apply(this, arguments);
    }
    Properties.prototype.getCurrentHull = function () {
        return this.currentHull;
    };
    Properties.prototype.getCurrentShield = function () {
        return this.currentShield;
    };
    Properties.prototype.getMaxShield = function () {
        return this.maxShield;
    };
    Properties.prototype.getHullPercentage = function () {
        return (this.getCurrentHull() * 100 / this.getMaxHull());
    };
    Properties.prototype.getShieldPercentage = function () {
        return (this.getCurrentShield() * 100) / this.getMaxShield();
    };
    Properties.prototype.getMaxHull = function () {
        return this.maxHull;
    };
    Properties.prototype.setShield = function (shield) {
        this.currentShield = shield;
    };
    Properties.prototype.setHull = function (hull) {
        this.currentHull = hull;
    };
    Properties.factory = function (type) {
        if (type === void 0) { type = "player"; }
        var properties = new Properties();
        properties.turnRate = 3;
        properties.speed = 60;
        properties.breakingForce = 80;
        properties.object = 'ship';
        properties.currentHull = 140;
        properties.currentShield = 250;
        properties.maxHull = 140;
        properties.maxShield = 250;
        properties.type = type;
        return properties;
    };
    return Properties;
}(Serializer));
var Message = (function (_super) {
    __extends(Message, _super);
    function Message() {
        _super.apply(this, arguments);
    }
    Message.prototype.setId = function (id) {
        this.id = id;
    };
    Message.prototype.addItem = function (item) {
        if (this.items == null) {
            this.items = [];
        }
        this.items.push(item);
    };
    Message.prototype.addWeapon = function (weapon) {
        if (this.weapons == null) {
            this.weapons = [];
        }
        this.weapons.push(weapon);
    };
    Message.prototype.addPlayer = function (location, properties) {
        this.action = 'create';
        this.location = location;
        this.properties = properties;
    };
    Message.prototype.shootAt = function (ship) {
        this.action = 'shoot';
        this.target = ship.id;
    };
    Message.prototype.logIn = function (location, properties) {
        this.action = 'login';
        this.location = location;
        this.properties = properties;
    };
    Message.prototype.setDestination = function (destination) {
        this.action = 'destination';
        this.destination = destination;
    };
    Message.prototype.setLocation = function (location) {
        this.action = 'location';
        this.location = location;
    };
    Message.prototype.setWeapons = function (weapons) {
        this.action = 'weapons';
        this.weapons = weapons;
    };
    Message.prototype.setProperties = function (properties) {
        this.action = 'properties';
        this.properties = properties;
    };
    Message.prototype.setDestroy = function () {
        this.action = 'destroy';
    };
    // setMovement(movement: Movement) {
    //     this.action = 'move';
    //     this.movement = movement;
    //     this.properties = new Properties();
    // }
    Message.prototype.hasDestination = function () {
        if (typeof this.destination !== 'undefined') {
            return true;
        }
        return false;
    };
    return Message;
}(Serializer));
/**
* Generic location class containg coordinates
*/
var Loc = (function (_super) {
    __extends(Loc, _super);
    function Loc() {
        _super.apply(this, arguments);
    }
    Loc.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Loc.prototype.reset = function () {
        this.x = null;
        this.y = null;
    };
    Loc.prototype.isSet = function () {
        if (this.x && this.y) {
            return true;
        }
        return false;
    };
    Loc.prototype.setState = function (rotation, angle, velocityx, velocityy) {
        this.rotation = rotation;
        this.angle = angle;
        this.velocityx = velocityx;
        this.velocityy = velocityy;
    };
    return Loc;
}(Serializer));
/**
 Defines whether movement occurs
**/
var Movement = (function (_super) {
    __extends(Movement, _super);
    function Movement() {
        _super.apply(this, arguments);
        this.rotationFinished = false;
        this.movementFinished = false;
        this.moving = false;
        this.rotating = false;
    }
    return Movement;
}(Serializer));
var Connection = (function () {
    function Connection(transporter) {
        if (window['WebSocket']) {
            console.log('Connecting');
            this.conn = new WebSocket("ws://localhost:9090/ws");
            this.conn.binaryType = 'blob';
            this.conn.onclose = function (evt) {
                console.log('Connection closed');
            };
            this.conn.onmessage = function (evt) {
                transporter.parse(evt.data);
            };
            this.conn.onopen = function (evt) {
                console.log("Connection established");
            };
            this.conn.onerror = function (evt) {
                console.log("Conenction ERROR: " + evt.data);
            };
        }
    }
    Connection.prototype.getMessage = function () {
        return this.data;
    };
    Connection.prototype.sendMessage = function (message) {
        var ws = this.conn;
        waitForSocketConnection(ws, function () {
            ws.send(message);
        });
    };
    return Connection;
}());
var MessageTransport = (function () {
    function MessageTransport(actionHandler) {
        console.log('Creating Message transport');
        this.connection = new Connection(this);
        this.actionHandler = actionHandler;
    }
    MessageTransport.prototype.resetConnection = function () {
        this.connection = new Connection(this);
    };
    // b64EncodeUnicode(str) {
    // return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    //     return String.fromCharCode('0x' + p1);
    // }));
    // }
    MessageTransport.prototype.parse = function (messageData) {
        var message = Serializer.load(JSON.parse(messageData));
        console.log('MessageTransport::parse - received message: ' + message.action + ' for ' + message.id);
        // do not handle current's player messages from outside
        this.actionHandler.handleMessage(message);
    };
    MessageTransport.prototype.sendMessage = function (message) {
        console.log('MessageTransport::sendMessage - ' + message.action + ' to ' + message.id);
        var messageData = JSON.stringify(message.serialize());
        //var l = atob(messageData);
        this.connection.sendMessage(messageData);
    };
    return MessageTransport;
}());
function waitForSocketConnection(socket, callback) {
    var timer = 0;
    setTimeout(function () {
        if (socket.readyState === 1) {
            if (callback != null) {
                callback();
            }
            return;
        }
        else {
            console.log("wait for connection... state:" + socket.readyState);
            timer += 5;
            //    if (timer => 5000) {
            // reset the connection
            //    transporter.resetConnection();
            //    } else {
            waitForSocketConnection(socket, callback);
        }
    }, 5); // wait 5 milisecond for the connection...
}
/// <reference path="phaser/typescript/phaser.d.ts" />
/// <reference path="objects/controll.ts"/>
/// <reference path="objects/player.ts"/>
/// <reference path="objects/message.ts"/>
/// <reference path="objects/transport.ts"/>
var game;
var firstRunLandscape;
var playerId;
var transporter;
var player;
var gameinterface;
var Game = (function () {
    function Game() {
        this.ready = false;
        Game.gameRatio = window.innerWidth / window.innerHeight;
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        console.log('==========  ratio: ' + Game.gameRatio);
        console.log('==========  width: ' + Game.resx);
        console.log('==========  window width: ' + winWidth);
        console.log('==========  window height: ' + winHeight);
        game = new Phaser.Game(Game.resx, Math.ceil(Game.resx / Game.gameRatio), Phaser.CANVAS, 'phaser');
        //game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'phaser');
        game.state.add('setup', Setup);
        game.state.start('setup');
    }
    Game.resx = 1000;
    return Game;
}());
var Setup = (function () {
    function Setup() {
    }
    Setup.prototype.render = function () {
        // add currents player sprite info
        // var currentPLayer = this.actionHandler.getPlayers().getCurrentPlayer();
        // if (currentPLayer) {
        //     //game.debug.spriteInfo(currentPLayer.ship, 32, 128);
        // }
        // addcamera info
        //game.debug.cameraInfo(game.camera, 32, 32);
        // add fps
        game.debug.text(game.time.fps + ' FPS', 400, 32);
    };
    Setup.prototype.preload = function () {
        game.load.image('space1', 'assets/space1.jpg');
        game.load.image('space2', 'assets/space2.jpg');
        game.load.image('planet-earth', 'assets/planets/earth.png');
        game.load.image('planet-desert', 'assets/planets/desert.png');
        game.load.image('bullet', 'assets/bullets.png');
        game.load.image('missile', 'assets/missile3.png');
        game.load.image('ship', 'assets/ships/fury.png');
        game.load.image('spacestation1', 'assets/spacestations/spartanm.png');
        game.load.image('dust', 'assets/pixel.png');
        game.load.image('shield', 'assets/shield-1.png');
        game.load.image('crosshair', 'assets/crosshair2.png');
        game.load.image('button', 'assets/shield-1.png');
        game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64);
        game.load.spritesheet('thruster', 'assets/thruster.png', 50, 178);
        game.forceSingleUpdate = true;
        game.load.image('smoke', 'assets/particles/smoke-puff.png');
    };
    Setup.prototype.create = function () {
        console.log('Creating world');
        //    game.plugins.add(Phaser.Plugin.Debug);
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.setBounds(0, 0, 20000000, 20000000);
        game.time.advancedTiming = true;
        this.background = new Background();
        this.actionHandler = ActionHandler.getInstance();
        this.actionHandler.init();
        transporter = new MessageTransport(this.actionHandler);
        this.actionHandler.createPlayer();
        this.ready = true;
        // var button = game.add.button(10, 10, 'button', this.fire, this);
        // button.scale.set(0.8);
        // button.fixedToCamera = true;
    };
    Setup.prototype.fire = function () {
        //    Ship.Broadcast.Fire(playerId);
    };
    //update the state
    Setup.prototype.update = function () {
        var groupOfShips = this.actionHandler.getUpdateGroups();
        if (!this.ready || groupOfShips.length == 0)
            return;
        this.actionHandler.sortedCollide(game, groupOfShips.children);
        if (typeof groupOfShips != 'undefined') {
            groupOfShips.update();
        }
        if (player.ship.alive) {
            this.background.update(player.getShip());
        }
    };
    return Setup;
}());
var Background = (function () {
    function Background() {
        this.space1 = game.add.tileSprite(0, 0, Game.resx, Math.ceil(Game.resx * Game.gameRatio), 'space1');
        this.space1.fixedToCamera = true;
        this.space2 = game.add.tileSprite(0, 0, Game.resx, Math.ceil(Game.resx * Game.gameRatio), 'space2');
        this.space2.fixedToCamera = true;
        this.space2.alpha = 0.5;
        var planet = game.add.sprite(500, 400, "planet-earth");
        planet.scale.set(1);
        planet.anchor.setTo(0.5, 0.5);
        var planet = game.add.sprite(100000, 600, "planet-desert");
        planet.scale.set(0.7);
        planet.anchor.setTo(0.5, 0.5);
        var ss = game.add.sprite(1800, 400, "spacestation1");
        ss.scale.set(0.5);
        ss.anchor.setTo(0.5, 0.5);
        //planet.scale.set(scale);
    }
    Background.prototype.update = function (player) {
        if (!game.camera.atLimit.x) {
            this.space1.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.x -= (player.body.velocity.x) * game.time.physicsElapsed * 0.6;
        }
        if (!game.camera.atLimit.y) {
            this.space1.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.4;
            this.space2.tilePosition.y -= (player.body.velocity.y) * game.time.physicsElapsed * 0.6;
        }
    };
    return Background;
}());
//
// String.prototype.hexEncode = function(){
//     var hex, i;
//
//     var result = "";
//     for (i=0; i<this.length; i++) {
//         hex = this.charCodeAt(i).toString(16);
//         result += ("000"+hex).slice(-4);
//     }
//
//     return result
// }
//
// String.prototype.hexDecode = function(){
//     var j;
//     var hexes = this.match(/.{1,4}/g) || [];
//     var back = "";
//     for(j = 0; j<hexes.length; j++) {
//         back += String.fromCharCode(parseInt(hexes[j], 16));
//     }
//
//     return back;
// }
var ActionHandler = (function () {
    function ActionHandler() {
        this._score = 0;
        if (ActionHandler._instance) {
            throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
        }
        ActionHandler._instance = this;
    }
    ActionHandler.getInstance = function () {
        return ActionHandler._instance;
    };
    ActionHandler.prototype.init = function () {
        console.log('ActionHandler::init');
        this.ships = new Group.Ship();
    };
    ActionHandler.prototype.createPlayer = function () {
        player = new Player();
        console.log(player);
        var loc = new Loc();
        loc.set(1400, 400);
        var p = WeaponProperties.createProjectileTurret();
        var m = WeaponProperties.createMissileTurret();
        var wd = ItemProperties.createWarpDrive();
        var message = new Message();
        message.setId(playerId);
        message.logIn(loc, Properties.factory());
        message.addWeapon(p);
        message.addWeapon(m);
        //message.addItem(wd);
        transporter.sendMessage(message);
    };
    ActionHandler.prototype.broadCast = function () {
        console.log('ActionHandler::broadCast');
        var message = new Message();
        message.setId(playerId);
        message.addPlayer(player.getShip().getLocation(), player.getShip().getProperties());
        transporter.sendMessage(message);
    };
    ActionHandler.prototype.getShips = function () {
        return this.ships;
    };
    ActionHandler.prototype.getUpdateGroups = function () {
        return this.ships;
    };
    ActionHandler.prototype.handleMessage = function (message) {
        console.log('ActionHandler::handleMessage - ' + message.action);
        // login detected
        if (message.action == 'login') {
            console.log('ActionHandler::handleMessage - ' + message.id + ' just logged in');
            console.log(message);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            //var ship = new Phaser.Sprite(game, 100, 100, 'ship');
            game.add.existing(ship);
            this.ships.add(ship);
            // this is us, tale controll over the ship
            if (message.id == playerId) {
                console.log('ActionHandler::handleMessage - oh it\'s us. take the ship');
                player.takeControllOver(ship);
            }
            else {
                console.log('ActionHandler::handleMessage - let it know where we are');
                this.broadCast();
            }
        }
        else if (message.action == 'create' && message.id != playerId) {
            console.log(message);
            console.log('ActionHandler::handleMessage - received broadcast for: ' + message.id + ' location x: ' + message.location.x + ' location y:' + +message.location.y);
            var ship = new Ship.Ship(game, message.location.x, message.location.y, message.id);
            game.add.existing(ship);
            this.ships.add(ship);
        }
        // handle message async, it will handle stuff like location and destination
        this.ships.forEach(function (ship) {
            ship.handleMessage(message);
        }, this);
    };
    ActionHandler.prototype.leftOfBody = function (b) {
        return b.x - b.halfWidth;
    };
    ActionHandler.prototype.rightOfBody = function (b) {
        return b.x + b.halfWidth;
    };
    ActionHandler.prototype.sortedCollide = function (game, arr) {
        var $this = this;
        arr.sort(function (a, b) {
            return $this.leftOfBody(a.body) - $this.leftOfBody(b.body);
        });
        for (var i = 0; i < arr.length; ++i) {
            var elem_i = arr[i];
            for (var j = i + 1; j < arr.length; ++j) {
                var elem_j = arr[j];
                if ($this.rightOfBody(elem_i.body) < $this.leftOfBody(elem_j.body)) {
                    break;
                }
                game.physics.arcade.collide(elem_i, elem_j);
            }
        }
    };
    ActionHandler._instance = new ActionHandler();
    return ActionHandler;
}());
function goFullScreen() {
    game.gofullScreen();
}
function handleIncorrect() {
    game.handleIncorrect();
}
function handleCorrect() {
    game.handleCorrect();
}
