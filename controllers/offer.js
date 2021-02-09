const CarOffer = require('../models/carOffer');
const { validationResult } = require('express-validator');

module.exports.getCars = async (req, res, next) => {
  try {
    const cars = await CarOffer.find().exec()
    res.status(200).json({
      cars,
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    next(err)
  }
}

module.exports.postCar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Form validation failed!');
    err.httpStatusCode = 422;
    next(err)
  }
  try {
    const { name, year, length, seats, description, images } = req.body;
    console.log(images)
    const newCarOffer = new CarOffer({
      name,
      year,
      length,
      seats,
      description,
    });
    const savedData = await newCarOffer.save()
    res.status(201).json({
      message: 'A car added!',
      car: savedData
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    next(err)
  }
}