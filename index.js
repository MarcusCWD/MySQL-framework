const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
const csrf = require('csurf')
const cors = require('cors')

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// =========== set up CSRF ========== //
// global middleware to ignore csrf for API
const csrfInstance = csrf();
app.use(function (req, res, next) {
  // exclude /checkout/process_payment for CSRF
  if (req.url.slice(0,5)=="/api/") {
      return next()
  }
  csrfInstance(req, res, next)
})

// Share CSRF with hbs files
app.use(function(req,res,next){
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
}
  next();
})
app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
      req.flash('error_messages', 'The form has expired. Please try again');
      res.redirect('back');
  } else {
      next()
  }
});

// =========== set up cors ========== //
app.use(cors());

// =========== set up sessions ========== //
app.use(session({
  store: new FileStore(),
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true

}))

// =========== set up flash messages ========== //
app.use(flash())

// Register Flash middleware
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    res.locals.warning_messages = req.flash("warning_messages");
    next();
});

// =========== import in routes ========== //
const landingRoutes = require('./routes/landing.js');
const usersRoutes = require('./routes/users.js');
const api = {
  users: require('./routes/api/users')
}


async function main() {

  // Share the user data with hbs files (serverside token)
  app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
  })

  app.use('/', landingRoutes);
  app.use('/users', usersRoutes);
  app.use('/api/users', express.json(), api.users);

}

main();

app.listen(3000, () => {
  console.log("Server has started");
});
