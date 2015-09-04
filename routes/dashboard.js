var mongoose = require('mongoose')
var common = require('../common')

require('date-utils')

module.exports = function (app) {
  var dashboard = function (req, res) {
    res.render('views/admin-dashboard.html', {
      user: req.user,
      pageDashboard: true
    })
  }

  var dashboard_rating_average = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Rating Average Error', err))
      }
      var total = 0
      for (var i = results.length - 1; i >= 0; i--) {
        var cur = results[i]
        total += cur.rating
      }
      var average = Math.round((total / results.length) * 10) / 10
      average = average ? average : 0
      res.json({'result': average})
    }

    mongoose.model('response').find({}, cback)
  }

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
      // Add in the additional months and data
      for (i = 0; i <= 12; i++) {
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

  var dashboard_rating_by_month = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Rating by month Error', err))
      }
      var altFormat = {}
      for (var i = results.length - 1; i >= 0; i--) {
        altFormat[results[i]._id.month] = {
          value: results[i].monthlyusage[0].average
        }
      }

      var monthsAgo = new Date()
      // Add in the additional months and data
      for (i = 0; i <= 12; i++) {
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
            _id: {year: {$year: '$ts'}, month: {$month: '$ts'}},
            average: {$avg: '$rating'}
          }
        },
        {
          $group: {
            _id: {month: '$_id.month'}, // year: "$_id.year",
            monthlyusage: {$push: {month: '$_id.month', average: '$average'}}
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

  var dashboard_responses_total = function (req, res, next) {
    var cback = function (err, results) {
      if (err) {
        return next(new Error('Dashboard Views Total Error', err))
      }
      res.json({'result': results})
    }
    mongoose.model('response').count({}, cback)
  }

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
    dashboard_rating_average: dashboard_rating_average,
    dashboard_responses_by_month: dashboard_responses_by_month,
    dashboard_responses_total: dashboard_responses_total,
    dashboard_responses_week: dashboard_responses_week
  }

}
