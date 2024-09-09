// contains functionality of all routes of reviews
//import model file
const User=require('../models/user');    

// REGISTER USER
module.exports.renderRegister=(req, res) => {
    res.render('users/register')
}

module.exports.register=async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);//apne aap hi database me save hojayega and password hash me convert ho jayega
        console.log(registeredUser);
        // to login auttomatically after register
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'successfully registered , Welcome to yelp-camp');
            res.redirect('/campgrounds');
        })
    }
    catch (e) {    //if it contains error then flash a error msg rather then bada wala alert
        req.flash('error', e.message)
        res.redirect('register');
    }
}

// LOGIN USER
module.exports.renderLogin=(req, res) => {
    res.render('users/login')
}

module.exports.login= async (req, res) => {

    req.flash('success', 'welcome to yelp camp');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // req.session.returnTo have url from where we came to login page
    res.redirect(redirectUrl);
}

// LOGOUT USER
module.exports.logout=(req, res) => {

    req.logout((err) => {
        if (err) {
            return next(err);
        }
        else {
            req.flash('success', 'Good Bye !!')
            res.redirect('/campgrounds')
        }
    });


}