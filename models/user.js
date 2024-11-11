const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email:{
    type:String,
    required : true
  }

})

User.plugin(passportLocalMongoose); // automatically impliment solting 
module.exports = mongoose.model("User", userSchema);