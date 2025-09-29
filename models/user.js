const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({           // username, email, password.
    email : { 
        type : String,
        required : true
    }
});

userSchema.plugin(passportLocalMongoose);       // It adds username, password, hash, salt fields in Schema. and some methods like setPassword() ect.

const User = mongoose.model("User",userSchema);

module.exports = User;




