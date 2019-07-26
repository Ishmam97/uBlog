//jshint esversion:6
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get("/", (req, res)=>{
  res.render("landing",{title:`UBlog - Login`});
});
router.post("/login",(req, res)=>{
    // res.send(`email = ${req.body.email}`);
    //handle login
    const email = req.body.email;
    const pass =  req.body.pass;
    //failed login
    // res.render("failed",{title:`Login failed`, type:"0"});
    if(req.body.email==="admin" && req.body.pass==="admin"){
    console.log(`${req.body.email} ${req.body.pass}`)
    res.redirect("/logout");
    }
    else{
    res.redirect("/register");
    }
    //take to homepage iff success
});
router.get("/register", (req, res)=>{
   res.render("register",{title:`UBlog - Register`});
});

router.get("/testpage",(rq,rs)=>{
  rs.render("test");
});









router.get("/logout",(rq,rs)=>{
  rs.render("failed",{title:`logged out`});
});
module.exports = router;
