const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const postSignUpValidator = require('../validators/signUpValidator');


router.post('/signup', postSignUpValidator, authController.postSignUp)



module.exports = router;