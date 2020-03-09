const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/admin_model_mysql.js');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/search', async (req, res) => {
  const filter = req.query.filter;

  try {
    const rooms = await data.searchRooms(filter);

    res.status(200).json({ rooms: rooms });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.get('/roomRes', async (req, res) => {
  const roomID = req.query.roomID;

  try {
    //Retrieve and send a list of residents that are assigned to this room
    const residents = await data.loadRoomResidents(roomID);
    res.status(200).json({ residents: residents });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.post('/unassign', async (req, res) => {
  const roomID = req.body.roomID;
  const resID = req.body.resID;

  try {
    //Unassign the resident from the room. Send back an updated list of residents assigned to the room with that id
    const residents = await data.unassignResident(roomID, resID);
    res.status(200).json({ residents: residents });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

module.exports = router;
