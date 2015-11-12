
var playerId;

$("#login").click(function() {
    playerId = $('#playerId').val();
    $('#startScreen').hide();
    $('#phaser').show();
    game = new Game();


});
