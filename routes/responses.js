var mongoose = require('mongoose')
var escape = require('escape-html')
var common = require('../common')
var async = require('async')

module.exports = function (app) {
  var create = function (req, res, next) {
    var toInsert = req.body
    toInsert.comments = escape(toInsert.comments)

    toInsert.loc = {
      type: 'Point',
      coordinates: [
        parseFloat(req.body.lng),
        parseFloat(req.body.lat)
      ]
    }
    delete toInsert.lat
    delete toInsert.lng

    if (!req.uploadedFileName) {
      res.writeHead(400, {'Content-Type': 'application/json'})
      res.write(JSON.stringify({'err': 'No photo attached!'}))
      res.end()
      return
    }

    toInsert.photo = req.uploadedFileName

    var FeedbackModel = mongoose.model('feedback')
    var instance = new FeedbackModel(toInsert)
    instance.save(function (err) {
      if (err) {
        res.status(400).json(JSON.stringify({'err': err.message}))
        return res.end()
      }

      common.emailAdmins(instance)
      // Publish event to the system
      // req.app.emit('response:create', {response: instance})

      res.json(instance.toClient()) // JSON
      res.end()
    })
  }

  var admin_list = function (req, res) {
    res.render('views/admin-responses.html', {
      user: req.user,
      pageResponses: true
    })
  }

  var datatables = function (req, res, next) {
    // TODO Grab all areas associated with the user
    // TODO - Use new function to get all geo polygons
    var cback = function (err, results) {
      if (err) {
        return next(err)
      }
      var snd = []
      for (var i = results.length - 1; i >= 0; i--) {
        var cur = results[i]
        snd.push([cur._id, cur.loc, cur.ts, cur.words, cur.rating, cur.photo])
      }
      res.json({'aaData': snd})
    }

    if (req.user.isSuper) {
      mongoose.model('feedback').find({}, cback)
    } else {
      common.getQueryLocations(req.user.areas, function (err, locQ) {
        if (err) {
          cback(err)
          return
        }
        mongoose.model('feedback').find({loc: locQ}, cback)
      })
    }
  }

  var remove = function (req, res, next) {
    mongoose.model('feedback').findByIdAndRemove(req.params.id, function (err, doc) {
      if (err) return next(err)
      req.app.emit('response:delete', {response: doc})
      res.redirect('/admin/responses')
    })
  }

  var update = function (req, res, next) {
    // TODO - remove async
    async.parallel({
      response: function (callback) {
        if (req.method === 'POST') {
          if (req.body.display === undefined && req.body.loc === undefined) { // If we do a location update we also don't update this
            req.body.display = false
          }
          if (req.body.loc) {
            req.body.loc = {'coordinates': JSON.parse(req.body.loc), 'type': 'Point'}
          }
          if (req.body.words !== undefined) {
            // TODO - Make in to an Array
          }
          mongoose.model('feedback').findOneAndUpdate({_id: req.params.id}, req.body, function (err, doc) {
            callback(err, doc)
            req.app.emit('response:update', {response: doc})
          })
        } else {
          mongoose.model('feedback').findOne({_id: req.params.id}).exec(function (err, docs) {
            callback(err, docs)
          })
        }
      }
    },
      function (err, results) {
        if (err) {
          return next(err)
        }
        res.render('responses/admin-response.html', {
          user: req.user,
          static_url: process.env.S3_URL,
          responseedit: results.response,
          pageResponses: true
        })
      })
  }

  return {
    create: create,
    admin_list: admin_list,
    datatables: datatables,
    remove: remove,
    update: update
  }
}
