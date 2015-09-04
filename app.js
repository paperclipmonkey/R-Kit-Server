module.exports = (function () {
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
  var CONFIG = require('config').app
  var middleware = require('./routes/middleware')

  var routes = {
    authenticate: require('./routes/authenticate')(app),
    dashboard: require('./routes/dashboard')(app),
    download: require('./routes/download')(app),
    users: require('./routes/users')(app),
    responses: require('./routes/responses')(app)
  }

  var mongoUrl = process.env.MONGOLAB_URI || CONFIG['mongourl']
  console.log('Using database ' + mongoUrl)

  mongoose.connect(mongoUrl)

  var app = express()

  app.enable('trust proxy')

  app.use(methodOverride())
  app.use(bodyParser({
    limit: '100mb'
  }))
  app.use(cookieParser())
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

  function renderSelect (arr, val) {
    var ret = ''
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === val) {
        ret += "<option selected='selected'>" + arr[i] + '</option>'
      } else {
        ret += '<option>' + arr[i] + '</option>'
      }
    }
    return ret
  }

  app.get('/admin', middleware.ensureAuthenticated, routes.dashboard.dashboard)
  app.get('/admin/dash/rating/average', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_average)
  app.get('/admin/dash/rating/months', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_by_month)
  app.get('/admin/dash/views/week', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_week)
  app.get('/admin/dash/views/months', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_by_month)
  app.get('/admin/dash/views/total', middleware.ensureAuthenticated, routes.dashboard.dashboard_views_total)
  app.get('/admin/dash/views/words', middleware.ensureAuthenticated, routes.dashboard.dashboard_words)
  app.get('/admin/dash/views/latest', middleware.ensureAuthenticated, routes.dashboard.dashboard_rating_average)

  app.get('/admin/responses', middleware.ensureAuthenticated, routes.responses.admin_list)
  app.get('/admin/responses-datatables', middleware.ensureAuthenticated, routes.responses.datatables)

  app.get('/admin/responses/download/csv/:ids', middleware.ensureAuthenticated, routes.download.views_download_csv)
  app.get('/admin/responses/download/kmz/:ids', middleware.ensureAuthenticated, routes.download.views_download_kmz)
  app.get('/admin/responses/download/images/:ids', middleware.ensureAuthenticated, routes.download.views_download_images)
  app.get('/admin/responses/:id/download/kmz', middleware.ensureAuthenticated, routes.download.view_download_kmz)
  app.get('/admin/responses/:id/download/image', middleware.ensureAuthenticated, routes.download.view_download_image)

  app.get('/admin/responses/:id', middleware.ensureAuthenticated, routes.responses.update)
  app.get('/admin/responses/:id/delete', middleware.ensureIsSuper, routes.responses.remove)
  app.post('/admin/responses/:id', middleware.ensureAuthenticated, routes.responses.update)

  app.get('/admin/users', middleware.ensureIsSuper, routes.users.users_list)
  app.get('/admin/users/:id', middleware.ensureAuthenticated, routes.users.users_edit)
  app.post('/admin/users/:id', middleware.ensureAuthenticated, multipart, routes.users.users_edit)
  app.get('/admin/users/:id/delete', middleware.ensureAuthenticated, routes.users.users_delete)

  app.post('/response', middleware.check_nonce, multipart, middleware.saveUploadedFile, routes.responses.create)

  app.get('/admin/login', routes.authenticate.login)
  app.get('/admin/logout', routes.authenticate.logout)

  app.post('/admin/login',
    pass.authenticate(
      'local', {
        failureRedirect: '/admin/login',
        failureFlash: true
      }),
    function (req, res) {
      app.emit('user.login')
      res.redirect('/admin/') // Authentication successful. Redirect home.
    }
  )

  // Error handling
  app.use(function (err, req, res, next) {
    if (!err) return next()
    if (!res.headersSent) {
      res.sendStatus(400)
    }
  })

  return app
})()
