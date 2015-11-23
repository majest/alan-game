var playerId;
var game;
window.onload = function () {
    playerId = 'art' + Math.random();
    playerId = playerId.substring(0, 8);
    var startScreen = document.getElementById('startScreen');
    var phaser = document.getElementById('phaser');
    startScreen.style.display = 'none';
    phaser.style.display = 'block';
    new Game();
};
