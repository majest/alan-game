var playerId;
var game;
window.onload = function () {
    document.getElementById("login").addEventListener("click", function () {
        playerId = document.getElementById('playerId').value;
        var startscreen = document.getElementById('startScreen');
        startscreen.style.display = 'none';
        var startscreen = document.getElementById('phaser');
        startscreen.style.display = 'block';
        game = new Game();
    });
};
