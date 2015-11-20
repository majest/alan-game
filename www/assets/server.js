//

var express = require('express'),
    app = express(app),
    server = require('http').createServer(app);


// serve static files from the current directory
app.use(express.static(__dirname__));


server.listen(8000);