const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { route } = require("./user");
const { saveRedirectUrl } = require("../middleware.js");
const {
  signup,
  renderSignup,
  renderLoginFrom,
  login,
  logout,
} = require("../controllers/users.js");

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

router.route("/signup").get(renderSignup).post(wrapAsync(signup));

router
  .route("/login")
  .get(renderLoginFrom)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  );

router.get("/logout", logout);

module.exports = router;
