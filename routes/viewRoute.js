const express = require('express');
const viewController = require('./../controller/viewController');
const router = express.Router();
const authController = require('./../controller/authController');

router.get('/', authController.isLoggedIn, viewController.getAllTour);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getATour);
// router.get('/tour/', viewController.getATour);

router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

router.get('/me', authController.protect, viewController.getAccount);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
