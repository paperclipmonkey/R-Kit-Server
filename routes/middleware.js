var mongoose = require('mongoose')
var fs = require('fs')
var common = require('../common')

function randomUUID () {
  var s = []
  var itoh = '0123456789ABCDEF'
  var i

  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10)

  // Conform to RFC-4122, section 4.4
  s[14] = 4 // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8 // Specify 2 high bits of clock sequence

  // Convert to hex chars
  for (i = 0; i < 36; i++) {
    s[i] = itoh[s[i]]
  }

  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}

function saveUploadedFile (req, res, next) {
  var filename = randomUUID() + '.jpg'
  var localUrl = __dirname + '/../tmp/' + filename
  
  if (req.files && req.files.image && req.files.image.name) {
    if (
      req.files.image.name.split('.')[req.files.image.name.split('.').length - 1] === 'jpg' ||
      req.files.image.name.split('.')[req.files.image.name.split('.').length - 1] === 'jpeg'
    ) {
      fs.rename(req.files.image.path, localUrl, function (err) {
        if (err) {
          console.error('Problem renaming uploaded file')
          return next(err)
        }
        req.uploadedFileName = filename
        common.saveToS3(localUrl, filename)
        return next()
      })
    }
  } else {
    next()
  }
}

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
      return next()
  } else {
    return res.redirect('/admin/login')
  }
}

var check_nonce = function (req, res, next) {
  // Ensure we have a new view - check NONCE from App
  if (req.body.nonce) {
    // Do lookup in DB for nonce. Does it exist already?
    mongoose.model('response').find({nonce: req.body.nonce}, function (err, responses) {
      if (err) {
        return res.json(500, err)
      }
      if (responses.length < 1) {
        return next()
      } else {
        res.json(responses[0].toClient()) // JSON
        return res.end()
      }
    })
  } else {
    next()
  }
}

module.exports = {
  saveUploadedFile: saveUploadedFile,
  ensureAuthenticated: ensureAuthenticated,
  check_nonce: check_nonce
}
