const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeature = require('./../utils/apiFeature');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new appError('Could not find document ', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, popPopulation) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popPopulation) query = query.populate(popPopulation);

    const doc = await query;

    if (!doc) {
      return next(new appError('Could not find document ', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // this only allows for nested route, get all review to a tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const feature = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    const doc = await feature.query;
    // const doc = await feature.query.explain();

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });
