/// <reference path="../phaser/typescript/phaser.d.ts" />

class Player   {

    ship;
    scene;

    constructor() {
    }

    takeControllOver(ship: Ship.Ship) {
        console.log('Player::takecontrollOver - taking ship id:' + ship.id);
        this.ship = ship;
        // handle click&move
        game.input.onUp.add(this.moveToPointer, this);

        // follow this player
        game.camera.follow(this.ship);
    }

    moveToPointer(pointer) {

        // ignore the movemenet if we are clicking on another sprite
        if (!this.ship || pointer.targetObject != null) return;

        this.ship.sendLocation(pointer);
        // set the destination

    }

    // game.input.onTap.add(function(e){
    //     if (Math.floor(e.x/(this.game.width/2)) === LEFT) {
    //         //do left stuff
    //     }
    //
    //     if (Math.floor(e.x/(this.game.width/2)) === RIGHT) {
    //         //do right stuff
    //     }
    // });


    getShip() {
        return this.ship;
    }

}
