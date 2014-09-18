var Planet = function(game, x, y, scale, type) {
    var planet = game.add.sprite(x, y, "planet-" + type);
    planet.scale.set(scale);
}