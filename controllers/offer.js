const CarOffer = require('../models/carOffer');
const { validationResult } = require('express-validator');

module.exports.getCars = async (req, res, next) => {
  try {
    const cars = await CarOffer.find().exec()
    res.status(200).json({
      cars,
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    next(error)
  }
}

module.exports.postCar = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { name, year, length, seats, description } = req.body;
    const newCarOffer = new CarOffer({
      name,
      year,
      length,
      seats,
      description
    });
    const savedData = await newCarOffer.save()
    res.status(201).json({
      message: 'A car added!',
      car: savedData
    })
  } catch (err) {
    const error = new Error(err)
    error.httpStatusCode = 500
    next(error)
  }
}