const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('./../utils/appError');
const sendmail = require('./../utils/email');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const { token } = require('morgan');
const crypto = require('crypto');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECURITY_CODE);
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  console.log(token, cookieOptions);
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    roles: req.body.roles,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
  });

  // const url = `${req.protocol}://${req.get('host')}/me`;
  // // console.log(url);
  // // await new Email(newUser, url).sendWelcome();
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password exist
  if (!email || !password) {
    return next(new appError('email or password not exist', 400));
  }
  //check if user exist && password is corrrect
  const user = await User.findOne({ email: email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new appError('Invalid email or password', 401));
  }

  //if everything ok,send token to client

  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(400).json({
  //   status: 'success',
  //   token,
  // });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Getting token and check of it's there

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new appError('You are not logged in ! please log in to get access. ', 401)
    );
  }

  //verification token
  //promisify function use to to avoid of callback hell
  const decode = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECURITY_CODE
  );

  //check if user still exist
  const currentUser = await User.findById(decode.id);

  if (!currentUser)
    next(
      new appError(
        'The user belonging to this token does not longer exist',
        401
      )
    );

  //check if user changed password after the token was issued
  if (currentUser.ChangePasswordAfter(decode.iat)) {
    return next(
      new appError('user recently change password, please log in again', 401)
    );
  }

  //grant access to protect route
  req.user = currentUser;

  // there is a logged in user
  res.locals.user = currentUser; //res.locals.user , this doing create new variable as user in our template

  next();
});

// we didn't use catchAsync functiion for this , because we log out user , jwt web token , we wil be expire , there for , some error will happen  , then we call next function
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //verification token
      //promisify function use to to avoid of callback hell
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECURITY_CODE
      );

      //check if user still exist
      const currentUser = await User.findById(decode.id);

      if (!currentUser) next();

      //check if user changed password after the token was issued
      if (currentUser.ChangePasswordAfter(decode.iat)) {
        return next();
      }

      // there is a logged in user
      res.locals.user = currentUser; //res.locals.user , this doing create new variable as user in our template

      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.logout = async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.restrictTo = (...roles) => {
  //roles is a array that contain the data that we pass when i call
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError(
          'User roles does not match for full fill your request',
          401
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1)get user based on POSTed email

  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new appError('there is no user with that email', 404));

  // 2)generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3)send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  // try {
  //   const resetURL = `${req.protocol}://${req.get(
  //     'host'
  //   )}/api/v1/user/resetPassword/${resetToken}`;

  //   await new Email(user, resetURL).sendPasswordReset();
  try {
    await sendmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    /* **********************there was in error down two line ,that error happend beacuse line 138 this function doesn' work await sendmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    }); 
    **the problem is sendmail function doesnt work ,therfor it was error 
    if ( user.passwordResetToken = undefined and  user.passwordResetExpires = undefined) ;
    
    resetPassword route doens't work , so for the test , i commented it

    */

    // user.passwordResetToken = undefined;
    // user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(hashedToken);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  //if token has not expired , and there is user ,set the new password
  if (!user) {
    return next(new appError('Token is expired or invalid', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //update changePasswordAt properly for the user
  //**did it as a middleware */

  //log the user in ,send JWT
  createSendToken(user, 200, res);

  // const token = signToken(user._id);
  // res.status(400).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user from collection

  const { passwordCurrent } = req.body;
  const { password } = req.body;
  const { passwordConfirm } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  //2)check if POSTed current password is correct
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new appError('old password is wrong', 400));
  }

  if (!(password === passwordConfirm)) {
    return next(new appError('new password is not match', 400));
  }
  //1)If so , update password

  user.password = password;
  user.passwordConfirm = password;
  await user.save();

  //1)log user in , send JWT

  createSendToken(user, 200, res);

  // const token = signToken(user._id);
  // res.status(400).json({
  //   status: 'password change success',
  //   token,
  // });
});
