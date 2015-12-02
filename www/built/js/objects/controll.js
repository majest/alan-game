var Player = (function () {
    function Player() {
    }
    Player.prototype.takeControllOver = function (ship) {
        console.log('Player::takecontrollOver - taking ship id:' + ship.id);
        this.ship = ship;
        game.input.onUp.add(this.moveToPointer, this);
        game.camera.follow(this.ship);
    };
    Player.prototype.moveToPointer = function (pointer) {
        if (!this.ship || pointer.targetObject != null)
            return;
        Ship.Broadcast.Location(this.ship.id, pointer.worldX, pointer.worldY);
    };
    Player.prototype.getShip = function () {
        return this.ship;
    };
    return Player;
})();
