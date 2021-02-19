const { body } = require('express-validator');

module.exports = [
  body('name')
  .trim()
  .isString()
  .withMessage('Offer name is not a proper name (string required)')
  .isLength({ min: 4 })
  .withMessage('Offer name is too short (4 chaacters required)'),
  body('year')
  .trim()
  .isNumeric()
  .withMessage('Invalid input text in year filed')
  .isLength(4)
  .withMessage('Invalid input text in year filed'),
]