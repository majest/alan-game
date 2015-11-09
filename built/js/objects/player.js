var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Phaser;
var accelerateToPointer;
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.apply(this, arguments);
        this.alive = true;
        this.currentPlayer = false;
    }
    Player.prototype.isCurrentPlayer = function () {
        if (this.currentPlayer) {
            return true;
        }
        return false;
    };
    Player.prototype.setCurrentPlayer = function () {
        this.currentPlayer = true;
        this.game.input.onDown.add(this.moveToPointer, this);
        this.game.camera.follow(this.object);
    };
    Player.prototype.moveToPointer = function (pointer) {
        var message = new Message(this.id);
        message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        message.setLocation(this.getLocation());
        this.transporter.sendMessage(message);
    };
    Player.prototype.update = function () {
        this.moveToLocation();
    };
    return Player;
})(ObjectControll);
