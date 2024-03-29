/*
#web
Test all of the web endpoints
*/

var app = require('../app')
var request = require('supertest')
var async = require('async')
var server

// ##front-end tests
describe('Front-end', function () {
  var rAgent
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      done()
    })
  })

  // ####Check default URL
  it('GET / should return 200', function (done) {
    rAgent
      .get('/')
      .expect(200, done)
  })

  after(function () {
    server.close()
  })

})

// ##API tests
describe('App API', function () {
  var rAgentba
  var nonce
  var responseId
  before(function (done) {
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      var fs = require('fs')
      var uuid = require('node-uuid')
      done()
    })
  })

  // ####Check upload without file
  it('POST /response without file return 200', function (done) {
    this.timeout(10000)
    // Load image from file
    rAgent
      .post('/response')
      .send({
        nonce: '4',
        data: {'one': 'two'}
      })
      .expect(200, done)
  })

  // ####Check upload with file
  it('POST /response with file return 200', function (done) {
    this.timeout(10000)
    // Load image from file
    rAgent
      .post('/response')
      .attach('image1', __dirname + '/data/example.jpg', 'photo1.jpg')
      .attach('image2', __dirname + '/data/example.jpg', 'photo2.jpg')
      .send({
        nonce: '4',
        data: {'one': 'two'}
      })
      .expect(200, done)
  })

  // ####Check upload with nonce
  it('POST /response with nonce should return 200', function (done) {
    this.timeout(10000)
    // Load image from file
    rAgent
      .post('/response')
      .send({
        data: {'one': 'two'},
        nonce: nonce
      })
      .expect(200).end(function (err, res) {
      responseId = res.body.id
      done()
    })
  })

  // ####Check upload with nonce returns same
  it('POST /response with nonce should return same ID', function (done) {
    // Load image from file
    rAgent
      .post('/response')
      .send({
        data: '0, 0, 1, 2',
        files: '121.3',
        nonce: nonce,
      })
      .expect(function (res) {
        return res.body.id !== responseId; // Works in reverse. True means error, false means pass
      }).end(done)
  })

  // ####Cleanup
  after(function () {
    server.close()
  })

})

