const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn , isReviewAuthor} = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');

const CatchAsync = require('../utils/CatchAsync');

const reviews=require('../controllers/reviews')


//F. Posting new review for particular campground 
// /campgrounds/:id/reviews     
router.post('/', validateReview, isLoggedIn, CatchAsync(reviews.createReview))



//G. route for deleting single review of campground
///campgrounds/:id/reviews/:reviewId
// "isreviewauthor" check if the user is author of review or not , if yes then can delete the review
router.delete('/:reviewId', isLoggedIn,isReviewAuthor,CatchAsync(reviews.deleteReview))

module.exports = router;