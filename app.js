// jshint esversion:6
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));

//route handling
app.get('/', function (req, res) {
  //send landing page;
  res.sendFile(__dirname+"/landing.html");
});
app.post('/login', (req, res)=>{
  res.send('hello');
})
app.get('/home',(req, res)=>{
  res.sendFile(__dirname+"/homepage.html");
})
app.get('/profile',(req,res)=>{
  res.sendFile(__dirname+"/profile.html");
})
// starting server

app.listen(3000, ()=>{
  console.log("server started on port 3000");
});
