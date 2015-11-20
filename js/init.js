
var playerId;
var game;

window.onload = function() {
    document.getElementById("login").addEventListener("click", function() {
        playerId = (<HTMLInputElement>document.getElementById('playerId')).value;
        hideshow('startScreen');
        hideshow('phaser');
        game = new Game();
    });
}

function hideshow(which){
    var element = document.getElementById(which)
    if (element.style.display=="block") {
        element.style.display="none"
    }    else {
        element.style.display="block"
    }
}
