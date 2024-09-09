const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
// const User=require('./user');


const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

// if you pass a document to Express' res.json() function, virtuals will not be included by default.
// To include virtuals in res.json(), you need to set the toJSON schema option to { virtuals: true }.
const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    // image: String,
    images: [imageSchema],
    geometry: {                        // geometrySchema of geodata { "type":"Point", "coordinates":[longitude,latitude]}    
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {                       // campground relation with particular model 
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    reviews: [        // campground relation with many reviews ... therefore reviews is array
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'      //given reference of review model
        }
    ]
},opts);//to pass json virtual

//clustermap ke liye properties set ki h    "this" refers to model
campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}......</p>`  // on popup we are providing link to individual campground
})//properties: {popUpMarkup: 'I AM POPUP TEXT'}




//making moongoose post middleware "findOneAndDelete" , which trigger on "findByIdAndDelete"

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }   // ese saare reviews delete kardo jinki id , doc (campground to be deleted) ke reviews me present h
        })
    }
})
// exporting Campground model
module.exports = mongoose.model('Campground', campgroundSchema);

//https://res.cloudinary.com/da5mbnbf5/image/upload/v1723288293/yelp-camp/veskkc38a8pa8qvecn8v.jpg