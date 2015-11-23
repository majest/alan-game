/// <reference path="../phaser/typescript/phaser.d.ts" />

//
// class ObjectControll {
//
//     // object
//     public object;
//
//     // object properties
//     public properties;
//
//     // current message
//     public message;
//
//     // object id
//     public id;
//
//     // data transporter
//     transporter: MessageTransport;
//
//     // stors the phaser game object
//     game;
//
//     text;
//
//     constructor(game, id) {
//         this.game = game;
//         this.id = id;
//         console.log('ObjectControll::constructor - id:' + id);
//     }
//
//     // set the transport object
//     setTransporter(transporter: MessageTransport) {
//         console.log('setting transporter');
//         console.log(transporter);
//         this.transporter = transporter;
//     }
//
//     sendMessage(message: Message) {
//     }
//
//     handleMessage(message: Message) {
//         console.log(message);
//         console.log('ObjectControll::handleMessage');
//         this.message = message;
//
//         this.properties = message.properties;
//
//         if (!this.object) {
//             console.log('Creating object');
//             this.create();
//
//         }
//
//         this.object.handleMessage(message);
//
//         if (this.message.location) {
//             this.updateState(this.message);
//         }
//     }
//
//     updateState(location: Loc) {
//
//         if (typeof location.rotation != 'undefined') {
//             this.object.x = location.x;
//             this.object.y = location.y;
//             this.object.rotation = location.rotation;
//             this.object.angle = location.angle;
//             this.object.body.velocity.x = location.velocityx;
//             this.object.body.velocity.y = location.velocityy;
//         }
//     }
//
//     resetMessage() {
//         this.message = null;
//     }
//
//     getObject() {
//         return this.object;
//     }
//
//     getRotation() {
//         return this.object.rotation;
//     }
//
//     setRotation(rotation) {
//         this.object.rotation = rotation;
//     }
//
//     getSpeed(): Number {
//         return Math.sqrt(Math.pow(this.object.body.velocity.x,2) + Math.pow(this.object.body.velocity.y,2));
//     }
//
//     getLocation() : Loc {
//         var loc =  new Loc(this.object.x, this.object.y);
//         loc.setState(this.getRotation(), this.getAngle(), this.object.body.velocity.x, this.object.body.velocity.y);
//         return loc;
//     }
//
//     getAngle() : number {
//         return this.object.angle;
//     }
//
//     create() {
//
//         if (!this.properties) {
//             console.error('Missing object properties');
//             return;
//         }
//         console.log('ObjectControll::create - Creating object at x:' + this.message.location.x + ', y:' + this.message.location.y);
//         //this.object = this.game.add.sprite(this.message.location.x, this.message.location.y, this.message.properties.object);
//
//         this.object = new Ship.Ship(this.game, this.message.location.x, this.message.location.y, this.id);
//         this.game.add.existing(this.object);
//         this.object.id = this.message.id;
//
//
//
//     }
//
// }


class Player   {

    ship;
    scene;

    constructor() {
    }

    takeControllOver(ship: Ship.Ship) {
        console.log('Player::takecontrollOver - taking ship id:' + ship.id);
        this.ship = ship;
        // handle click&move
        game.input.onDown.add(this.moveToPointer, this);

        // follow this player
        game.camera.follow(this.ship);
    }

    moveToPointer(pointer) {

        if (!this.ship) return;
        // set the destination
        var message = new Message(this.ship.id);
        message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        message.setLocation(this.ship.getLocation());
        transporter.sendMessage(message);
    }

    getShip() {
        return this.ship;
    }

}
