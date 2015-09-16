/*
# User model
Used to store an admin user model for use logging in and out of the admin panel
*/

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var crypto = require('crypto')
var emailRegex = /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i

/*
## The model

The fields created are:

  * **email** - Login email address for the user

  * **password** - SHA1 encrypted password

  * **salt** - Salt appended to the PW before encrypting

  * **fullname** - The full name of the user

  * **phoneno** - The phone number of the user

  * **emailOnResponse** - Email the user when a new response is received

  * **lastLogin** - A timestamp of when the user last visited an admin page

*/
module.exports = (function (app) {
  var UserSchema = new Schema({
    email: {type: String, required: true, unique: true, match: emailRegex},
    password: {type: String, required: true},
    salt: {type: String},
    fullname: {type: String},
    phoneno: {type: String},
    emailOnResponse: {type: Boolean, default: false, required: true},
    lastLogin: {type: Date, required: true, default: Date.now}
  })

  /*
  ## Before save
  Check if the password has changed.
  */
  UserSchema.pre('save', function (next) {
    var user = this
    if (!user.salt) {
      user.salt = user.email // Set it up as email on first usage
    }

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
      return next()
    }

    // Hash the Password
    var shasum = crypto.createHash('sha1')
    shasum.update(user.salt + '>><<' + user.password) // Email + >><< + pw = salting
    user.password = shasum.digest('hex')
    next()
  })
  return mongoose.model('user', UserSchema)
})()
