module.exports = function(handlebars){
    require("../helpers/read")(handlebars);
    require("../helpers/readdir")(handlebars);
    require("../helpers/JSONstringify")(handlebars);
};
