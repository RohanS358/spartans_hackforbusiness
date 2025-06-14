const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/mydatabase")

const userSchema=mongoose.Schema({
    username:String,
    email: String,
    age: Number,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    } 
     ]     //array of ids of posts and posts will have id of user
})
module.exports=mongoose.model("user",userSchema)