/**
* File that initialises the application by starting a new server instance and binding to a port. 
* This should be run with the npm start command
**/

var app = require('./app')

var server = app.listen(process.env.PORT, function() {
    console.log('Listening on port %d', server.address().port);
});