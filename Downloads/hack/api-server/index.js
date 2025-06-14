const express=require('express');

const path=require('path');
const app=express();
const userModel = require('./userModel')


app.use(express.json())//parsers
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname,'public')))

app.set('view engine','ejs');



app.get('/',function(req,res){
res.render('index')
}) 

app.get('/frontend',function(req,res,next){
res.send('error');
throw new Error("hello I am error");
})

app.get('/create',async(req,res) => {
    res.send("to create");
    let createUser=await userModel.create({
        name:"piyush",
        email:"piyushrokaya600@gmail.com",
        username:"piyushrokaya"
    })
    res.send(createUser)
})

const port = 3000;
app.listen(port,() => {
    console.log(`server running on http://localhost:${port}`);
});

app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.status(500).send("something is broken")
})
