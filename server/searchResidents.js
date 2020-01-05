const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');

const router = express.Router();

router.get('/', async (req, res) => {
  const userID = req.decoded.id;
  const username = req.decoded.username;
  const filter = req.query.filter;

  try {
    const residents = await data.getResidents(filter);
    //Sends array of residents with info. Also sends username back to be added to navbar (when user is already logged in but refreshes the page).
    //Sends success which can be checked by client.
    res.status(200).json({ success: true, residents: residents, username: username });
  }
  catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Server error!' });
  }
});

module.exports = router;
