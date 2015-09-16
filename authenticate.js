/*
#Authenticate
###Provides authentication functions to the application
*/

module.exports = (function () {
  var passport = require('passport') // Authentication
  var mongoose = require('mongoose')
  var fs = require('fs')
  var crypto = require('crypto')
  var LocalStrategy = require('passport-local').Strategy

  var modelFiles = fs.readdirSync(__dirname + '/models/')
  modelFiles.forEach(function (file) {
    require(__dirname + '/models/' + file)
  })

  var userModel = mongoose.model('user')

  // Passport is the node module used to provide functionality for this
  // Local strategy means authenticate locally
  // Also possible to authenticate remotely using Google or Github for example
  passport.use(new LocalStrategy(
    function (email, password, done) {
      var shasum = crypto.createHash('sha1') 
      // Encryption of user's PW is done using SHA1 algorithm
      
      // Find user object to grab salt
      userModel.findOne({email: email}, function (err, user1) {
        if (err) {
          return done() // done(err)
        }
        if (!user1) {
          return done() // done(new Error("Not found"))
        }
        shasum.update(user1.salt + '>><<' + password) // Salt + >><< + pw = salting
        var toQuery = {
          'email': email,
          'password': shasum.digest('hex')
        }
        userModel.findOne(toQuery, function (err, user2) {
          if (user2) {
            user2.lastLogin = new Date() // Update last logged in time
            user2.save()
          }
          done(err, user2)
        })
      })
    }
  ))

  // Serialise user id ready to save to session
  passport.serializeUser(function (user, done) {
    done(null, user['_id'])
  })

  // Deserialise user based on just their user id
  passport.deserializeUser(function (id, done) {
    userModel.findOne({'_id': id}, function (err, user) {
      done(err, user)
    })
  })

  return passport
})()
