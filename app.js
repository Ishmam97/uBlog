//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

app.use('/', indexRouter); //index.js for all routes






app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
module.exports = app;
