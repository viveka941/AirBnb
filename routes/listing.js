
const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage});
const mongoose = require("mongoose");
const {
  index,
  newListing,
  createListing,
  editListing,
  updateListing,
  deleteListing,
  showAllList,
} = require("../controllers/listings.js");
// Wrapper to handle async errors
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// Middleware to validate listing data
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((er) => er.message).join(", ");
    return next(new ExpressError(400, errMsg));
  }
  next();
};

router
  .route("/")
  .get(wrapAsync(index))
  // .post(isLoggedIn, validateListing, wrapAsync(createListing));
  .post(upload.single("listing[images]"), (req, res) => {
    res.send(req.file);
  });

// Route to render form for new listing
router.get("/new", isLoggedIn, newListing);

// Show route for a specific listing
router
  .route("/:id")
  .get(wrapAsync(showAllList))
  .put(isLoggedIn, isOwner, validateListing, wrapAsync(updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(deleteListing));

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(editListing));

module.exports = router;
