const mongoose = require('mongoose')
const { Schema } = mongoose;

const carOfferSchema = new Schema({
  name: String,
  year: Number,
  seats: Number,
  length: Number,
  description: String,
  updated: {
    requred: true,
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('caroffer', carOfferSchema) 