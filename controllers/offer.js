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

module.exports.getCarById = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const car = await CarOffer.findById(carId).exec()
    if (!car) {
      const err = new Error('No resources available');
      err.httpStatusCode = 404;
      throw err
    }
    res.status(200).json({
      car,
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
    return next(err)
  }
  if (req.multerError) {
    const err = new Error('File size / format validation failed!');
    err.httpStatusCode = 422;
    return next(err)
  }
  try {
    const { name, year, length, seats, description } = req.body;
    const imagesUrls = req.files.map(file => `/${file.path.replace("\\" ,"/")}`);

    const newCarOffer = new CarOffer({
      name,
      year,
      length,
      seats,
      description,
      imagesUrls,
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