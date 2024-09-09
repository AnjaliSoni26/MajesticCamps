
const Campground = require('./models/campground');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');


// use the storeReturnTo middleware to save the returnTo value from session to res.locals  storeReturnTo,
//means agar returnTo me kuch h to use local banado
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// setting a middleware to check if user is logedin or not
//"req.isAuthenticate" check wheather the person is logedin or not , work like session 
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {                              // if not authenticated(not loged in) then go to login page
        // store url they are requesting
        req.session.returnTo = req.originalUrl;               // store current url which is login require
        req.flash('error', 'you must be signed in first');
        return res.redirect('/login');
    }
    next();
}
// without this page will not open , in which this is applied




//================ PROTECTS THE ROUTES ========== of campground
//midddleware checks whether the logedin user is owner(author) or not of the found campground 
module.exports.isauthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);     // before saving updates/delete made ,  check wether found campground's author is same to logedin person or not
    if (!campground.author.equals(req.user._id)) {          // if not then flash msg and redirect to show page
        req.flash('error', 'You are not authorized');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

//======= protect the routes of review === only owner can make changes like delete etc
module.exports.isReviewAuthor= async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);  
    if (!review.author.equals(req.user._id)) {         
        req.flash('error', 'You are not authorized to do this');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}




//====validating campground model ---Joi Schema====
// we can pass these as middleware , where ever we want
module.exports.validateCampground = (req, res, next) => {
    // now validate data we have with these schema
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next(); //these is very critical part.
    }
    console.log(error);
}


// validate review model
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next(); 
    }
    console.log(error);
}
