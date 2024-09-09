// contains functionality of all routes of campground

const Campground = require('../models/campground');//import model file
const { cloudinary } = require('../cloudinary/index');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//ALL CAMPGROUND
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});//take all data from model
    res.render('campgrounds/index.ejs', { campgrounds });
}

// CREATE NEW CAMPGROUND
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');       // if logedin then open campground/new page
}

module.exports.createCampground = async (req, res, next) => {
    // const{title,location}=req.body;
    //udate new in database
    // try{

    // if(!req.body.campground) throw new ExpressError('Invalid campground data',400);// object of class ExpressError is thrown as err

    //geocoder will provide geocoded data, location info about the place passed in query
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,                                  // guery:"city,country" -->'yosemite,CA',
        limit: 1
    }).send()
    // console.log(geoData.body.features[0].geometry.coordinates);//result is coordinate array [longitude, latitude]

    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));     // req.files is an array of multiple uploaded images, from which we get path and filename using map
    campground.author = req.user._id;                                                    // req.user._id have object id of current user who is logedin .. if current user make new campgaround then associte that user with that campground using author field of campground
    campground.geometry=geoData.body.features[0].geometry;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
    //     }
    //    catch(e){
    //     next(e);//send to error handler
    //    }
}

// SHOW PARTICULAR CAMPGROUND
module.exports.showCampgrounds = async (req, res) => {
    // const { id } = req.params;
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',                                                  // nested populate campground ka review, review ka author
        populate: {
            path: 'author'
        }
    }).populate('author');// find that particular data using id from database, poulate reviews 

    if (!campground) {  //if campground with the given id does not exist, then flash a error message and redirect to /campground
        req.flash('error', 'campground with above id does not exits');
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/show.ejs', { campground })// then render that data to ejs
}

// EDIT CAMPGROUND
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    //if campground does not exist
    if (!campground) {
        req.flash('error', 'campground does not exist');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}


module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    //add new uploads in images

    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));// return array thus we have used "...imgs" means spread data of array in images
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }

        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })//if something is there in deleteImages , then pull images out of images array whose file name is in deleteImages array
        console.log(campground)
    }

    req.flash('success', 'successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`);
}

// DELETE CAMPGROUND
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');

}