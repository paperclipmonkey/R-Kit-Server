# R-Kit Server
Welcome to R-Kit server, the new way of conducting research studies.

R-kit is a mobile app SDK and node.js application designed to help researchers build android-based research studies quickly and easily.

Data collected by the mobile application can be collected and stored using this server, or any other server capable of storing incoming POST data.

The platform has been designed to be easily extendable, for example to add additional data-processing functionality, or can act as a reference platform to create your own server.

[![Build Status](https://api.travis-ci.com/paperclipmonkey/R-Kit.svg?token=SsrjjdmEtzcJsGDqjxQw&branch=master)](https://travis-ci.com/paperclipmonkey/R-Kit/)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

[![Code Climate](https://codeclimate.com/repos/55effcda695680426d000216/badges/194e573fe723d9c50a96/gpa.svg)](https://codeclimate.com/repos/55effcda695680426d000216/feed)

This sample server implementation is written in node.js. Ensure you have node.js >0.10 as well as NPM installed.

Data is stored in to a [MongoDB](https://www.mongodb.com/) instance, with an [amazon S3](https://aws.amazon.com/s3/) instance storing the uploaded files.

Additionally it uses the Heroku local toolchain to set up the local environment.
You can install [Heroku Toolbelt](https://toolbelt.heroku.com/) here.

Local environment variables are setup in an .env file. These follow simple key=value lines.
Required values are:

`MONGO_URI`
`S3_ACCESS_KEY_ID`
`S3_SECRET_ACCESS_KEY`
`S3_REGION`
`S3_BUCKET`
`S3_URL`
`SESSION_PW`


The code relies on other modules. You will need to install these dependancies before running the code.
## To install modules
	npm install
## To test the code locally
	npm test
## To build the documentation
	make docs
## To run the the code locally
	npm start
	
The server is built with the heroku platform in mind. It is deployable on any platform that supports the procfile standard with no modification. To run it in any arbitrart node.js environment only the startup scripts and environment variables will need to change.

If you want to submit code upstream ensure any new code is covered by tests (>90% coverage) and that any code is formatted correctly following JS standard. Code can be automatically formatted by running:
	`make standard`