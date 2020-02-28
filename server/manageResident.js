const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/admin_model_mysql.js');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/search', async (req, res) => {
  const filter = req.query.filter;

  try {
    const residents = await data.searchResidents(filter);

    res.status(200).json({ residents: residents });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});


module.exports = router;
