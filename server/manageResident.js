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

router.post('/edit', async (req, res) => {
  const resID = req.body.resID;
  const forename = req.body.forename;
  const surname = req.body.surname;
  const dietReq = req.body.dietReq;
  const allergies = req.body.allergies;
  const thickener = req.body.thickener;
  const diabetes = req.body.diabetes;
  const dnr = req.body.dnr;

  try {
    const residents = await data.editResident(resID, forename, surname, dietReq, allergies, thickener, diabetes, dnr);
    //Send updated list of residents back to client to display changes
    res.status(200).json({ residents: residents });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});


module.exports = router;
