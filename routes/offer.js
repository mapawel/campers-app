const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer');
const postOfferValidator = require('../validators/postOfferValidator');

router.get('/cars', offerController.getCars)

router.get('/car/:carId', offerController.getCarById)

router.post('/car', postOfferValidator, offerController.postCar)

module.exports = router;