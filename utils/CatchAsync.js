// function to handle async function
module.exports = func => {     // we pass a function in it
    return (req, res, next) => { //then it return a function
        func(req, res, next).catch(next);// if return func containing error , then error will be  caught by catch and then forwared to error handler using  next 
    }
}