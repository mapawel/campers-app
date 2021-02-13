const path = require('path');
const fs = require('fs');
const CarOffer = require('../models/carOffer');
const { validationResult } = require('express-validator');

module.exports.getCars = async (req, res, next) => {
  const pageItems = 5;
  const { page } = req.query;
  try {
    const itemsQty = await CarOffer.countDocuments().exec()
    let toSkip = itemsQty - (pageItems * page)
    if (toSkip < 0) toSkip = 0
    let toLimit = pageItems
    if (itemsQty % pageItems && toSkip === 0) toLimit = itemsQty % pageItems
    console.log(toLimit)
    const cars = await CarOffer
      .find()
      .skip(toSkip)
      .limit(toLimit)
      .exec()
    res.status(200).json({
      carsRes: {
        cars,
        carsQty: itemsQty
      },
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

module.exports.updateCarById = async (req, res, next) => {
  let imagesUrls = []
  const errors = validationResult(req);
  const { carId } = req.params;
  const { name, year, length, seats, description } = req.body;
  let { currendImagesUrls } = req.body;
  currendImagesUrls = currendImagesUrls?.split(',') || []
  imagesUrls = req.files.map(file => `/${file.path.replace("\\", "/")}`);

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
    const car = await CarOffer.findByIdAndUpdate(carId, {
      name,
      year,
      length,
      seats,
      description,
      imagesUrls: [...currendImagesUrls, ...imagesUrls],
    }, { useFindAndModify: false }).exec()
    const updatedCar = await CarOffer.findById(carId).exec()
    if (!car || !updatedCar) {
      const err = new Error('No resources available');
      err.httpStatusCode = 404;
      throw err
    }
    res.status(200).json({
      updatedCar,
    })

    const imagesToRemove = car.imagesUrls.filter(url => !currendImagesUrls.includes(url));
    imagesToRemove.forEach(img => removeImage(img));

  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    next(err)
  }
}

module.exports.deleteCarById = async (req, res, next) => {
  const { carId } = req.params;

  try {
    const deletedCar = await CarOffer.findByIdAndDelete(carId).exec()
    if (!deletedCar) {
      const err = new Error('No resources available');
      err.httpStatusCode = 404;
      throw err
    }
    res.status(200).json({
      deletedCar,
    })

    deletedCar.imagesUrls.forEach(img => removeImage(img));

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
    const imagesUrls = req.files.map(file => `/${file.path.replace("\\", "/")}`);

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

const removeImage = (url) => {
  fs.unlink(path.join(__dirname, '..', url), (err) => {
    if (err) console.log('couldn\'t remove file. Error: ', err)
  })
}