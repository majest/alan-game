var fs = require("fs"),
    path = require("path");

module.exports = function(handlebars){
    handlebars.registerHelper("readdir", function(dir){
        return fs.readdirSync(dir).map(function(file){
            return path.join(dir, file);
        });
    });
};
