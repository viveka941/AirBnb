const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const mongoose = require("mongoose");
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

// Index route to show all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
  })
);

// Route to render form for new listing
router.get("/new", isLoggedIn, (req, res) => {
  //console.log(req.user);
  // console.log(req.path, "..", req.originalUrl);

  res.render("listings/new.ejs");
});

//create route
router.post(
  "/",
  validateListing,

  wrapAsync(async (req, res, next) => {
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "New Listing created");
    res.redirect("/listings");
  })
);

// Show route for a specific listing
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    // Check if `id` is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid listing ID.");
      return res.redirect("/listings");
    }

    // Proceed to find listing if ID is valid
    const listing = await Listing.findById(id).populate({
      path: "review",
      populate: {
        path: "owner",
      },
    });

    if (!listing) {
      req.flash("error", "Listing does not exist.");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  })
);
//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);
// Update route to modify a specific listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,

  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  })
);

// Delete route to remove a specific listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
      throw new ExpressError(404, "Listing not found for deletion");
    }
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
  })
);

module.exports = router;
