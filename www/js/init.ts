
var playerId;
var game;

window.onload = function() {
    playerId = 'art';
    var startScreen = document.getElementById('startScreen');
    var phaser = document.getElementById('phaser');
    startScreen.style.display = 'none';
    phaser.style.display = 'block';
    new Game();

    // document.getElementById("login").addEventListener("click", function() {
    //     playerId = (<HTMLInputElement>document.getElementById('playerId')).value;
    //     var startScreen = document.getElementById('startScreen');
    //     var phaser = document.getElementById('phaser');
    //     startScreen.style.display = 'none';
    //     phaser.style.display = 'block';
    //     game = new Game();
    // });
}
