const jwt = require('jsonwebtoken');

module.exports.isAuth = async (req, res, next) => {
  try {
    const Authorization = req.get('Authorization')
    if (!Authorization) {
      const err = new Error('Not authorized user, please log in')
      err.httpStatusCode = 401
      err.info = 'Not authorized user, please log in'
      return next(err)
    }
    const token = Authorization.split(' ')[1]
    const decoded = await jwt.verify(token, 'secret');
    if (!decoded) {
      const err = new Error('Not authorized user, please log in')
      err.httpStatusCode = 401
      err.info = 'Not authorized user, please log in'
      return next(err)
    }
    req.userId = decoded.userId;
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      err.httpStatusCode = 401;
      err.info = 'You have been logged out, please log in again';
      err.action = 'logout';
    }
    if (!err.httpStatusCode) err.httpStatusCode = 500
    if (!err.info) err.info = 'Authorization problem'
    next(err)
  }
}