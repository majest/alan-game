module.exports = function(handlebars){
    handlebars.registerHelper("JSONstringify", function(input){
        if (input){
            return JSON.stringify(input);
        } else {
            return "null";
        }
    });
};
