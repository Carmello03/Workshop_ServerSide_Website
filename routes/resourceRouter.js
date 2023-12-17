const express = require('express');
const router = express.Router();

// Render about page
router.get('/about', (req, res) => {
  res.render('resources/about');
});

// Render help page
router.get('/help', (req, res) => {
  res.render('resources/help');
});

module.exports = router;
