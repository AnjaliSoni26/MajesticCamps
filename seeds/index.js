//we will seed(enter) data into database from this file.
//and use seeded data in crud operation from app.js


const mongoose = require('mongoose');

const Campground = require('../models/campground');//we use two dot ".." as it is not one directory back

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const cities = require('./cities');  //first export them from thier file,then imported cities data, now we access its data by "cities" name
const { places, descriptors } = require('./seedHelpers');//imported seedhelpers data


//====================== wherever we include mongoose , that file get connected to database and can make changes in the database of imported model.
//=======================we can run this file code by "node seeds/index.js"=======================================================================
// the file which have express relate work is runned using "npm start" so that port can work

//func to return random value from array passed
const sample = (array) => array[Math.floor(Math.random() * array.length)];//because we dont know length

//work when node seeds/index.js run
const seedDB = async () => {
    await Campground.deleteMany({});    // delete all present entries
    for (let i = 0; i < 200; i++) {              // add 50 random entries
        const rand = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        //inserting data in model
        const camp = new Campground({
            //user account id
            author:"66b2e4f649fd7c886d8736ea",
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, 
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Labore, fugiat repellat quasi, quas sapiente dolorum ducimus architecto illum facere eaque quae nisi minus exercitationem vitae est dolore numquam, quidem tenetur.", 
            price: price,
            geometry:{
            type:"Point",
            coordinates:[
                cities[rand].longitude,
                cities[rand].latitude
            ]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/da5mbnbf5/image/upload/v1723288293/yelp-camp/veskkc38a8pa8qvecn8v.jpg',
                  filename: 'yelp-camp/veskkc38a8pa8qvecn8v'
                },
                {
                  url: 'https://res.cloudinary.com/da5mbnbf5/image/upload/v1723288293/yelp-camp/nosgiqlatybfbfrrqywo.jpg',
                  filename: 'yelp-camp/nosgiqlatybfbfrrqywo',
                }
              ]
        });

        //to make random title from descreptors and palces ::--> take any random value from descriptors and places value and put them in title 
        await camp.save();
    }
}
seedDB()
    .then(() => {
        mongoose.connection.close();
    })