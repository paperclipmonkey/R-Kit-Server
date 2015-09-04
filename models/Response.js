var mongoose = require('mongoose')
var Schema = mongoose.Schema
require('datejs')

module.exports = (function (app) {
  var ResponseSchema = new Schema({
    nonce: {type: String},
    data: {type: Object, 'default': {}},
    files: {
      type: [],
      required: false
    },
    ts: {type: Date, 'default': Date.now},
  })

  ResponseSchema.method('toClient', function () {
    var obj = this.toObject()
    obj.ts = Date.parse(obj.ts).toString('dd-MM-yyyy')
    obj.time = Date.parse(this.ts).toString('hh:mm')

    obj.id = obj._id
    delete obj._id
    return obj
  })

  ResponseSchema.method('toCsv', function () {
    var obj = this.toClient()
    // Rename fields
    return obj
  })
  return mongoose.model('response', ResponseSchema)
})()
