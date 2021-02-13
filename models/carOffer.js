const mongoose = require('mongoose')
const { Schema } = mongoose;

const carOfferSchema = new Schema({
  name: String,
  year: Number,
  seats: Number,
  length: Number,
  description: String,
  imagesUrls: [],
  owner: {
    type: Object,
  },
}, { timestamps: true })

module.exports = mongoose.model('caroffer', carOfferSchema) 