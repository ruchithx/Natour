const catchAsync = require('./../utils/catchAsync');
const Review = require('./../model/reviewModel');
const factory = require('./../controller/handlerFactory');

// exports.getAllReview = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const review = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     result: review.length,
//     review,
//   });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//   // allow nested route
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id; // req.user coming from protect function

//   const newReview = await Review.create(req.body);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       newReview,
//     },
//   });
// });

exports.setTourUserId = (req, res, next) => {
  // allow nested route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // req.user coming from protect function
  next();
};

exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
