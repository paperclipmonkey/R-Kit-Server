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
	var viewId
	before(function(done){
		server = app.listen(process.env.PORT, function(){
			rAgent = request.agent(app)
			var fs = require('fs')
			var uuid = require('node-uuid')
			done()
		});
	});

	it('POST /response should return 400',function(done){
	rAgent
		.post('/response')
		.expect(400,done);
	});

	it('POST /response should return 200',function(done){
		this.timeout(10000)
		//Load image from file
		rAgent
			.post('/response')
			.send({
			nonce: '4',
			comments: 'cat',
			lng: '11',
			lat: '11'
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
				viewId = res.body.id;
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
				return res.body.id !== viewId;//Works in reverse. True means error, false means pass
			}).end(done);
	});

	after(function() {
		server.close();
	});

});

describe('Back-end',function(){
	var rAgent;
	before(function(done){
		server = app.listen(process.env.PORT, function(){
			rAgent = request.agent(app);
			done();
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
	  .send({username: 'glastohacks@gmail.com', password: 'glastonbury1'})
	  .expect(302)
	  .expect('location', '/admin/login', done);
	});

	it('POST /admin/login should login & set cookie',function(done){
	rAgent
	  .post('/admin/login')
	  .send({username: 'glastohacks@gmail.com', password: 'glastonbury'})
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

	// it('POST /responses/new/ should add new area',function(done){
	//   rAgent
	//     .post('/admin/responses/new/')
	//     .send({
	//       name:'test',
	//       twitter:'test',
	//       website:'test',
	//       loc:'{"coordinates":[[[-4.053811277785324,51.20433457239784],[-4.007597736803445,51.19739941184122],[-3.983156106324372,51.19157260178689],[-3.969179631372659,51.16337330788794],[-3.934741037118132,51.16149973059944],[-3.901256508974158,51.14712397920866],[-3.883183334265228,51.12839023268349],[-3.868934334228307,51.09561861180481],[-3.829000033563197,51.08293431937978],[-3.805015535777541,51.05843527715723],[-3.757645708638051,51.04900406172283],[-3.708601490362808,51.0444745274642],[-3.66713529859512,51.04098433395254],[-3.630689023451794,51.03693248293776],[-3.587082528726521,51.03612120055641],[-3.559864106907772,51.02700515443644],[-3.527487747005998,51.01527725063428],[-3.47000542459968,51.02574398190755],[-3.425718948107913,51.05105427475365],[-3.419051184211735,51.08202064205543],[-3.369616245361678,51.09024332844456],[-3.309589560900005,51.09401567519809],[-3.284057383075013,51.10846840712964],[-3.304903309058935,51.1375969737466],[-3.355666389188158,51.15895541899641],[-3.389709955239067,51.15698295550389],[-3.407657415592152,51.18021629602056],[-3.417455071614844,51.20210071739069],[-3.462733517018304,51.22222291870003],[-3.524540997136634,51.23875785292998],[-3.602202573010662,51.23769907111762],[-3.70703936116741,51.2410310602363],[-3.792458922712144,51.25635521190181],[-3.885188309357289,51.23992618335758],[-3.968217191674391,51.23805773517002],[-4.044344921288225,51.22127197537402],[-4.053811277785324,51.20433457239784]]],"type":"Polygon"}'
	//     })
	//     .expect(302)
	//     .end(function(err, res){
	//       viewAdr = res.header.location;
	//       done(err);
	//     });
	// });

	// it('GET /admin/responses/x should show area',function(done){
	//   rAgent
	//     .get(viewAdr)
	//     .expect(200)
	//     .expect(/\btest\b/, done);
	// });

	// it('DELETE /admin/responses/x should delete new area',function(done){
	//   request
	//     .get(viewAdr + '/delete')
	//     .expect(302)
	//     .expect(/^((?!test).)*$/, done);
	// });



	after(function() {
	server.close();
	});
});



describe('Downloads',function(){
	var mongoose = require('mongoose');
	var responseModel = mongoose.model('response');

	var rAgent;
	var viewId;
	before(function(done){
		server = app.listen(process.env.PORT, function(){
			//Create sample view
			require('../models/Response.js');			//Include (view)
			var responseObj = {
				nonce: '9876543rtyhjhgf',
				heading: '121.1',
				loc: { coordinates: [11,22], type: 'Point' },
				photo: '0A1CCEDB-B3E8-43BC-9F1E-05647381A5BC.jpg',
				age: '0-18',
				knowarea: 'Very well',
				words: ['Something', 'Else','Here'],
				comments: 'A comment',
				ts: new Date(),
				display: true
			}
			var response = new responseModel(responseObj);
			response.save(function (err, obj) {
				if(err){throw err}
				//get ID of view
				viewId = obj._id;

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

	//http://localhost:3010/admin/responses/download/images/[%225351a143a4288dea3100001c%22,%225351a12da4288dea3100001b%22,%2253387d9aa4288dea3100000b%22,%22527faa8d606d4f890300000b%22,%22527fa6ab606d4f8903000009%22,%22524ecfa9f682daf036000001%22]
	it('GET /admin/responses/x/download/kmz should return kmz file',function(done){
		this.timeout(30000)
		rAgent
			.get('/admin/responses/' + viewId + '/download/kmz/')
			//.expect('')//Check it has a filename
			.expect(200,done);
	});

	it('GET /admin/responses/download/kmz/[ids] should return kmz file',function(done){
		this.timeout(30000)
		rAgent
			.get('/admin/responses/download/kmz/["' + viewId + '"]')
			//.expect('')//Check it has a filename
			.expect(200,done);
	});

	it('GET /admin/responses/x/download/image should return image',function(done){
		this.timeout(30000)
		rAgent
			.get('/admin/responses/' + viewId + '/download/image')
			//.expect('');//Check it has a filename
			.expect(200,done);
	});

	it('GET /admin/responses/download/images/[] should return images',function(done){
		this.timeout(30000)
		rAgent
			.get('/admin/responses/download/images/["' + viewId + '"]')
			//.expect('');//Check it has a filename
			.expect(200,done);
	});

	after(function(done) {
		//Delete view
		responseModel.remove({_id: viewId}, function(err,result){
			server.close();
			done();
		});
	});

});
