const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const viewRoter = require('./routes/viewRoute');

const appError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const compression = require('compression');

// using template engine
app.set('view engine', 'pug'); //initialize pug
app.set('views', path.join(__dirname, 'views')); //show the path where is render

// 1)middleware

// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false })); // contentSecurityPolicy: false , i did it , when i create axios , it happen securety errro so , i did it

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// body parser , reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //
app.use(cookieParser());

// Limit requests from same API
app.use(morgan('dev'));

// Body parser, reading data from body into req.body
app.use(express.json());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());
// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  // req.requestTime = new Date().toISOString();

  next();
});

// 2)routing controll

// 1)tour

// 2)user

// 3)routing

// const userRouter = express.Router();

// tourRouter.route('/').get(getAllTour).post(createTour);

// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// userRouter.route('/').get(getAllUser).post(createUser);

// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/', viewRoter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `The page cannot find ${req.originalUrl}`,
  // });

  // next();
  // const err = new Error(`The page cannot find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 400;
  // next(err);
  next(new appError(`The page cannot find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);
// app.get('/api/v1/tours', getAllTour);
// app.post('/api/v1/tours', createTour);

// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 4)server

module.exports = app;
