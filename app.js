//jshint esversion:6

const express = require("express");
// const router = express.Router();
const bodyParser = require("body-parser");
const session = require('express-session');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// const indexRouter = require('./routes/index');

const mysql = require('mysql');

const connection = mysql.createConnection({
  host  : 'localhost',
  user  : 'root',
  password : 'root',
  database  : 'ublog'
});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(logger('dev'));

// app.use('/', indexRouter); //index.js for all routes

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());



/* GET home page. */
app.get("/", (req, res)=>{
  res.render("landing",{title:`UBlog - Login`});
});
app.post("/login",(req, res)=>{
    //handle login
    const email = req.body.email;
    const pass =  req.body.pass;

    if (email && pass) {
		connection.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, pass], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = email;
        req.session.save();
        console.log(req.session);
        //take to homepage iff success
				res.redirect('/home');
			} else {
				res.render(`failed`, {title: `Login failed`});
			}
			res.end();
		});
	} else {
    //if no email address entered send to register page;
		res.render("register",{title:`UBlog - Register`});
		res.end();
	}
});


app.get("/register", (req, res)=>{
   res.render("register",{title:`UBlog - Register`});
});

app.post('/register' , (req, res) =>{
  // retreive values from webpage
let reg={
   name :  `${req.body.fname} ${req.body.lname}`,
   dob : req.body.dob,
   email : req.body.email,
   password : req.body.pass,
   user_type: 0
 };
  if(reg.password !== req.body.pass2){
    res.render('failed', {title: `pass missmatch`});
  }
  else{
    connection.query('SELECT * FROM user WHERE email = ?', [reg.email], (err, rows, fields)=>{
      if(err) console.log(err);
      if(!rows.length){
         connection.query(`INSERT INTO user SET ?`, reg,(err, results)=>{
           if (err) console.log(err);

           res.write(`<h1>REGISTRATION SUCCESS</h1>`);
           res.write(`<a href="/home> home </a>"`);
           res.send();
           res.end();
         });
      }
      else{
        res.send(`<h1>REGISTRATION duplicada</h1>`);
        res.end();
      }
    });
}
});

app.get("/testpage",(rq,rs)=>{
  rs.render("test",{title: "testpage"});
});


app.get("/home", function(req, res) {


 let posts = 14;

  if (req.session.loggedin) {
    res.render("home",{
      title:"uBlog | Home",
      posts: posts,
      post: "res/bg.png"
  });
  } else {
    res.send("not logged in");
  }
  res.end();
});







app.get("/logout",(rq,rs)=>{
  rq.session.destroy(function(){
      console.log("user logged out.");
   });
  rs.render("failed",{title:`logged out`});
  rs.end();
});




app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
module.exports = app;
