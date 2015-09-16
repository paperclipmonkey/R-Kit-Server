/**
# R-Kit
###Welcome to *R-Kit* server, the new way of conducting research studies.

Use this docuementation as a simple way of learning about the r-kit server code and how to modify or extend its use for your specific use-case.
*/

var app = require('./app')

var server = app.listen(process.env.PORT, function() {
    console.log('Listening on port %d', server.address().port);
});