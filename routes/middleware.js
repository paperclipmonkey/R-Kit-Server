var mongoose = require('mongoose')
var fs = require('fs')
var common = require('../common')

// Sanitise inputs for non admins - This stops them from upgrading their own settings
function sanitiseInput (req) {
  if (req.body.isSuper) {
    req.body.isSuper = false
  }
}

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

  if (req.body && req.body.photo) {
    var base64Data = req.body.photo
    var dataBuffer = new Buffer(base64Data, 'base64')
    require('fs').writeFile(localUrl, dataBuffer, function (err) {
      if (err) {
        console.error('Error writing B64 to file')
        return next(err)
      }
      req.uploadedFileName = filename
      common.saveToS3(localUrl, filename)
      return next()
    })
  } else if (req.files && req.files.image && req.files.image.name) {
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

function ensureIsSuper (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isSuper) {
      return next()
    }
    return res.redirect('back')
  }
  return res.redirect('/admin/login')
}

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isSuper) { // If super admin allow access
      return next()
    }

    sanitiseInput(req) // Sanitise inputs for non-admins

    var ids // Id(s) of accessed item(s)
    if (req.params.id) {
      ids = [req.params.id]
      if (ids[0] === req.user._id.toString()) { // Own profile
        return next()
      }
    } else {
      try {
        ids = JSON.parse(req.params.ids)
      } catch(e) {}
    }
    if (!ids) {
      return next()
    }

    for (var i = 0; i < req.user.areas.length; i++) {
      for (var x = 0; x < ids.length; x++) {
        if (ids[x] === req.user.areas[i].toString()) { // Own area
          return next()
        }
      }
    }

    // Grab areas
    // See if view is within areas
    mongoose.model('area').find({_id: {$in: req.user.areas}}, function (err, areas) { // List of areas
      if (err) {
        return res.redirect('back')
      }

      if (!areas.length) {
        return res.redirect('back')
      }

      // For each area find ID that is within area
      for (var i = 0; i < areas.length; i++) {
        mongoose.model('feedback').find(
          {
            'loc': { '$geoWithin': { '$geometry': areas[i].loc.toObject()
              }
            },
            _id: {$in: ids}
          },
          function (err, docs) {
            if (err) {
              next(err)
            }
            if (docs.length === ids.length) {
              return next()
            }
          }
        )
      }
    })
  } else {
    return res.redirect('/admin/login')
  }
}

var check_nonce = function (req, res, next) {
  // Ensure we have a new view - check NONCE from App
  if (req.body.nonce) {
    // Do lookup in DB for nonce. Does it exist already?
    mongoose.model('feedback').find({nonce: req.body.nonce}, function (err, views) {
      if (err) {
        return res.json(500, err)
      }
      if (views.length < 1) {
        return next()
      } else {
        res.json(views[0].toClient()) // JSON
        return res.end()
      }
    })
  } else {
    next()
  }
}

module.exports = {
  saveUploadedFile: saveUploadedFile,
  ensureIsSuper: ensureIsSuper,
  ensureAuthenticated: ensureAuthenticated,
  check_nonce: check_nonce
}
