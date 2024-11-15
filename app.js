const express = require("express");
const session = require("express-session"); // Import express-session
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");

const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");
const listings = require("./routes/listing.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const passport = require("passport");
const localStrategy=require("passport-local");
const User = require("./models/user.js");
const userRouter=require("./routes/user.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

// MongoDB connection
async function main() {
  await mongoose.connect(mongo_url);
}
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });

// Set up the view engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

// Set up session middleware
const sessionOption = {
    secret: "mysuperstring",
    resave: false,
    saveUninitialized: true,
  cookie:{
    expires: Date.now() +7 *24 *60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set up flash messages in all routes
app.use((req,res,next)=>{
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
 res.locals.currUser=req.user;
  next();
})
app.use("/listings",listings);
app.use("/",userRouter)


app.get("/demouser",async (req,res)=>{
  let fakeuser = new User({
    email:"student@gmail.com",
    username:"student"
  });
   let ragisterUser = await User.register(fakeuser,"Helloworld");
   res.send(ragisterUser);
})


app.use("/listings",listings);


app.get("/reqcount", (req, res) => {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send(`you sent a request ${req.session.count} times`);
});

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;
  if (name == "anonymous") {
    req.flash("error", "user not registerd successfull");
  } else {
    req.flash("success", "user registerd successfull");
  }
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  
  res.render("listings/page.ejs", { name: req.session.name });
});


// Middleware for async error handling
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// Validate Review
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((er) => er.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Main route
app.get("/", (req, res) => {
  res.send("Hi, I am the root route.");
});

app.use("/listings", listings);

// Reviews
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review saved");
    res.redirect(`/listings/${listing._id}`);
  })
);

app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { err });
});

// Server start
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
