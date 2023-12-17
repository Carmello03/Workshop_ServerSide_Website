var express = require('express');
var userrouter = express.Router();
const User = require('../models/User');
const bookings = require('../models/Booking');
const bcrypt = require('bcrypt');

userrouter.get('/login', (req, res) => {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null;

  res.render('login', { message: errorMessage });
});

userrouter.get('/register', (req, res) => {
  res.render('registration');
});

userrouter.get('/delete', (req, res) => {
  res.render('deletion');
});

// Handle login form submission
userrouter.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
          return res.status(400).send('Email and password are required.');
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
          return res.status(401).send('Invalid credentials.');
      }

      // Compare provided password with hashed password in database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).send('Invalid credentials.');
      }

      // Successful login
      req.session.userId = user._id;
      res.redirect('/');
  } catch (error) {
      next(error); // Pass the error to the error-handling middleware
}
});

userrouter.post('/register', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
          return res.status(400).send('Email and password are required.');
      }

      // Check if the user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
          return res.status(400).send('User already exists with this email.');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user and save to the database
      const user = new User({
          email: email.toLowerCase(),
          password: hashedPassword
      });
      await user.save();

      // Directly log in the user by setting up the session
      req.session.userId = user._id;
      
      // Redirect to dashboard or another user-specific page
      res.redirect('/');
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
}
});

userrouter.get('/logout', (req, res) => {
  if (req.session) {
      // Destroy the session
      req.session.destroy(err => {
          if (err) {
              // Handle error
              console.error('Error destroying session:', err);
              return res.status(500).send('Error destroying session');
          } else {
              res.clearCookie('connect.sid'); 
              res.redirect('/');
          }
      });
  } else {
      res.redirect('/');
  }
});

userrouter.post('/delete', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(403).send('User not logged in');
      }

      // booking deletions
      await bookings.deleteMany({ email: user.email });

      // User Deletion
      await User.deleteOne({ _id: req.session.userId });

      // Session z
      req.session.destroy(err => {
          if (err) {
              console.error('Error destroying session:', err);
              return res.status(500).send('Error destroying session');
          }

          res.clearCookie('connect.sid');
          res.redirect('/');
      });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
}
});

module.exports = userrouter;
