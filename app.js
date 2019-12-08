//jshint esversion:8

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
const util = require('util');
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



///post loader
function loadPosts(){
  return new Promise( ( resolve, reject ) => {

   connection.query('select * from user inner join (select * from post_picture inner join (select * from posts inner join (select friend_id from friends where user_id = ?) as T on posts.user_id = T.friend_id) as T on post_picture.post_id = T.id) as T on user.user_id = T.user_id;',[userID],(err , result, fields)=>{
                if ( err ) return reject( err );
                posts  = result;
                resolve( posts );
          } );
      } );
  }
app.get("/home", async (req, res)=>{

let numPosts = 0;
let unames ="";
var pics = [];
let postInfo = await loadPosts();
console.log(postInfo);
// connection.query('select * from posts inner join (select friend_id from friends where user_id = ?) as T on posts.user_id = T.friend_id',[userID],(err , result, fields)=>{
//   if(err) throw err;
//   else{
//     numPosts =  result.length;
//     connection.query('select picture from post_picture inner join (select * from posts inner join (select friend_id from friends where user_id = ?) as T on posts.user_id = T.friend_id) as T on post_picture.post_id = T.id;',
//     [userID], (err, result, fields)=>{
//        if(err) throw err;
//        else{
//         pictures = result;
//         for(var i in pictures){
//            pics.push(pictures[i].picture);
//         }
        if (req.session.loggedin) {
            res.render("home",{
              title:"uBlog | Home",
              posts: postInfo
            });
        }
        else {
        res.send("not logged in");
      }
//     }
//     });
//
//   }
// });
//
});

app.get("/newpost",(rq,rs)=>{
  rs.render("post",{title:"Make a new post",postRoute:"makepost"});
});

var postID = "";
var postPicPath = "";
function uploadP(req , res) {
  return new Promise((resolve , reject)=>{
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
           postPicPath = `res/${req.file.filename}`;
           let insertpost = 'insert into posts SET ?';
           let makepost = 'insert into make_posts SET ?';
           let postpic = 'insert into post_picture SET ?';
       connection.query(insertpost, {caption : req.body.caption ,body: req.body.desc, user_id:userID}, (err)=>{
             if (err) console.log("caption error");
              console.log("inserted caption and desc");
            connection.query('SELECT id FROM posts WHERE caption = ?',[caption],(err, result, fields)=>{
               if(err) console.log("error inpostid");
               else{
                     postID = result[0].id;
                     console.log(`post id is ${postID}`);
                        connection.query(makepost , {user_id:userID, post_id : postID}, (err)=>{
                            if (err) console.log(`error in makepost`);
                            else{
                                connection.query(postpic ,{post_id: postID, picture:`res/${req.file.filename}`},(err)=>{
                                  if (err) console.log("error in storing patj") ;
                                  else{
                                    console.log("path of post is");
                                    console.log(postPicPath);
                                    resolve("image stored");
                                  }
                                });
                          }
                          });
                }
               });
            });


      }
    });
  });
}


app.post('/makepost',(req , res)=>{
uploadP(req , res).then(res.render("post", {title:"Succesfully posted"})).catch(console.log("error"));

});

var userInfo={
  name: "",
  posts:[],
  dp: "",
  cp: "",
  friends:""  ,
  followers: "",
  bp:"",
  numposts : ""
};
function loadUserInfo() {
return new Promise((resolve , reject)=>{
  connection.query('select * from user where user_id = ?',[userID],(err, result, fields)=>{
    if(err) reject(err);
    userInfo.name = result[0].name;
    userInfo.dp = result[0].dp;
    userInfo.cp = result[0].cp;
    userInfo.bp = result[0].bp;
  });
  connection.query('select count(*) as friends from friends where user_id = ?', [userID],(err , result, fields)=>{
    if (err) reject(err);
    else{
      userInfo.friends = result[0].friends;
    }
  });
  connection.query('select count(*) as subs from follow where user_id = ?', [userID],(err , result, fields)=>{
    if (err) reject(err);
    else{
      userInfo.followers = result[0].subs;
    }
  });
  connection.query('select count(*) as numPosts from posts where user_id = ?', [userID], (err , result , fields)=>{
    if (err) reject(err);
    userInfo.numposts = result[0].numPosts;
    console.log('numposts  set to :');
    console.log(userInfo.numposts);
  });
  connection.query('select posts.id, posts.caption, posts.body, posts.time, post_picture.picture from posts inner join post_picture on posts.id = post_picture.post_id where posts.user_id = ?',[userID],(err, result, fields)=>{
    if (err) reject(err);
    console.log(result);
    // for (let  i = 0 ; i < userInfo.numposts; ++i){
    //   userInfo.posts.push(result[i]);
    // }
userInfo.posts = result;

    resolve(userInfo);
  });
});
}


app.get("/profile" ,(req , res)=>{
 loadUserInfo().then((userInfo)=>{
  res.render("profile", {title:"profile | uBlog" ,name:userInfo.name, numposts:userInfo.numposts,followers:userInfo.followers,friends:userInfo.friends, posts:userInfo.posts, dp: userInfo.dp,  bp: userInfo.bp,  cp: userInfo.cp});
}).catch((err)=>{
  console.log(err);
  res.send("failed to load profile");
});
});


app.get("/changeDP",(req , res ) => {
  res.render("post",{title:"Change dp",postRoute:"changedDP"});
});
app.post("/changedDP",(req , res)=>{

    uploadP(req , res).then(()=>{
       console.log(`picture path for dp is ${postPicPath}`);
       connection.query(`update user set dp = ? where user_id = ?`,[postPicPath, userID],(err)=>{
         if(err) console.log(err);
         else{
           console.log('changed dp succesfully');
         }
       });

    }).then(res.redirect("/profile"));
});

app.get("/changeBP",(req , res ) => {
  res.render("post",{title:"Change dp",postRoute:"changedBP"});
});
app.post("/changedBP",(req , res)=>{

  uploadP(req , res).then(()=>{
     console.log(`picture path for bp is ${postPicPath}`);
     connection.query(`update user set bp = ? where user_id = ?`,[postPicPath, userID],(err)=>{
       if(err) console.log(err);
       else{
         console.log('changed bp succesfully');
       }
     });

  }).then(res.redirect("/profile"));
});
app.get("/changeCP",(req , res ) => {
  res.render("post",{title:"Change cp",postRoute:"changedCP"});
});
app.post("/changedCP",(req , res)=>{
    uploadP(req , res).then(()=>{
       console.log(`picture path for cp is ${postPicPath}`);
       connection.query(`update user set cp = ? where user_id = ?`,[postPicPath, userID],(err)=>{
         if(err) console.log(err);
         else{
           console.log('changed cp succesfully');
         }
       });

    }).then(res.redirect("/profile"));
});

// app.get(`/followers` , (req , res)=>{
//   res.send("test");
// });

// app.get(`/friends` , (req , res)=>{
//   loadFriends(req, res).then(
//     res.render("friends", {title: `friendlist`})
//   );
// });
//
// var users = {};
// function loadSearch(req, res){
//   return new Promise((resolve , reject) => {
//     connection.query('select * from user where user_id != ?',[userID], (err, result , fields)=>{
//
//               users = result;
//               console.log('in function');
//               console.log(users);
//               resolve(users);
//     } );
//
//   });
// }
// app.get('/search', (req , res)=>{
//    loadSearch(req , res).then(res.send(users[0].name));
//
// });


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
