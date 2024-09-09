//we can have millions of review thus we are making a separate model for review having relation with campground.

const mongoose = require('mongoose');
const Campground = require('./campground');
const Schema = mongoose.Schema;
const User=require('./user')

const reviewSchema = new Schema({
  body:String,
  rating:Number,
  author:{                         //relation of review with one user
    type:Schema.Types.ObjectId,
    ref:"User"
  }
})

module.exports = mongoose.model('Review', reviewSchema);