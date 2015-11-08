class ObjectControll {

    // object
    public object;

    // object properties
    public properties;

    // current message
    public message;

    // object id
    public id;

    // data transporter
    transporter: MessageTransport;

    // stors the phaser game object
    game;

    constructor(game, id) {
        this.game = game;
        this.id = id;
    }

    // set the transport object
    setTransporter(transporter: MessageTransport) {
        console.log('setting transporter');
        console.log(transporter);
        this.transporter = transporter;
    }

    sendMessage(message: Message) {
    }

    handleMessage(message: Message) {
        console.log('ObjectControll::handleMessage');
        this.message = message;
        this.properties = message.properties;

        if (!this.object) {
            console.log('Creating object');
            this.create();
        }

        if (this.message.location) {
            this.updateState(this.message);
        }
    }

    updateState(location: Loc) {

        if (typeof location.rotation != 'undefined') {
            this.object.x = location.x;
            this.object.y = location.y;
            this.object.rotation = location.rotation;
            this.object.angle = location.angle;
            this.object.body.velocity.x = location.velocityx;
            this.object.body.velocity.y = location.velocityy;
        }
    }

    resetMessage() {
        this.message = null;
    }

    getObject() {
        return this.object;
    }

    getRotation() {
        return this.object.rotation;
    }

    setRotation(rotation) {
        this.object.rotation = rotation;
    }

    getSpeed(): Number {
        return Math.sqrt(Math.pow(this.object.body.velocity.x,2) + Math.pow(this.object.body.velocity.y,2));
    }

    getLocation() : Loc {
        var loc =  new Loc(this.object.x, this.object.y);
        loc.setState(this.getRotation(), this.getAngle(), this.object.body.velocity.x, this.object.body.velocity.y);
        return loc;
    }

    getAngle() : number {
        return this.object.angle;
    }

    moveToLocation() {

        if (!this.message || !this.message.hasDestination()) {
            return;
        }

        var movement = this.message.movement;
        var destination = this.message.destination;

        var x = destination.x;
        var y = destination.y;

        // calcualte distance to target
        var distanceToTarget: number = parseFloat(this.game.physics.arcade.distanceToXY(this.object, x, y).toFixed(2));

        // finish processing the message once we have reached the target
        if (distanceToTarget < 8.0) {
            this.resetMessage()
        }

        // if the destiantion is Set
        // and movement is not finished (needs to continue performing movement untill end)
        // or we are not moving and movement is finished
        if (destination.isSet() && (!movement.movementFinished || (movement.movementFinished && !movement.moving))) {

            var rotation = this.game.physics.arcade.moveToXY(this.object, x, y, this.properties.speed);

            if (this.getRotation() !== rotation && (!movement.rotationFinished || (movement.rotationFinished && !movement.rotating))) {

                // Calculate difference between the current angle and targetAngle
                var delta: number = rotation - this.getRotation();

                // Keep it in range from -180 to 180 to make the most efficient turns.
                if (delta > Math.PI) delta -= Math.PI * 2;
                if (delta < -Math.PI) delta += Math.PI * 2;


                if (delta > 0) {
                    this.object.angle += this.properties.turnRate;
                } else {
                    this.object.angle -= this.properties.turnRate;
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

	          this.object.body.velocity.x = Math.cos(this.object.rotation) * this.properties.speed
	          this.object.body.velocity.y = Math.sin(this.object.rotation) * this.properties.speed


        }
    }

    create() {

        if (!this.properties) {
            console.error('Missing object properties');
            return;
        }

        console.log('ObjectControll::create - Creating object at x:' + this.message.location.x + ', y:' + this.message.location.y);
        this.object = this.game.add.sprite(this.message.location.x, this.message.location.y, this.message.properties.object);
        this.object.id = this.message.id;

        this.game.physics.enable(this.object, Phaser.Physics.ARCADE);

        //this.ship.body.setZeroRotation();
        //this.ship.body.allowRotation = true;
        this.object.body.drag.set(this.properties.breakingForce);
        this.object.body.maxVelocity.set(this.properties.speed);
        this.object.anchor.setTo(0.5, 0.5);

        //this.ship.body.maxAngular = 500;
        this.object.body.angularDrag = 50;
        this.object.rotation = 0;
        this.object.angle = 0;
        this.object.scale.setTo(0.5, 0.5);
    }

    setProperties(properties: Properties) {
        this.properties = properties;
    }
}
