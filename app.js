// Import necessary modules
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const createError = require('http-errors');
const mongoose = require('mongoose');
const session = require('express-session');

// Import defined routes
const indexRouter = require('./routes/indexRouter');
const usersRouter = require('./routes/userRouter');
const bookingRouter = require('./routes/bookingRouter');
const resourceRouter = require('./routes/resourceRouter');

const app = express(); // Create an Express application

// Define the port
const port = 3003;

app.use(session({
  secret: 'tadhg',
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.userId ? true : false;
  next();
});

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB
const url = 'mongodb://127.0.0.1:27017/workshopdb';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected correctly to server");
  })
  .catch((err) => {
    console.log(err);
  });

// Define routes
app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/booking', bookingRouter);
app.use('/resource', resourceRouter);

// Error handlers
app.use(function(req, res, next) {
  next(createError(404)); // 404 Error handler
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('pages/oops'); // General error handler
});

module.exports = app; // Export the Express application
