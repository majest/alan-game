/// <reference path="../main.ts"/>
/// <reference path="./controll.ts"/>

var Phaser:any;
var accelerateToPointer: any;
//
// class Input {
//     public left: boolean = false;
//     public right: boolean = false;
//     public up: boolean = false;
//     public fire: boolean = false;
//
//     load(input: Input) {
//         this.left = input.left;
//         this.right = input.right;
//         this.up = input.up;
//         this.fire = input.fire;
//     }
//
//     compare(input: Input) {
//         return (
//             this.left != input.left ||
//             this.right != input.right ||
//             this.up != input.up ||
//             this.fire != input.fire
//         );
//     }
// }



class Player extends ObjectControll  {

    alive: boolean = true;

    // defines whether the player is the current player
    currentPlayer : boolean = false;

    isCurrentPlayer() {
        if (this.currentPlayer) {
            return true;
        }
        return false;
    }


    setCurrentPlayer() {

        // set that this object is the current player
        this.currentPlayer = true;

        // handle click&move
        this.game.input.onDown.add(this.moveToPointer, this);

        // follow this player
        this.game.camera.follow(this.object);
    }

    moveToPointer(pointer) {
        // set the destination
        var message = new Message(this.id);
        message.setDestination(new Loc(pointer.worldX, pointer.worldY));
        message.setLocation(this.getLocation());
        this.transporter.sendMessage(message);
    }

    update() {
        this.moveToLocation();
    }

}
