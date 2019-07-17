// jshint esversion:6
const express = require('express');
const app = express();


//route handling
app.get('/', function (req, res) {
  //send landing page;

});


// starting server

app.listen(3000, ()=>{
  console.log("server started on port 3000");
});
