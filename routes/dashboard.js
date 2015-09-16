/*
#Dashboard
Functions and endpoints used on the dashboard page
*/

var mongoose = require('mongoose')
var common = require('../common')

require('date-utils')

module.exports = function (app) {
  /*
  ##Renders the dashboard page
  */
  var dashboard = function (req, res) {
    res.render('views/admin-dashboard.html', {
      user: req.user,
      pageDashboard: true
    })
  }

  /*
  ##Responses by month
  Responds in JSON with number per month.
  */
  var dashboard_responses_by_month = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Views by Month Error', err))
      }
      /* Format we want to send data in
      	{
          result: [
            {
              "month": "Jan",
              value: 5
            }
          ]
        }
      */
      var altFormat = {}
      for (var i = results.length - 1; i >= 0; i--) {
        altFormat[results[i]._id] = {
          value: results[i].usage[0].count
        }
      }

      var monthsAgo = new Date()
      for (i = 0; i <= 12; i++) { // Add in the additional months and data
        var name = monthsAgo.getMonth() + 1 + ''

        if (!altFormat[name]) {
          altFormat[name] = {value: 0}
        }

        altFormat[name].name = monthsAgo.getMonthAbbr() // Append to object date name
        monthsAgo.setMonth(monthsAgo.getMonth() - 1)
      }

      res.json({'result': altFormat})
    }

    var doQuery = function (filter) {
      mongoose.model('response').aggregate(
        filter,
        {
          $group: {
            _id: {month: {$month: '$ts'}},
            count: {$sum: 1}
          }
        },
        {
          $group: {
            _id: '$_id.month',
            usage: {$push: {count: '$count'}}
          }
        },
        cback
      )
    }

    var monthsAgo = new Date()
    monthsAgo.setMonth(monthsAgo.getMonth() - 12)
    var filterQ = {
      $match: {
        'ts': {'$gte': monthsAgo}
      }
    }

    doQuery(filterQ)
  }

  /*
  ##Responses total count
  Responds with an integer
  */
  var dashboard_responses_total = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Dashboard Views Total Error', err))
      }
      res.json({'result': results})
    }
    mongoose.model('response').count({}, cback)
  }

  /*
  ##Responses in the last week
  Responds with an integer
  */
  var dashboard_responses_week = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Dashboard Views Week Error', err))
      }
      res.json({'result': results})
    }

    var weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    mongoose.model('response').count({'ts': {'$gte': weekAgo}}, cback)    
  }

  return {
    dashboard: dashboard,
    dashboard_responses_by_month: dashboard_responses_by_month,
    dashboard_responses_total: dashboard_responses_total,
    dashboard_responses_week: dashboard_responses_week
  }

}
