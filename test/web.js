var app = require('../app'),
	request = require('supertest'),
	server;

describe('Front-end',function(){
  var rAgent;
  before(function(done){
	server = app.listen(process.env.PORT, function(){
	  rAgent = request.agent(app);
	  done();
	});
  });

  it('GET / should return 200',function(done){
	rAgent
		.get('/')
		.expect(200,done);
  });

  after(function() {
	server.close();
  });

});

describe('App API',function(){
	var rAgentba
	var nonce
	var responseId
	before(function(done){
		server = app.listen(process.env.PORT, function(){
			rAgent = request.agent(app)
			var fs = require('fs')
			var uuid = require('node-uuid')
			done()
		});
	});

	it('POST /response should return 200',function(done){
		this.timeout(10000)
		//Load image from file
		rAgent
			.post('/response')
			.send({
			nonce: '4',
			data: {'one':'two'}
			})
		.expect(200,done);
	});

	it('POST /response with nonce should return 200',function(done){
		this.timeout(10000)
		//Load image from file
		rAgent
			.post('/response')
			.send({
				age: '0-18',
				knowarea: 'Very well',
				heading: '121.3',
				nonce: nonce
			})
			.expect(200).end(function(err, res){
				responseId = res.body.id;
				done();
			});
	});

	it('POST /response with nonce should return same ID',function(done){
		//Load image from file
		rAgent
			.post('/response')
			.send({
				age: '0-18',
				knowarea: 'Very well',
				heading: '121.3',
				nonce: nonce,
				words: 'ca, ba, aa',
				comments: 'cat',
				lng: '11',
				lat: '11'
			})
			.expect(function(res){
				return res.body.id !== responseId;//Works in reverse. True means error, false means pass
			}).end(done);
	});

	after(function() {
		server.close();
	});

});

describe('Back-end',function(){
	var rAgent;
	var adminEmail = 'example@test.test'
	var adminPassword = 'something'

	before(function(done){
		server = app.listen(process.env.PORT, function(){
			rAgent = request.agent(app);
			//Remove example user if found
			var mongoose = require('mongoose');
			var User = mongoose.model('user');
			var user = new User({
				    email: adminEmail,
				    password: 'something',
				    salt: adminEmail,
				    fullname: 'Test user',
				    phoneno: '594930305838203'
			})
			try{
				user.save()
			} catch(e){}
			done()
			//Create example user
		});
	});

	it('GET /admin should redirect to login',function(done){
	rAgent
	  .get('/admin/')
	  .expect(302,done);
	});

	it('GET /admin/login should give 200',function(done){
	rAgent
	  .get('/admin/login')
	  .expect(200,done);
	});

	it('POST /admin/login should not login',function(done){
	rAgent
	  .post('/admin/login')
	  .send({username: adminEmail, password: adminPassword + 1})
	  .expect(302)
	  .expect('location', '/admin/login', done);
	});

	it('POST /admin/login should login & set cookie',function(done){
	rAgent
	  .post('/admin/login')
	  .send({username: adminEmail, password: adminPassword})
	  .expect(302)
	  .expect('location', "/admin/", done);
	});

	/* - - - - Dashboard - - - - - */

	it('GET /admin/ should show dashboard',function(done){
	rAgent
	  .get('/admin/')
	  .expect(200)
	  .expect(/\bdashboard\b/, done);
	});

	it('GET /admin/dash/responses/week should show total responses this week',function(done){
	rAgent
	  .get('/admin/dash/responses/week')
	  .expect(200, done);
	});

	it('GET /admin/dash/responses/months should show total responses this month',function(done){
	rAgent
	  .get('/admin/dash/responses/months')
	  .expect(200, done);
	});

	it('GET /admin/dash/responses/total should show total responses',function(done){
	rAgent
	  .get('/admin/dash/responses/total')
	  .expect(200, done);
	});

	it('GET /admin/dash/responses/latest should show latest responses',function(done){
	rAgent
	  .get('/admin/dash/responses/latest')
	  .expect(200, done);
	});

	// it('GET /admin/dash/responses/words should show latest words',function(done){
	//   rAgent
	//     .get('/admin/dash/responses/words')
	//     .expect(200, done);
	// });

	/* - - - - Users - - - - - */

	it('GET /admin/users should show users',function(done){
	rAgent
	  .get('/admin/users/')
	  .expect(/\bEmail\b/, done);
	});

	it('GET /admin/users/new/ should show form',function(done){
	rAgent
	  .get('/admin/users/new/')
	  .expect(200)
	  .expect(/\bEmail\b/, done);
	});

	var userAdr;

	it('POST /admin/users/new/ should add new user',function(done){
	rAgent
	  .post('/admin/users/new/')
	  .send({
		fullname: 'test',
		//image: 'glastonbury',
		email: 'test@test.com',
		organisation: 'Test',
		phoneno: '01792',
		password: 'test'
	  })
	  .expect(302)
	  .end(function(err, res){
		userAdr = res.header.location;
		done();
	  });
	});

	it('GET /admin/users/x should show user',function(done){
	rAgent
	  .get(userAdr)
	  .expect(200)
	  .expect(/\btest\b/, done);
	});

	it('DELETE /admin/users/x should delete new user',function(done){
	rAgent
	  .get(userAdr + '/delete')
	  .expect(302)
	  .expect(/^((?!test).)*$/, done);
	});

	/* - - - - - Responses - - - - - - */

	it('GET /admin/responses should show responses',function(done){
	rAgent
	  .get('/admin/responses/')
	  .expect(200)
	  .expect(/\bLocation\b/, done);
	});

	var viewAdr;

	after(function() {
		server.close();
	});
});



describe('Downloads',function(){
	var mongoose = require('mongoose');
	var responseModel = mongoose.model('response');

	var rAgent;
	var responseId;
	before(function(done){
		server = app.listen(process.env.PORT, function(){
			//Create sample view
			require('../models/Response.js');			//Include (view)
			var responseObj = {
				nonce: '9876543rtyhjhgf',
				data: {'one':'one','two':'two'}
			}
			var response = new responseModel(responseObj);
			response.save(function (err, obj) {
				if(err){throw err}
				//get ID of view
				responseId = obj._id;

				rAgent = request.agent(app);
				//Login using the rAgent
				rAgent
				  .post('/admin/login')
				  .send({username: 'glastohacks@gmail.com', password: 'glastonbury'})
				  .expect(302)
				  .end(done);
			});
			
		});
	});

	// it('GET /admin/responses/x/download/files should return files',function(done){
	// 	this.timeout(30000)
	// 	rAgent
	// 		.get('/admin/responses/' + responseId + '/download/files')
	// 		//.expect('');//Check it has a filename
	// 		.expect(200,done);
	// });

	// it('GET /admin/responses/download/files/[] should return files',function(done){
	// 	this.timeout(30000)
	// 	rAgent
	// 		.get('/admin/responses/download/files/["' + responseId + '"]')
	// 		//.expect('');//Check it has a filename
	// 		.expect(200,done);
	// });

	after(function(done) {
		//Delete view
		responseModel.remove({_id: responseId}, function(err,result){
			server.close();
			done();
		});
	});

});
