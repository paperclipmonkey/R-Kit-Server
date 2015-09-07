var mongoose = require('mongoose')
var fs = require('fs')
var async = require('async')
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

function saveUploadedFiles (req, res, next) {
  function processQueue(passed, callback){
    common.saveToS3(passed.file.path, passed.fileName, callback)
  }
  if (req.files) {
    var pushed = []
    req.uploadedFiles = []
    var folderName = randomUUID()
    for(x in req.files){
      var file = req.files[x]
      var fileName = folderName + '/' + file.originalFilename//Retain original
      req.uploadedFiles.push(fileName)
      pushed.push({
        file: file,
        fileName: fileName
      })
    }
    async.map(pushed, processQueue.bind(processQueue),
      function(err, result){
        if(err){
          return next(err)
        }
        next()
      }
    )
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
  saveUploadedFiles: saveUploadedFiles,
  ensureAuthenticated: ensureAuthenticated,
  check_nonce: check_nonce
}
