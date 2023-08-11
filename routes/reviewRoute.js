const express = require('express');
const reviewControlle = require('./../controller/reviewController');
const authController = require('./../controller/authController');

const router = express.Router({ mergeParams: true }); //mergeParams: true this is doing,in the tour router we use this for nested routed  router.use('/:tourId/reviews', reviewRouter);,,this url has params. but we can't use it if we couln't allow it , that will do by using mergeParams: true

// protect all route after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(reviewControlle.getAllReview)
  .post(
    authController.restrictTo('user'),
    reviewControlle.setTourUserId,
    reviewControlle.createReview
  );

router
  .route('/:id')
  .get(reviewControlle.getReview)
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewControlle.deleteReview
  )
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewControlle.updateReview
  );

module.exports = router;
