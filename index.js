/**
# R-Kit
###Welcome to *R-Kit* server, the new way of conducting research studies.

R-kit is a mobile app SDK and node.js application designed to help researchers build android-based research studies quickly and easily.

Data collected by the mobile application can be collected and stored using this server, or any other server capable of storing incoming POST data.

The platform has been designed to be easily extendable, for example to add additional data-processing functionality, or can act as a reference platform to create your own server.

Use this docuementation as a simple way of learning about the r-kit server code and how to modify or extend its use for your specific use-case.

All of the documentation is written in Markup and converted to HTML using the NPM module Groc.

*/

var app = require('./app')

var server = app.listen(process.env.PORT, function () {
  console.log('Listening on port %d', server.address().port)
})
