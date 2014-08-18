var handlebars = require("handlebars"),
    mfs = require("more-fs"),
    fme = require("front-matter-extractor"),
    l = console.log;

require("../helpers/read")(handlebars);

// l(handlebars.compile("{{read 'one.txt'}}")(example));

fme.helper(handlebars);

// l(handlebars.compile("{{front-matter '---\ntitle: clive\n---\nho ass' 'title'}}")(example));

var example = mfs.read("example.json");
l(handlebars.compile(example)());