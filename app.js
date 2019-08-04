//jshint esversion:6

const express = require("express");
// const router = express.Router();
const bodyParser = require("body-parser");
const session = require('express-session');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require('multer');
// const indexRouter = require('./routes/index');

const mysql = require('mysql');

const connection = mysql.createConnection({
  host  : 'localhost',
  user  : 'root',
  password : 'root',
  database  : 'ublogmain'
});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(logger('dev'));

// app.use('/', indexRouter); //index.js for all routes future update

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


//set image storage engine
const storage = multer.diskStorage({
  destination:'./public/res/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
// initupload
const upload = multer({
  storage: storage
}).single('photo1');

var userID = "";


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
    connection.query('SELECT user_id FROM user WHERE email = ?',[req.session.username],(err, result , fields)=>{
          if(err) console.log(err);
          else{
             userID = result[0].user_id;
          }
        });
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

let numPosts = 0;

var pics = [];
connection.query('select count(*) as postcount from posts',(err , result, fields)=>{
  if(err) throw err;
  else{
    numPosts =  result[0].postcount;
    console.log(result[0].postcount);
    connection.query('select picture from post_picture', (err, result, fields)=>{
       if(err) throw err;
       else{
        pictures = result;

        for(var i in pictures){
           pics.push([pictures[i].picture]);
          }

        }
       if (req.session.loggedin) {
         res.render("home",{
           title:"uBlog | Home",
           posts: numPosts,
           pics: pics
         });
       } else {
         res.send("not logged in");
       }
    });

  }
});

});

app.get("/newpost",(rq,rs)=>{
  rs.render("post",{title:"Make new post"});
});

var postID = "";
app.post('/makepost',(req , res)=>{
let caption = "";
let desc = "";
  upload(req, res, (err)=>{
     if(err) console.log(err);
     else {
       caption = req.body.caption;
       desc = req.body.desc;
       // console.log(req.file);
       let dir = req.file.path;
       // console.log(dir);
       let insertpost = 'insert into posts SET ?';
       let makepost = 'insert into make_posts SET ?';
       let postpic = 'insert into post_picture SET ?';
   connection.query(insertpost, {caption : req.body.caption ,body: req.body.desc, user_id:userID}, (err)=>{
         if (err) throw err;
          console.log("inserted caption and desc");
        connection.query('SELECT id FROM posts WHERE caption = ?',[caption],(err, result, fields)=>{
           if(err) console.log("error inpostid");
           else{
                 postID = result[0].id;
                 console.log(`post id is ${postID}`);
                    connection.query(makepost , {user_id:userID, post_id : postID}, (err)=>{
                        if (err) throw err;
                        else{
                            connection.query(postpic ,{post_id: postID, picture:`res/${req.file.filename}`},(err)=>{
                              if (err) throw err;
                              else{
                                console.log("image stored");
                              }
                            });
                      }
                      });
            }
           });
        });


     res.render("post", {title:"Succesfully posted"});
  }
});
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
