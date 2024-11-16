const Listing = require("../models/listing")
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.newListing = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  await newlisting.save();
  req.flash("success", "New Listing created");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found for deletion");
  }
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};

module.exports.showAllList = async (req, res, next) => {
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
};