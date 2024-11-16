const Listing = require("./models/listing")
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; // Save original URL
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl; // Pass to response locals
  }
  next();
};


module.exports.isOwner =async (req,res,next)=>{
   const { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of the listings");
     return res.redirect(`/listings/${id}`);
    }
    next();
}