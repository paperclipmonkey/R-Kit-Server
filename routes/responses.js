/*
#responses
*/

var mongoose = require('mongoose')
var async = require('async')

module.exports = function (app) {
  /*
  ##New response
  Save uploaded response to the Database
  */
  var create = function (req, res, next) {
    var toInsert = req.body

    toInsert.files = req.uploadedFiles

    var FeedbackModel = mongoose.model('response')
    var instance = new FeedbackModel(toInsert)
    instance.save(function (err) {
      if (err) {
        res.status(400).json(JSON.stringify({'err': err.message}))
        return res.end()
      }

      // common.emailAdmins(instance)

      res.json(instance.toClient()) // JSON
      res.end()
    })
  }

  /*
  ##List
  Render the view for the user
  */
  var admin_list = function (req, res) {
    res.render('views/admin-responses.html', {
      user: req.user,
      pageResponses: true
    })
  }

  /*
  ##List (Data)
  List the responses in a JSON format edible by the frontend
  */
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
        snd.push([cur._id, cur.ts, cur.data, cur.files])
      }
      res.json({'aaData': snd})
    }

    mongoose.model('response').find({}, cback)
  }

  /*
  ##Delete
  Remove a response from the database.
  Doesn't remove uploaded files as well
  */
  var remove = function (req, res, next) {
    mongoose.model('response').findByIdAndRemove(req.params.id, function (err, doc) {
      if (err) return next(err)
      res.redirect('/admin/responses')
    })
  }

  /*
  ##Update
  Update a response in the database
  */
  var update = function (req, res, next) {
    // TODO - remove async
    async.parallel({
      response: function (callback) {
        if (req.method === 'POST') {
          mongoose.model('response').findOneAndUpdate({_id: req.params.id}, req.body, function (err, doc) {
            callback(err, doc)
          })
        } else {
          mongoose.model('response').findOne({_id: req.params.id}).exec(function (err, docs) {
            callback(err, docs)
          })
        }
      }
    },
      function (err, results) {
        if (err) {
          return next(err)
        }
        try {
          results.response.data = JSON.parse(results.response.data)
        } catch(e) {}
        res.render('views/admin-response.html', {
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
