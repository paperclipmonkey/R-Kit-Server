/*
#App
###Wire the application together
*/

module.exports = (function () {
  // Inlclude necessary packages
  var mongoose = require('mongoose')
  var express = require('express')
  var fs = require('fs')
  var bodyParser = require('body-parser')
  var multipart = require('connect-multiparty')()
  var cookieParser = require('cookie-parser')
  var session = require('cookie-session')
  var methodOverride = require('method-override')
  var errorHandler = require('errorhandler')
  var pass = require('./authenticate')
  var hbs = require('hbs')
  var middleware = require('./routes/middleware')

  // Include route files
  var routes = {
    authenticate: require('./routes/authenticate')(app),
    dashboard: require('./routes/dashboard')(app),
    download: require('./routes/download')(app),
    users: require('./routes/users')(app),
    responses: require('./routes/responses')(app)
  }

  console.log('Using database ' + process.env.MONGO_URI)

  // Connect to the Database
  mongoose.connect(process.env.MONGO_URI)

  var app = express()

  // Trust proxies. Useful when running on a platform like Heroku
  app.enable('trust proxy')

  // Limiting size of upload to 100mb for speed and memory issues. Feel free to increase this
  app.use(methodOverride())
  app.use(bodyParser({
    limit: '100mb'
  }))
  app.use(cookieParser())

  // Remember to change the session keys for your implementation
  app.use(session({
    keys: ['SomethingHereForSession', 'SomethingElseHereForSession']
  }))
  app.use(pass.initialize())
  app.use(pass.session())
  app.use(express['static'](__dirname + '/public'))
  app.set('view engine', 'html')
  app.engine('html', require('hbs').__express)
  app.set('views', __dirname)
  app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
  }))

  //Partials are reusable page elements
  hbs.registerPartial('head', fs.readFileSync(__dirname + '/views/partials/head.html', 'utf8'))
  hbs.registerPartial('menuside', fs.readFileSync(__dirname + '/views/partials/menuside.html', 'utf8'))
  hbs.registerPartial('script', fs.readFileSync(__dirname + '/views/partials/script.html', 'utf8'))

  hbs.registerHelper('toJSON', function (obj) {
    return JSON.stringify(obj)
  })

  hbs.registerHelper('versionNo', function () {
    var packageJSON = require('./package.json')
    return packageJSON.version
  })

  // ### Wire up the urls to middleware and routes
  // Dashboard routes
  app.get('/admin', middleware.ensureAuthenticated, routes.dashboard.dashboard)
  app.get('/admin/dash/responses/week', middleware.ensureAuthenticated, routes.dashboard.dashboard_responses_week)
  app.get('/admin/dash/responses/months', middleware.ensureAuthenticated, routes.dashboard.dashboard_responses_by_month)
  app.get('/admin/dash/responses/total', middleware.ensureAuthenticated, routes.dashboard.dashboard_responses_total)

  // Download routes
  app.get('/admin/responses/download/csv/:ids', middleware.ensureAuthenticated, routes.download.responses_download_csv)
  app.get('/admin/responses/download/files/:ids', middleware.ensureAuthenticated, routes.download.responses_download_files)
  app.get('/admin/responses/:id/download/file/:file', middleware.ensureAuthenticated, routes.download.response_download_file)

  // Response admin pages
  app.get('/admin/responses', middleware.ensureAuthenticated, routes.responses.admin_list)
  app.get('/admin/responses-datatables', middleware.ensureAuthenticated, routes.responses.datatables)
  app.get('/admin/responses/:id', middleware.ensureAuthenticated, routes.responses.update)
  app.get('/admin/responses/:id/delete', routes.responses.remove)
  app.post('/admin/responses/:id', middleware.ensureAuthenticated, routes.responses.update)

  // User admin pages
  app.get('/admin/users', routes.users.users_list)
  app.get('/admin/users/:id', middleware.ensureAuthenticated, routes.users.users_edit)
  app.post('/admin/users/:id', middleware.ensureAuthenticated, multipart, routes.users.users_edit)
  app.get('/admin/users/:id/delete', middleware.ensureAuthenticated, routes.users.users_delete)

  app.post('/response', middleware.check_nonce, multipart, middleware.saveUploadedFiles, routes.responses.create)

  app.get('/admin/login', routes.authenticate.login)
  app.get('/admin/logout', routes.authenticate.logout)

  app.post('/admin/login',
    pass.authenticate(
      'local', {
        failureRedirect: '/admin/login',
        failureFlash: true
      }),
    function (req, res) {
      res.redirect('/admin/') // Authentication successful. Redirect home.
    }
  )

  // Error handling
  app.use(function (err, req, res, next) {
    //console.log(err)
    if (!err) return next()
    if (!res.headersSent) {
      res.sendStatus(400)
    }
  })

  return app
})()
