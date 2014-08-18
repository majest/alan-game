var mfs = require("more-fs"),
    fs = require("fs");

module.exports = function(handlebars){
    handlebars.registerHelper("read", function(filename){
        if (Array.isArray(filename)){
            var filenames = filename;
            return filenames.map(function(file){
                var stat = fs.statSync(file);
                return {
                    filename: file,
                    content: mfs.read(file),
                    modified: stat.mtime
                };
            });
        } else {
            return mfs.read(filename);
        }
    });
};
