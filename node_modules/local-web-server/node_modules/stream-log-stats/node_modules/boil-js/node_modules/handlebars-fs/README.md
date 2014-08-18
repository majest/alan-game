[![view on npm](http://img.shields.io/npm/v/handlebars-fs.svg)](https://www.npmjs.org/package/handlebars-fs)
![npm module downloads per month](http://img.shields.io/npm/dm/handlebars-fs.svg)
[![Dependency Status](https://david-dm.org/75lb/handlebars-fs.svg)](https://david-dm.org/75lb/handlebars-fs)

handlebars-fs
===============
Handlebars helper mappings for the node.js [fs module](http://nodejs.org/api/fs.html). Works server and client-side (using browserify).

##Install
```sh
$ npm install handlebars-fs
```

##Usage
```js
var handlebars = require("handlebars");
var handlebarsFs = require("handlebars-fs");

/* this will register the handlebars-fs helpers on your handlebars instance */
handlebarsFs(handlebars);
```

###Example
```
{{#if (fs-exists 'readme.md')}}
Readme exists
{{/if}}
```
