module.exports = (function (app) {
  var s3 = require('s3')

  var client = s3.createClient({
    maxAsyncS3: 20, // this is the default
    s3RetryCount: 5, // this is the default
    s3RetryDelay: 1000, // this is the default
    // multipartUploadThreshold: 20971520, // this is the default (20 MB)
    // multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
      accessKeyId: 'AKIAIQCOD2VSJIYGIUAA',
      secretAccessKey: '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',
      region: 'eu-west-1'
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    }
  })
  return client
})()
