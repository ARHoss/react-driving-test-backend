// Getting Express module
const express = require("express");
// Express app varibale
const app = express();
// Interacts with database & create models
const mongoose = require("mongoose");
// Handles authorization - contains strategies for authentication - local strategy
const passport = require("passport");
// Handles cookies and sessions
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const cors = require('cors');
//Use forms for put / delete
const methodOverride = require("method-override");
// Helps in creating flash notification for login
const flash = require("express-flash");
// Logger for the application - tells what requests are being made
const logger = require("morgan");
// Used to connect to Database
const connectDB = require("./config/database");

// Linking to routes
const mainRoutes = require("./routes/main");
const questionRoutes = require("./routes/questions");


// Environment variables
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

// Tells Express that EJS Template Engine is used
app.set("view engine", "ejs");

// Tells Express to make public folder accessible to public
app.use(express.static("public"));

// Parses data for express to read request object
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging only used during development - Creates log for views
if(process.env.NODE_ENV === 'development'){
  app.use(logger("dev"));
}

//Use forms for put / delete
app.use(methodOverride("_method"));


// Cors

// Old code
// app.use(cors({
//   origin: 'http://localhost:5000',  // Adjust this to your React app's address
//   credentials: true
// }));

// app.use(cors({
//   origin: 'https://qvch53-5000.csb.app',  // Adjust this to your React app's address
//   credentials: true
// }));

const allowedOrigins = ['https://qvch53-5000.csb.app', 'http://localhost:5000'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));


// Saves session into database
app.use(
  session({
    // Makes it harder to for cookies to reverse-engineer
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: false,  // Set to true if you're using HTTPS
      secure: true,  // Set to true if you're using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'None' // new code
    },
    // Storing session info in database
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);


// Passport handling authentication
app.use(passport.initialize());
// Passport handling sessions
app.use(passport.session());

// Helps in creating flash messages in front-end
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/question", questionRoutes);
app.use((req, res, next) => {
  res.render('errors/page-not-found.ejs')
})

//Server Running
app.listen(process.env.PORT, () => {
  let mode = process.env.NODE_ENV != undefined ? process.env.NODE_ENV : 'Production';
  console.log(`Server running in ${mode} mode on port ${process.env.PORT}`);
});
