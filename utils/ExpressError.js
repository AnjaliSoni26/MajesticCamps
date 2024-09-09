// making our own class to handle error

class ExpressError extends Error{
    constructor(message,statusCode){
        super();
        this.statusCode=statusCode;
        this.message=message;
    }
}

module.exports=ExpressError;