const mongoose = require('mongoose');
const validator = require('validator');
const { default: slugify } = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have equal or more than 40'],
      minlength: [10, 'A tour name must have less or below than 10'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      // enum: {
      //   value: ['easy', 'difficult', 'medium'],
      //   message: 'difficulty is either easy,difficulty or medium,',
      // },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'rating must below to 5'],
      min: [1, 'rating must more  to 1'],
      set: (val) => Math.round(val * 10) / 10, // get value as round number,,,4.666 , 4.666*10=46.666 , when we round 47 after that devide 10 ,4.7,,,,if we don't do it , math.round do ,4.66 round is 5
    },
    slug: String,
    screatTour: {
      type: Boolean,
      default: false,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation, it's mean this function works for creating a document.
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      // getJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//this is very important method for larger application , definitly you shold know about it . try it to search index function on node .js
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// virtual population
tourSchema.virtual('reviews', {
  // write field name
  ref: 'Review', // model name that get data
  foreignField: 'tour', // whare the fild name that data come, in this example , Review model , tour field . like that
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidePromis = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromis);

//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ screatTour: { $ne: true } });
  next();
});

// tourSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'guides',
//   });
//   next();
// });

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { screatTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
