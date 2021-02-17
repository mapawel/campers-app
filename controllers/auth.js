const moment = require('moment');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { validationResult } = require('express-validator');



module.exports.postSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Form validation failed!');
    err.httpStatusCode = 422;
    return next(err)
  }

  try {
    const { email, password } = req.body;

    console.log(email, password)

    const salt = await bcrypt.genSalt(12)
    const hashPass = await bcrypt.hash(password, salt)
    const newUser = new User({
      email,
      password: hashPass,
    });
    const savedData = await newUser.save()
    res.status(201).json({
      message: 'A new user signed up',
      user: savedData
    })
  } catch (err) {
    if (!err.httpStatusCode) err.httpStatusCode = 500
    next(err)
  }
}
