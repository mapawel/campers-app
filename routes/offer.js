const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const offerController = require('../controllers/offer');

router.get('/cars', offerController.getCars)

router.post('/car', [
  body('name')
  .trim()
  .isString()
  .withMessage('Given text is not a proper name (string required)')
  .isLength({ min: 6 })
  .withMessage('Given text is too short (4 chaacters required)'),
  body('year')
  .trim()
  .isNumeric()
  .withMessage('Given text is not a year.')
  .isLength(4)
  .withMessage('Given number is not a year.'),
], offerController.postCar)

module.exports = router;