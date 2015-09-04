var s3Client = require('./s3-client')

function saveToS3 (localUrl, filename) {
  var params = {
    localFile: localUrl,

    s3Params: {
      Bucket: process.env.S3_BUCKET,
      Key: 'uploads/' + filename
    // other options supported by putObject, except Body and ContentLength.
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    }
  }
  var uploader = s3Client.uploadFile(params)
  uploader.on('error', function (err) {
    console.error('unable to upload to S3:', err.stack)
  })
  uploader.on('progress', function () {
    // console.log("progress", uploader.progressMd5Amount,
    //           uploader.progressAmount, uploader.progressTotal)
  })
  uploader.on('end', function () {
    // console.log("done uploading to S3")
  })
}

module.exports = {
  saveToS3: saveToS3
}
