if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
//PARSE ENV AND USE IT
// console.log(process.env.SECRET)
// console.log(process.env.API_KEY)
// console.log(process.env.NAME)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');        // npm i ejs-mate
const session = require('express-session'); // npm  i exress-session
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');// to remove or replace prohibited symbols
const helmet = require('helmet');// increase security of site
const MongoStore = require('connect-mongo');// to create a store for session in mongos
// const dbUrl=process.env.DB_URL;

// mongoose.connect('mongodb://localhost:27017/yelp-camp');
const dbUrl='mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// const { campgroundSchema, reviewSchema } = require('./schemas.js');
// const Campground = require('./models/campground');
// const Review = require('./models/review');

const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const CatchAsync = require('./utils/CatchAsync');

// Routes
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const app = express();
app.engine('ejs', ejsMate);//boilterplate.ejs

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extented: true }));//convert form data to object
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));    //setting public directory

// Or, to replace these prohibited characters with '_' use:
app.use(
    mongoSanitize({            // if we did not replace then it will remove prohibited symbol 
        replaceWith: '_',
    }),
);

const secret=process.env.SECRET || 'thisshouldbeabettersecret!';

//connect-mongo , now make store for session
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on("error",function(e){
    console.log('SESSION STORE ERROR ',e)
})

// setting configuration of session , the cookie we gat back contains this configuration
const sessionConfig = {
    store,
    name: "session_name", // change default name connectSid to this name , so that its not easy for hacker to idetitfy our seesion id 
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true, // 
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());//this line enalbles all 11 middleware of helmet , one middleware that is "contentSecurityPolicy" which is not allowing us to load online content in our site like mapbox, images etc

// we can specify urls to contentSecuritypolicy , which we used in our site , so that other than this site no other sites are allowed , like we hacker want to add some other site they want work
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            // styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/da5mbnbf5/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// applying authentication to User model
app.use(passport.initialize());
app.use(passport.session()); //should be before app.use(session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   // kind of assigning session and deassigning session
passport.deserializeUser(User.deserializeUser());

// model.register('user_instance','password') will automatically hash password
// app.get('/fakeUser',async(req,res)=>{
//     const user= new User({email:"colttttt@gmail.com",username:"colttt"});
//     const newUser= await User.register(user,'chicken');             
//     res.send(newUser);
// })

//flash middleware for creating "locals" means can be asscessed from any where
app.use((req, res, next) => {
    // console.log(req.session.returnTo);
    res.locals.currentUser = req.user;      //currentUser is now localy used to get current user info
    res.locals.success = req.flash('success');//"success" msg 
    res.locals.error = req.flash('error');  // flash named error for errors
    next();
})


//models routes setup : ye ek tare se routes file yaha par rkhna h
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
})


//handle error for all routes does not exit, then passe it to error handler 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found', 404));
})

//error handler
app.use((err, req, res, next) => {//err stores the error coming from above
    const { message = 'something went wrong', statusCode = 500 } = err;//error coming from above handler having message and code, if err does not have code and message then default will me shown
    // res.status(statusCode).send(message);//message will we shown on site, whereas status will be shown on console.
    // res.send('something went worng');
    // render template for error
    res.status(statusCode).render('error.ejs', { err });// pass err so that we can show particular error on render page
})

app.listen(5000, () => {
    console.log('LISTENING ON PORT 5000!!!');
})