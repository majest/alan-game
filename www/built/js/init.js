var playerId;
var game;
window.onload = function () {
    playerId = 'art';
    var startScreen = document.getElementById('startScreen');
    var phaser = document.getElementById('phaser');
    startScreen.style.display = 'none';
    phaser.style.display = 'block';
    new Game();
};
