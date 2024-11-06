const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError");
const listings = require("./routes/listing.js");

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

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

app.engine("ejs", ejsMate); // Set ejsMate as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

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

// Routes
app.get("/", (req, res) => {
  res.send("Hi, I am the root route.");
});

app.use("/listings", listings);

// reviews
// post route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.review.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
  })
);
// delete reviews
// delete reviews
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review ID from the `reviews` array in the Listing document
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the actual review document
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { err });
  // .send(message);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
