const mongoose=require('mongoose');
const Schema=mongoose.Schema;
//authentication package passport this is used in model only
const passportLocalMongoose=require('passport-local-mongoose');

const UserSchema=new Schema({
    email:{
        type:String,
        required:[true, 'Email is required'],
        unique:true
    }
})

//.plugin(passportLocalMongoose) will automatically add user and password field in our schema
UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User',UserSchema);