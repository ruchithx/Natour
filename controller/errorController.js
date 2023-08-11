const appError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}.`;
  return new appError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  // const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const value = err.keyValue.name;

  const message = `Duplicate Field value :${value}. please use another value`;
  return new appError(message, 500);
};

const handleValidationErrorDB = (err) => {
  console.log(err);
  const errors = Object.values(err.errors).map((el) => el, message);

  const message = `Invalid input data.${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleJWTError = () =>
  new appError('Invalid token .please log in again', 401);

const handleJWTExpiredError = () =>
  new appError('Your token has experied ,please login again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      error: err,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // rendedr website
    console.log('ERROR💥💥');
    res.status(err.statusCode).render('error', {
      title: 'Somthing Went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorprod = (err, req, res) => {
  // A  API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.log('ERROR💥💥');

      return res.status(500).json({
        status: 'ERROR',
        message: 'Something went very wrong!',
      });
    }
  } else {
    // B render website
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Somthing Went wrong!',
        msg: err.message,
      });
    } else {
      console.log('ERROR💥💥');

      res.status(err.statusCode).render('error', {
        title: 'Somthing Went wrong!',
        msg: 'please try again later',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    error.message = err.message;
    // console.log(error.name);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.message === 'Tour validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorprod(error, req, res);
  }

  next();
};
