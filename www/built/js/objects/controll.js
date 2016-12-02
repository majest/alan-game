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
