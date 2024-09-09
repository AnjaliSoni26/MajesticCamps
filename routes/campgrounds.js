const express = require('express');

const router = express.Router({ mergeParams: true });
const CatchAsync = require('../utils/CatchAsync');

const Campground = require('../models/campground');

const { isLoggedIn, isauthor, validateCampground } = require('../middleware')

const campgrounds = require('../controllers/campground')

// Multer adds a body object and a file or files object to the request
const multer = require('multer')
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });


//fancy way to restructure routes ( grouping same path routes) using .route
router.route('/')
    //A. all campground
    .get(CatchAsync(campgrounds.index))
    //posting
    .post(isLoggedIn, upload.array('image'), validateCampground, CatchAsync(campgrounds.createCampground))

// .post(upload.array('image'), (req, res) => {  // upload.array('name of input in form, which is to be uploaded') means user can upload multiple file at one time means 
//     console.log(req.body, req.files);           // req.file is used to get file size,etc info
//     res.send('uploaded');
// })


//C. create campground : form
//without isloggedin this page will not open
router.get('/new', isLoggedIn, campgrounds.renderNewForm)


//B: show particular campground
router.get('/:id', CatchAsync(campgrounds.showCampgrounds))


//D: update any campground
router.get('/:id/edit', isLoggedIn, isauthor, CatchAsync(campgrounds.renderEditForm))


//taking put req
router.put("/:id", isLoggedIn, isauthor,  upload.array('image'), validateCampground, CatchAsync(campgrounds.updateCampground))



//E: delete any campground
//H. deleting all reviews related to particular campground using MONGOOSE MIDDLEWARE --"findOneAndDelete" which triggers on findByidAndUpdate
router.delete('/:id', isLoggedIn, isauthor, CatchAsync(campgrounds.deleteCampground))

module.exports = router;