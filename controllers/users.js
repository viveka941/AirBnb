
const User = require("../models/user");

module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registerUser = await User.register(newUser, password);
    console.log(registerUser);
    req.login(registerUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "welcome to wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginFrom = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  req.session.redirectUrl = null; // Clear after use
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next();

    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};