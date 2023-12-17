const express = require('express');
const router = express.Router();

// Render the home page
router.get('/', (req, res) => {
  res.render('index', { title: 'Workshop Registration' });
});

module.exports = router;
