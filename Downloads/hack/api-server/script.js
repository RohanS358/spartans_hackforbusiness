const express=require('express')
const app=express()
app.get('/',function(req,res){
res.send('helloworld')
})
const port = 3000;
app.listen(port,() => {
    console.log(`server running on http://localhost:${port}`);
});