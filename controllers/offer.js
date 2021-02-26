const moment = require('moment');
const path = require('path');
const fs = require('fs');
const CarOffer = require('../models/carOffer');
const { validationResult } = require('express-validator');

module.exports.getCars = async (req, res, next) => {
  const { elements = 10 } = req.query;
  try {
    const itemsQty = await CarOffer.countDocuments().exec()
    const cars = await CarOffer
      .find(
        {}, [],
        {
          limit: elements * 1,
          sort: { createdAt: -1 }
        }
      )
      .exec()
    res.status(200).json({
      carsRes: {
        cars,
        carsQty: itemsQty
      },
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t fetch data from DB'
    next(err)
  }
}

module.exports.getUsersCars = async (req, res, next) => {
  try {
    const usersCars = await CarOffer
      .find(
        { owner: req.userId }, [],
        {
          sort: { createdAt: -1 }
        }
      )
      .exec()
    res.status(200).json({
      carsRes: {
        usersCars,
      },
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t fetch user data from DB'
    next(err)
  }
}

module.exports.fetchRestCars = async (req, res, next) => {
  const { elements, newest, oldest } = req.query;
  try {
    const itemsQty = await CarOffer.countDocuments().exec()
    const cars = await CarOffer
      .find(
        {
          $or: [
            { createdAt: { $lt: moment.utc(oldest, 'x') } },
            { createdAt: { $gt: moment.utc(newest, 'x') } },
          ]
        }, [],
        {
          limit: elements * 1,
          sort: { createdAt: -1 }
        }
      )
      .exec()
    res.status(200).json({
      carsRes: {
        cars,
        carsQty: itemsQty
      },
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t fetch data from DB'
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
      if (!err.info) err.info = 'No resources available'
      throw err
    }
    res.status(200).json({
      car,
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t fetch data from DB'
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

  try {
    const car = await CarOffer.findById(carId)
    if (!car) {
      const err = new Error('No resources available');
      err.httpStatusCode = 404;
      if (!err.info) err.info = 'No resources available';
      throw err
    }
    if (car.owner.toString() !== req.userId) {
      const err = new Error('Access denied');
      err.httpStatusCode = 401;
      if (!err.info) err.info = 'Access denied';
      throw err
    }
    if (!errors.isEmpty()) {
      const err = new Error('Form validation failed');
      err.httpStatusCode = 422;
      if (!err.info) err.info = 'Form validation failed';
      err.validationErrors = errors.errors;
      return next(err)
    }
    if (req.multerError) {
      const err = new Error('File size / format validation failed!');
      err.httpStatusCode = 422;
      if (!err.info) err.info = 'File size / format validation failed! Images required';
      return next(err)
    }

    await car.update({
      name,
      year,
      length,
      seats,
      description,
      imagesUrls: [...currendImagesUrls, ...imagesUrls],
    });
    const updatedCar = await CarOffer.findById(carId).exec()
    res.status(200).json({
      updatedCar,
    })
    const imagesToRemove = car.imagesUrls.filter(url => !currendImagesUrls.includes(url));
    imagesToRemove.forEach(img => removeImage(img));
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t udate data in DB'
    next(err)
  }
}

module.exports.deleteCarById = async (req, res, next) => {
  const { carId } = req.params;

  try {
    const toDelete = await CarOffer.findById(carId).exec()
    if (!toDelete) {
      const err = new Error('No resources available');
      err.httpStatusCode = 404;
      if (!err.info) err.info = 'No resources available';
      throw err
    }
    if (toDelete.owner.toString() !== req.userId) {
      const err = new Error('Access denied');
      err.httpStatusCode = 401;
      if (!err.info) err.info = 'Access denied';
      throw err
    }
    await CarOffer.deleteOne({ _id: toDelete._id }).exec()
    res.status(200).json({
      toDelete,
    })
    toDelete.imagesUrls.forEach(img => removeImage(img));
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Server error, could\'n delete resource'
    next(err)
  }
}


module.exports.postCar = async (req, res, next) => {
  const userId = req.userId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Form validation failed!');
    err.httpStatusCode = 422;
    if (!err.info) err.info = 'Form validation failed!';
    err.validationErrors = errors.errors;
    return next(err)
  }
  if (req.multerError) {
    const err = new Error('File size / format validation failed!');
    err.httpStatusCode = 422;
    if (!err.info) err.info = 'File size / format validation failed! Images required';
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
      owner: userId,
    });
    const savedData = await newCarOffer.save()
    res.status(201).json({
      message: 'A car added!',
      car: savedData
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t add data to DB'
    next(err)
  }
}

const removeImage = (url) => {
  fs.unlink(path.join(__dirname, '..', url), (err) => {
    if (err) console.log('couldn\'t remove file. Error: ', err)
  })
}