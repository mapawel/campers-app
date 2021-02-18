const { body } = require('express-validator');
const User = require('../models/user');

module.exports = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid e-mail address required')
    .custom(async (value, { req }) => {
      const userMailFound = await User.findOne({ email: req.body.email }).exec()
      if (userMailFound) {
        return Promise.reject('e-mail already in use');
      }
    }),
  body('password')
    .trim()
    .isString()
    .withMessage('given text is not a string')
    .isLength(6)
    .withMessage('password too short - min 6 characters required'),
  body('confirmpass')
    .trim()
    .custom((value, { req }) => {
      if (value === req.body.password) return true
      else throw new Error('password confirmation does not match password');
    })
]