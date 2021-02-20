const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validationResult } = require('express-validator');



module.exports.postSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Form validation failed');
    err.httpStatusCode = 422;
    err.validationErrors = errors.errors;
    return next(err)
  }

  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(12)
    const hashPass = await bcrypt.hash(password, salt)
    const newUser = new User({
      email,
      password: hashPass,
    });
    const savedData = await newUser.save()
    res.status(201).json({
      message: 'A new user signed up',
      userId: savedData._id,
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t sign up, technical error'
    next(err)
  }
}


module.exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Form validation failed');
    err.httpStatusCode = 422;
    err.validationErrors = errors.errors;
    return next(err)
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec()
    if (!user) {
      const err = new Error('E-mail address doesn\'t exist');
      err.httpStatusCode = 401;
      return next(err)
    }
    const passwordVerified = await bcrypt.compare(password, user.password)
    if (passwordVerified) {
      const token = await jwt.sign({
        email,
        userId: user._id,
      }, 'secret', { expiresIn: '1h' });
      res.status(201).json({
        message: 'User logged in',
        userId: user._id,
        token,
      })
    } else {
      const err = new Error('Invalid password');
      err.httpStatusCode = 401;
      return next(err)
    }
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Couldn\'t log in, technical error'
    next(err)
  }
}
