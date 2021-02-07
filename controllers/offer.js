const CarOffer = require('../models/carOffer');



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
  try {
    const { name, year, length, seats, description } = req.body;
    console.log(name, year, length, seats, description)
    const newCarOffer = new CarOffer({
      name,
      year,
      length,
      seats,
      description
    });
    console.log(newCarOffer)
    await newCarOffer.save()
    res.status(201).json({
      message: 'A car added!',
      car: newCarOffer
    })
  } catch (err) {
    console.log(err)
  }
}