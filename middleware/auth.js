module.exports = {
  ensureAuth: function (req, res, next) {
    // if (req.isAuthenticated()) {
    //   return next();
    // } else {
    //   res.redirect("/");
    // }
    if (req.session && req.user) {
      // User is authenticated, proceed to the next middleware/route handler
      return next();
    } else {
        // User is not authenticated, send an appropriate response
        res.status(401).json({ error: 'Not authenticated' });
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
        res.status(401).json({ error: 'User is authenticated' });
    }
  },
  ensureAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role == 'admin') {
      return next();
    } else {
      res.status(401).json({ error: 'User is not authenticated as admin' });
    }
  },
};
