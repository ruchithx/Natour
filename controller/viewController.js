const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../model/tourModel');
const User = require('./../model/userModel');
const appError = require('./../utils/appError');

exports.getAllTour = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'overview',
    tours,
  });
});

exports.getATour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug })
    .populate({
      path: 'reviews',
      fields: 'review rating user',
    })
    .populate('guides');

  if (!tour) return next(new appError('There is no tour with that name.', 404));

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = async (req, res, next) => {
  // const user = await User.findOne(req.user);
  res.status(200).render('account', {
    title: 'your account',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  // form get the data from form , we use middleware in app.js ,app.use(express.urlencoded({ extended: true, limit: '10kb' }))
  // console.log('Updating User', req.body);

  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'your account',
    user: updateUser,
  });
});
