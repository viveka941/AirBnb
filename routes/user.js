const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

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
      req.flash("success", "welcome to wanderlust");
      res.redirect("/listings");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
    successRedirect: "/listings",
    successFlash: "Welcome back!",
  })
);

module.exports = router;
