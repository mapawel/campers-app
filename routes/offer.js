const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const offerController = require('../controllers/offer');
const postOfferValidator = require('../validators/postOfferValidator');
const multer = require('multer');
const multerSignUpErrorHandler = require('../middlewares/multerSignUpErrorHandler')
const { isAuth } = require('../middlewares/isAuth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()+uuidv4()}.${file.originalname.split('.')[1]}`)
  }
})


const fileFilter = (req, file, cb) => {
  const [fileType] = file.mimetype.split('/')
  if (fileType !== 'image') {
    const error = new Error('Wrong file format')
    error.type = 'multer-format'
    cb(error)
  } else {
    cb(null, true)
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 525000 } });




router.get('/cars',  offerController.getCars)

router.get('/restcars', offerController.fetchRestCars)

router.get('/userscars',  isAuth, offerController.getUsersCars)

router.get('/car/:carId', offerController.getCarById)

router.post('/car', upload.array('images', 10), multerSignUpErrorHandler, postOfferValidator, isAuth, offerController.postCar)

router.put('/car/:carId', upload.array('images', 10), multerSignUpErrorHandler, postOfferValidator, isAuth, offerController.updateCarById)

router.delete('/car/:carId', isAuth, offerController.deleteCarById)

module.exports = router;