var Player = (function () {
    function Player(game, transporter) {
        this.game = game;
        this.transporter = transporter;
        this.game = game;
        this.transporter = transporter;
    }
    Player.prototype.takeControllOver = function (ship) {
        console.log('Player::takecontrollOver - taking ship id:' + ship.id);
        this.ship = ship;
        this.game.input.onDown.add(this.moveToPointer, this);
        this.game.camera.follow(this.ship);
    };
    Player.prototype.moveToPointer = function (pointer) {
        if (!this.ship)
            return;
        var message = new Message(this.ship.id);
        message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        message.setLocation(this.ship.getLocation());
        this.transporter.sendMessage(message);
    };
    Player.prototype.getShip = function () {
        return this.ship;
    };
    return Player;
})();
