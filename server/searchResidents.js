const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');

const router = express.Router();

router.get('/', async (req, res) => {
  const userID = req.decoded.id;
  const filter = req.query.filter;

  try {
    const residents = await data.getResidents(filter);
    res.status(200).json({ success: true, residents: residents });
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Server error!' });
  }
});

module.exports = router;
