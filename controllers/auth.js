const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
    currentPage:'login'
  });
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    // req.flash("errors", validationErrors);
    // return res.redirect("/login");
    return res.status(400).json({ errors: validationErrors });
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    // if (err) {
    //   return next(err);
    // }
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // if (!user) {
    //   req.flash("errors", info);
    //   return res.redirect("/login");
    // }
    if (!user) {
      return res.status(401).json({ error: "Authentication failed." });
    }
    req.logIn(user, (err) => {
      // if (err) {
      //   return next(err);
      // }
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // req.flash("success", { msg: "Success! You are logged in." });
      // res.redirect(req.session.returnTo || "/profile");
      req.session.user = user;
      console.log('Session ID:', req.sessionID);
      console.log('Session:', req.session);

      res.json({ message: "Success! You are logged in.", user });
    });
  })(req, res, next);
};

exports.logout = (req, res) => {

  req.logout(() => {
    console.log('User has logged out.')
  })

  req.session.destroy((err) => {
    // if (err)
    //   console.log("Error : Failed to destroy the session during logout.", err);
    if (err) {
      console.log("Error: Failed to destroy the session during logout.", err);
      return res.status(500).json({ message: "Failed to destroy the session during logout." });
    }
    req.user = null;
    res.json({ message: "Logged out successfully." });
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
    currentPage:'signup'
  });
};

exports.postSignup = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/profile");
        });
      });
    }
  );
};
