const express=require("express")
const app=express();
const userModel=require("./models/user")
const postModel=require("./models/post")
const cookieParser=require("cookie-parser")
const bcrypt=require('bcrypt');
const jwt =require('jsonwebtoken')


app.use(cookieParser())

app.get("/gett",(req,res)=>{
    let token =jwt.sign({email:"piyushrokaya600@gmail.com"},"secret")      //secret word use garera add string to email
    res.cookie("token",token)
    res.send("jwtdone")
})
// app.get("/gett/cookies",(req,res) => {
//     console.log(req.cookies.token)
// })

app.get("/read",(req,res)=>{
    let data=jwt.verify(req.cookies.token,"secret")
    console.log(data)
})
app.get("/",(req,res)=>{
    console.log(req.cookies)
res.send("hello")
})
// bcrypt.genSalt(10, function(err, salt) {           //encryption
//     bcrypt.hash("abcd", salt, function(err, hash) {
//   console.log(hash)
//     });
// });
// bcrypt.compare("abcd", "$2b$10$z/0gJW0nUCi96UnVijkz/unsxmW5VpH1bSd1l6TWbnIhjb4xrcGQG", function(err, result) {
//     console.log(result)
// });


app.get("/cookie",(req,res) =>{         //setting cookie
res.cookie("name","piyushrokaya");
res.send("done")
} 
    
)


app.get("/create",async(req,res)=>{
let user = await userModel.create({
    username:"piyush",
    age:18,
    email:"piyushrokaya600",
})
res.send(user)
})


app.get("/post/create",async(req,res)=>{
let post = await postModel.create({
    postdata:"I am data",
    user:"684dd24e5298e5325f0340c9",
    email:"piyushrokaya600",
})
let user=await userModel.findOne({_id:"684dd24e5298e5325f0340c9"})
user.posts.push(post._id);
user.save();  
res.send({post,user})    //to save where we dont use findone and update
})




const port=3000;
app.listen(port)
 console.log(`server running on http://localhost:${port}`);