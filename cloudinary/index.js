const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// SETTING CONFIGURATION OF CLOUDINARY , used process.env bec our cridential are in .env file
//Associating our account with this instance
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// storage in cloudinary, where we will upload aur files
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'yelp-camp',                  // in cloudinary we will have a folder named "yelp-camp" in which we will be uploading  
        allowedFormats: ['jpegs', 'png', 'jpg'] // formats allowed to be uploaded
    }
});

module.exports = {
    cloudinary,
    storage
}