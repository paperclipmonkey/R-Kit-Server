var app = require('./app'),
	CONFIG = require('config').app;

var port = process.env.PORT || CONFIG['port'];

var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});