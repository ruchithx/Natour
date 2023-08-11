const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const { json } = require('express');

const Tour = require('./../../model/tourModel');
const User = require('./../../model/UserModel');
const Review = require('./../../model/ReviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection is successfully'));

const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//import data

const importData = async () => {
  try {
    await Tour.create(tour);
    await User.create(user, { validateBeforeSave: false });
    await Review.create(review);
    console.log('data impoting is successful');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//deleting data

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data deleting is successful');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
//i did that code
const deleteUserData = async () => {
  try {
    await User.deleteMany();
    console.log('data deleting is successful');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
} else if (process.argv[2] == '--deleteUser') {
  deleteUserData();
}

// node dev-data/data/import-dev-data.js --deleteUser

console.log(process.argv);

// all  user  field password is test1234
