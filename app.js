if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listingRoutes = require("./Routes/listing.js");
const reviewRoutes = require("./Routes/review.js");
const userroutes = require("./Routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const Localstrategy = require("passport-local");
const User = require("./models/user.js");


app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

const dbUrl = process.env.ATLAS_URL;

main().then(()=>{
  console.log("connected to DB");
})
.catch(err => console.log(err));


async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
     secret: process.env.SECRET,
  },
  touchAfter: 24*60*60,

})

store.on("error" , ()=>{
    console.log("session store error",err);
})

const sessionOptions={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly:true,
  }
}

// app.get("/", (req, res) => {
//   res.send("hello world");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.successMsg = req.flash("success")
  res.locals.errorMsg = req.flash("error")
  res.locals.currUser = req.user;   ///this can be acced by any ejs file 
  next();
})

app.get("/demouser", async (req, res) => {
  let fakeuser = new User({
    username: "demouser",
    email: "demouser@gmail.com",
  })
  let registereddemouser = await User.register(fakeuser,"Dibyadarshi-Mohanty");
  res.send(registereddemouser);
});


app.use("/listings",listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes )
app.use("/", userroutes )



// 404 route
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("listings/error", { message });
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
