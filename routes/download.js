var mongoose = require('mongoose')
var fs = require('fs')
var archiver = require('archiver')
var json2csv = require('json2csv')
var request = require('request')

module.exports = function (app) {
  var responses_download_csv = function (req, res, next) {
    var ids = req.params.ids
    ids = JSON.parse(ids)
    download_docs(ids, function (docs) {
      try {
        if (docs.length === 0) {
          return next(new Error('Empty result'))
        }
        var cDocs = []
        for (var doc in docs) {
          cDocs.push(docs[doc].toCsv())
        }
        json2csv({data: cDocs, fields: ['photo', 'comments', 'age', 'heading', 'knowarea', 'words', 'date', 'time', 'lat', 'lng', 'rating']}, function (csv) {
          var filename = 'RateMyView.csv'
          res.attachment(filename)
          res.end(csv)
        })
      } catch (err) {
        next(err)
      }
    })
  }

  function download_docs (ids, fun, res) {
    mongoose.model('feedback').find({_id: {$in: ids}}, function (err, docs) {
      if (err) {
        // next(err)
        console.log(new Error('Could not find docs'))
      }
      fun(docs, res)
    })
  }

  function add_files (docs, zip) {
    var i = 0
    while (i < docs.length) {
      try {
        zip.append(request('http://static.ratemyview.co.uk/uploads/' + docs[i].photo), {name: docs[i].photo})
      } catch(err) {
        console.log(err)
      }
      i++
    }
    return zip
  }

  var responses_download_files = function (req, res) {
    var ids = req.params.ids
    ids = JSON.parse(ids)
    download_docs(ids, function (docs) {
      var zip = archiver.create('zip')
      res.attachment('files.zip')
      zip.pipe(res)
      zip.addListener('fail', function (err) {
        console.log(err)
      })

      add_files(docs, zip)
      zip.finalize()
    })
  }

  var response_download_files = function (req, res) {
    mongoose.model('feedback').findOne({_id: req.params.id}).exec(function (err, doc) {
      if (err) {
        return res.send(500)
      }
      res.setHeader('Content-Disposition', 'attachment; filename=' + doc.photo)
      request('http://static.ratemyview.co.uk/uploads/' + doc.photo).pipe(res)
    })
  }

  return {
    response_download_files: response_download_files,
    download_docs: download_docs,
    responses_download_csv: responses_download_csv,
    responses_download_files: responses_download_files,
  }
}
