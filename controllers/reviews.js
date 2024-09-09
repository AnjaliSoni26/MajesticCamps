// contains functionality of all routes of reviews
//import model file
const Review=require('../models/review');      
const Campground=require('../models/campground');


// CREATE NEW REVIEW
module.exports.createReview=async (req, res) => {
    const campground = await Campground.findById(req.params.id);    //find that campground
    const review = new Review(req.body.review);//add new review to Review model, review here is the "name" in form
    review.author = req.user._id;
    console.log(review.author)
    campground.reviews.push(review);         // push new review to campground reviews's array
    
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully posted a new review!');
    res.redirect(`/campgrounds/${campground._id}`)
}

// DELETE REVIEW
module.exports.deleteReview=async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });// this is deletion of review from campground based on review id
    await Review.findByIdAndDelete(reviewId);                          // and this is deletion of review from review model using review id
    req.flash('success', 'Successfully deleted review !');
    res.redirect(`/campgrounds/${id}`)
}