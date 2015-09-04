var should = require('should'),
	fs = require('fs'),
	mongoose = require('mongoose');

var modelFiles = fs.readdirSync(__dirname + "/../models");
modelFiles.forEach(function(file) {
	require(__dirname + "/../models/" + file);
});

var Response = mongoose.model('response');

describe('Response',function(){
	var response;

	/*
	nonce: {type: String},
    data: {type: Object, 'default': {}},
    files: {
      type: Array,
      required: false
    },
    ts: {type: Date, 'default': Date.now},
	*/

	before(function(done){
		response = new Response({
			nonce: 'uniqueoneoffstring',
			data: {'one':'one','two':'two'}
		});
		done();
	});

	it('should have a nonce',function(){
		response.should.have.property('nonce','uniqueoneoffstring');
	});

	it('should have data',function(){
		response.should.have.property('data');
	});

	it('should be saveable',function(done){
		response.save(done);
	});

	it('should be deleteable',function(done){
		response.remove(done);
	});
});