// ##back-end tests
describe('Back-end', function () {
  var rAgent
  var adminEmail = 'example@test.test'
  var adminPassword = 'something'
  var responseId
  var responseIdWithFiles

  // ####Before
  before(function (done) {
    this.timeout(30000)
    server = app.listen(process.env.PORT, function () {
      rAgent = request.agent(app)
      // Remove example user if found
      var mongoose = require('mongoose')
      var User = mongoose.model('user')

      async.parallel([
        function (cback) {
          User.remove({'email': adminEmail}, function (e) {
            var user = new User({
              email: adminEmail,
              password: 'something',
              salt: adminEmail,
              fullname: 'Test user',
              phoneno: '594930305838203'
            })
            user.save(cback)
          })
        },
        function (cback) {
          rAgent
            .post('/response')
            .attach('image1', __dirname + '/data/example.jpg', 'photo1.jpg')
            .attach('image2', __dirname + '/data/example.jpg', 'photo2.jpg')
            .send({
              data: {'one': 'two'}
            })
            .end(function (err, res) {
              var resp = JSON.parse(res.res.text)
              resp.id
              responseIdWithFiles = resp.id
              cback(err)
            })
        },
        function (cback) {
          var Response = mongoose.model('response')
          var response = new Response({
            nonce: '11223344',
            data: {'one': 'one','two': 'two'}
          })
          response.save(function (e, d) {
            if (e) return cback(e)
            responseId = d.id
            cback()
          })

        }
      ], function (e, d) {
        done(e)
      })
    })
  })

  // ####When not logged in check
  it('GET /admin should redirect to login', function (done) {
    rAgent
      .get('/admin/')
      .expect(302, done)
  })

  // ####Check login page displays
  it('GET /admin/login should give 200', function (done) {
    rAgent
      .get('/admin/login')
      .expect(200, done)
  })

  // ####Check login with bad credentials
  it('POST /admin/login should not login', function (done) {
    rAgent
      .post('/admin/login')
      .send({username: adminEmail, password: adminPassword + 1})
      .expect(302)
      .expect('location', '/admin/login', done)
  })

  // ####Check login
  it('POST /admin/login should login & set cookie', function (done) {
    rAgent
      .post('/admin/login')
      .send({username: adminEmail, password: adminPassword})
      .expect(302)
      .expect('location', '/admin/', done)
  })

  // - - - - - - - - - - - - - - -
  // ###Dashboard

  // ####Check dashboard shows
  it('GET /admin/ should show dashboard', function (done) {
    rAgent
      .get('/admin/')
      .expect(200)
      .expect(/\bdashboard\b/, done)
  })

  // ####Check dashboard week data
  it('GET /admin/dash/responses/week should show total responses this week', function (done) {
    rAgent
      .get('/admin/dash/responses/week')
      .expect(200, done)
  })

  // ####Check dashboard months data
  it('GET /admin/dash/responses/months should show total responses this month', function (done) {
    rAgent
      .get('/admin/dash/responses/months')
      .expect(200, done)
  })

  // ####Check dashboard total data
  it('GET /admin/dash/responses/total should show total responses', function (done) {
    rAgent
      .get('/admin/dash/responses/total')
      .expect(200, done)
  })

  // - - - - - - - - - - - - - - -
  // ###Users

  // ####Check showing users
  it('GET /admin/users should show users', function (done) {
    rAgent
      .get('/admin/users/')
      .expect(/\bEmail\b/, done)
  })

  // ####Check creating new user form
  it('GET /admin/users/new/ should show form', function (done) {
    rAgent
      .get('/admin/users/new/')
      .expect(200)
      .expect(/\bEmail\b/, done)
  })

  var userAdr

  // ####Check creating new user
  it('POST /admin/users/new/ should add new user', function (done) {
    rAgent
      .post('/admin/users/new/')
      .send({
        fullname: 'test',
        email: 'test@test.com',
        organisation: 'Test',
        phoneno: '01792',
        password: 'test'
      })
      .expect(302)
      .end(function (err, res) {
        userAdr = res.header.location
        done()
      })
  })

  // ####Check show user
  it('GET /admin/users/x should show user', function (done) {
    rAgent
      .get(userAdr)
      .expect(200)
      .expect(/\btest\b/, done)
  })

  // ####Check edit user
  it('POST /admin/users/x should edit user', function (done) {
    rAgent
      .post(userAdr)
      .expect(200)
      .expect(/\btest\b/, done)
  })

  // ####Check delete user
  it('DELETE /admin/users/x should delete new user', function (done) {
    rAgent
      .get(userAdr + '/delete')
      .expect(302)
      .expect(/^((?!test).)*$/, done)
  })

  // - - - - - - - - - - - - - - -
  // ###Responses

  // ####Check responses page render
  it('GET /admin/responses should show responses', function (done) {
    rAgent
      .get('/admin/responses/')
      .expect(200)
      .expect(/\bR-kit\b/, done)
  })

  // ####Check responses datatables data
  it('GET /admin/responses-datatables should show responses in datatables format', function (done) {
    rAgent
      .get('/admin/responses-datatables/')
      .expect(200)
      .expect(/\aaData\b/, done)
  })

  // ####Check response page render
  it('GET /admin/responses/x should show response in editable format', function (done) {
    // Find response ID.
    rAgent
      .get('/admin/responses/' + responseId)
      .expect(200, done)
  })

  // ####Check responses edit render
  it('POST /admin/responses/x should show edit response', function (done) {
    // Find response ID.
    rAgent
      .post('/admin/responses/' + responseId)
      .expect(200, done)
  })

  // ####Check responses download specific file
  it('GET /admin/responses/x/download/file/0 should return files', function (done) {
    this.timeout(30000)
    rAgent
      .get('/admin/responses/' + responseIdWithFiles + '/download/file/0')
      // .expect('')//Check it has a filename
      .expect(200, done)
  })

  // ####Check responses download file array
  it('GET /admin/responses/download/files/[] should return files', function (done) {
    this.timeout(30000)
    rAgent
      .get('/admin/responses/download/files/["' + responseIdWithFiles + '"]')
      // .expect('')//Check it has a filename
      .expect(200, done)
  })

  // ####Check responses download csv
  it('GET /admin/responses/download/csv/[] should return csv spreadsheet', function (done) {
    this.timeout(30000)
    rAgent
      .get('/admin/responses/download/csv/["' + responseIdWithFiles + '"]')
      // .expect('')//Check it has a filename
      .expect(200, done)
  })

  // ####Check responses delete
  it('GET /admin/responses/x/delete should delete response', function (done) {
    // Find response ID.
    rAgent
      .get('/admin/responses/' + responseId + '/delete')
      .expect(302, done)
  })

  // ####Check logout
  it('GET /admin should redirect to login when logging out', function (done) {
    rAgent
      .get('/admin/logout')
      .expect(302, done)
  })

  // ####Check session trashed
  it('GET /admin should redirect to login after logging out', function (done) {
    rAgent
      .get('/admin/')
      .expect(302, done)
  })

  var viewAdr

  // ####After cleanup
  after(function () {
    server.close()
  })
})
