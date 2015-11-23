var Player = (function () {
    function Player() {
    }
    Player.prototype.takeControllOver = function (ship) {
        console.log('Player::takecontrollOver - taking ship id:' + ship.id);
        this.ship = ship;
        game.input.onDown.add(this.moveToPointer, this);
        game.camera.follow(this.ship);
    };
    Player.prototype.moveToPointer = function (pointer) {
        if (!this.ship)
            return;
        var message = new Message(this.ship.id);
        message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        message.setLocation(this.ship.getLocation());
        transporter.sendMessage(message);
    };
    Player.prototype.getShip = function () {
        return this.ship;
    };
    return Player;
})();
