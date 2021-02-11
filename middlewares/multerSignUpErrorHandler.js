const multer = require('multer');

module.exports = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    req.multerError = 'File too big: 300KM max allowed'
  } else if (error.type === 'multer-format') {
    req.multerError = 'File has to be an image'
  }
  next()
}