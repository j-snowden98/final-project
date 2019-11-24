const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', async (req, res) => {
  const userID = req.body.userID;
  const filter = req.body.filter;

  try {
    const residents = await data.getResidents(filter);
    res.status(200).send(residents);
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

module.exports = router;
