const express = require('express');
const router = express.Router();
const User = require('../models/user');
const CatchAsync = require('../utils/CatchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users=require('../controllers/users');
const user = require('../models/user');


//REGISTER
router.get('/register', users.renderRegister);

//" model.register(user_instance,password)" to register user with hashed password
// req.login('user_instance', callback(err))  to automatically login user when they newly register themselves
router.post('/register', CatchAsync(users.register));


//LOGIN
router.get('/login', users.renderLogin)

// ".passport.authenticate()"" is a functionality of passport , its a kind of middleware , which will authenticate username and password with hashedpassword before loging user in.
//"local" here ,means local data from database ,,,     if this middleware fails then it will redirect to login page with a flash message
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: "/login" }),users.login)

//LOGOUT
//"req.logout(callback)" automatically  log you out , we need to pass a callback for err
router.get('/logout', users.logout)
module.exports = router;