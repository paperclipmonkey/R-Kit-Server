/*
#Authenticate
Login / Logout commands
Works closely with the passport module
*/

module.exports = function () {
  var login = function (req, res) {
    res.render('views/login.html', {
      locals: {
        user: req.session.user
      }
    })
  }

  var logout = function (req, res) {
    req.session = null
    res.redirect('/admin/login')
  }
  return {
    login: login,
    logout: logout
  }
}
