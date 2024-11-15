const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { route } = require("./user");

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registerUser = await User.register(newUser, password);
      console.log(registerUser);
      req.login(registerUser,(err)=>{
        if(err){
          return next(err);
        }
          req.flash("success", "welcome to wanderlust");
          res.redirect("/listings");
      })
    
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

saveRedirectUrl = (req, res, next) => {
  if (req.session.redirect) {
    res.locals.redirect = req.session.redirect;
  }
  next();
};


router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome back!",
  }),
  (req, res) => {
    const redirectUrl = req.session.redirect || "/listings";
    delete req.session.redirect; // Clear the session after using the redirect URL
    req.flash("success", "Welcome back to Wanderlust");
    res.redirect(redirectUrl);
  }
);


router.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next();
    }
    req.flash("success","you are logged out!");
    res.redirect("/listings");
  })
})

module.exports = router;
