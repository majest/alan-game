

$("#login").click(function() {
    playerId = $('#playerId').val();
    game = new Game();
    $('#startScreen').hide();
    $('#phaser').show();
});
