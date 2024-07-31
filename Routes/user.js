const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const WrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const Localstrategy = require("passport-local");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})
router.post("/signup", WrapAsync(async(req,res)=>{
    try{
        let {username,email,password} = req.body;
     const newUser = new User({email,username});
     const registerdUser = await User.register(newUser , password);
    console.log(registerdUser);
    req.login(registerdUser,(err)=>{
        if(err){
            return next(err);
            }
           req.flash("success","Welcome to Wanderlust");
    res.redirect("/listings");
    })
    }
    catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}));


router.get("/login" , saveRedirectUrl,(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login",saveRedirectUrl, passport.authenticate("local" ,{ failureRedirect: '/login' , failureFlash:true}),async(req,res)=>{
let {username,password} = req.body;
req.flash("success","welcome back to wanderlust ");
console.log(req.user);
let redirectUrl = res.locals.redirectUrl || "/listings";
console.log(redirectUrl);
res.redirect(redirectUrl);
});


router.get("/logout" ,(req,res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
            }
            req.flash("success","Logged out successfully !");
            res.redirect("/listings");
    })
})



module.exports = router;