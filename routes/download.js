var mongoose = require('mongoose')
var fs = require('fs')
var archiver = require('archiver')
var json2csv = require('json2csv')
var request = require('request')
var s3Client = require('../s3-client')

module.exports = function (app) {
  /*
  ##Downloads a file from the S3 Data service
  Responds with a byte stream
  Works with an evented system based on top of the Node.js Stream API
  */
  function downloadFromS3 (filename) {
    var s3Params = {
        Bucket: process.env.S3_BUCKET,
        Key: filename
        //Key: 'example.jpg'
        // other options supported by putObject, except Body and ContentLength.
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    }
    var downloader = s3Client.downloadStream(s3Params)
    downloader.on('error', function (err) {
      console.error('unable to download from S3:', err.stack)
    })
    downloader.on('progress', function () {
      //console.log("progress", downloader.progressMd5Amount,
      //downloader.progressAmount, downloader.progressTotal)
    })
    downloader.on('end', function () {
      //console.log("done downloading from S3")
    })
    return downloader;
  }


  /*
  ##Responses downloaded as a CSV file
  Without any file attachments
  */
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
        json2csv({data: cDocs, fields: ['id', 'ts', 'data', 'files']}, function (csv) {
          var filename = 'R-Kit.csv'
          res.attachment(filename)
          res.end(csv)
        })
      } catch (err) {
        next(err)
      }
    })
  }

  /*
  ##Download all documents for a given set of IDs
  Responds with a zip file
  */
  function download_docs (ids, done, res) {
    mongoose.model('response').find({_id: {$in: ids}}, function (err, docs) {
      if (err) {
        // next(err)
        console.log(new Error('Could not find docs'))
      }
      done(docs, res)
    })
  }

  /*
  ##Add files to a zip file
  Returns new zip file.
  */
  function add_files (docs, zip) {
    var i = 0
    var f = 0
    while (i < docs.length) {
      while (f < docs[i].files.length) {
        try {
          zip.append(downloadFromS3('uploads/' + docs[i].file[f]), {name: docs[i].photo})
        } catch(err) {
          console.log(err)
        }
        f++
      }
      i++
    }
    return zip
  }

  /*
  ##Download responses as a zip file
  Downloads files from S3 and zips them up
  Returns file over HTTP
  */
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

  /*
  ##Download single file from S3
  Responds with file
  */
  var response_download_file = function (req, res, next) {
    mongoose.model('response').findOne({_id: req.params.id}).exec(function (err, doc) {
      if (err) {
        console.log(err)
        return next(err)
      }
      //is file ID in there?
      if(doc.files[req.params.file]){
        res.setHeader('Content-Disposition', 'attachment; filename=' + doc.files[req.params.file])
        downloadFromS3('uploads/' + doc.files[req.params.file]).pipe(res)
      } else {
        return next(new Error('file doesn\'t exist'))
      }
    })
  }

  return {
    response_download_file: response_download_file,
    download_docs: download_docs,
    responses_download_csv: responses_download_csv,
    responses_download_files: responses_download_files,
  }
}
