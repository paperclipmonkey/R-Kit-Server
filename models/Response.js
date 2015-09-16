/*
#Response model
Model file for a response from a research participant

Saves their response as a JSON object in the MongoDB database
*/

var mongoose = require('mongoose')
var Schema = mongoose.Schema
require('datejs') // Global changes to the Date object. Messy...

/*
## The model
The model is extended from Mongoose.js, an ORM for MongoDB

The fields created are:

  * **Nonce** - Unique one-time upload key - Created on the client

  * **Data** - JS(ON) object encoding the data sent

  * **Files** - array of file names as they've been uploaded to S3 or other

  * **Ts** - A timestamp of when it was received
*/
module.exports = (function (app) {
  var ResponseSchema = new Schema({
    nonce: {type: String},
    data: {type: Object, 'default': {}},
    files: {
      type: [],
      required: false
    },
    ts: {type: Date, 'default': Date.now}
  })

  /*
  ### To client
  Converts the object to a client friendly format
  */
  ResponseSchema.method('toClient', function () {
    var obj = this.toObject()
    obj.ts = Date.parse(obj.ts).toString('dd-MM-yyyy')
    obj.time = Date.parse(this.ts).toString('hh:mm')

    obj.id = obj._id
    delete obj._id
    return obj
  })

  /*
  ### To Csv
  Converts the object to a csv friendly format
  */
  ResponseSchema.method('toCsv', function () {
    var obj = this.toClient()
    return obj
  })
  return mongoose.model('response', ResponseSchema)
})()
