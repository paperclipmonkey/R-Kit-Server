var mongoose = require('mongoose')
var fs = require('fs')
var async = require('async')
var common = require('../common')

module.exports = function (app) {

  var users_list = function (req, res, next) {
    // TODO Remove Async
    async.parallel({
      users: function (callback) {
        mongoose.model('user').find({}).skip(0).limit(1000).exec(function (err, docs) {
          callback(err, docs)
        })
      }
    },
      function (err, results) {
        if (err) {
          return next(err)
        }
        res.render('views/admin-users.html', {
          user: req.user,
          users: results.users,
          pageUsers: true
        })
      })
  }

  var users_edit = function (req, res, next) {
    var UserModel = mongoose.model('user')
    // TODO - clean us name checking, use variable
    async.parallel({
      user: function (callback) {
        if (req.method === 'POST') {
          if (req.params.id === 'new') {
            // TODO - ia k variable needed, or is it accessible using 'this'?
            var k = new UserModel(req.body)
            k.save(function (err) {
              if (err) {
                return next(err)
              }
              return res.redirect('/admin/users/' + k._id)
            })
          } else {
            mongoose.model('user').findOne({_id: req.params.id}, function (err, doc) {
              if (err) {
                callback(err, [doc])
              }
              if (typeof req.body.fullname === 'string' && req.body.emailOnResponse === undefined) {
                req.body.emailOnResponse = false
              }
              doc.set(req.body)
              doc.save()
              callback(err, [doc])
            })
          }
        } else if (req.params.id !== 'new') {
          mongoose.model('user').findOne({_id: req.params.id}).exec(function (err, docs) {
            callback(err, [docs])
          })
        } else { // new user - Create model
          callback(null, [new UserModel()])
        }
      }
    },
      function (err, results) {
        if (err) {
          return res.status(404).send(err)
        }
    
        res.render('views/admin-user.html', {
          user: req.user,
          useredit: results.user,
          pageUsers: true
        })
      })
  }

  var users_delete = function (req, res, next) {
    mongoose.model('user').findByIdAndRemove(req.params.id, function (err, docs) {
      if (err) {
        return next(err)
      }
      res.redirect('/admin/users')
    })
  }

  return {
    users_list: users_list,
    users_edit: users_edit,
    users_delete: users_delete,
  }

}
