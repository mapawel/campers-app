const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer');

router.get('/cars', offerController.getCars)

router.post('/cars', offerController.postCar)

module.exports = router;