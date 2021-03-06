const express = require('express');
const bodyParser = require('body-parser');
const data = require('../persistence/persist_admin.js');

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

router.get('/availRes', async (req, res) => {
  try {
    //Retrieve and send a list of residents who are not assigned to rooms
    const residents = await data.availableResidents();
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

router.post('/assign', async (req, res) => {
  const roomID = req.body.roomID;
  const resID = req.body.resID;

  try {
    //Assign the resident with this ID to the room. Send back an updated list of residents assigned to this room
    const residents = await data.assignResident(roomID, resID);
    res.status(200).json({ residents: residents });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.post('/edit', async (req, res) => {
  const roomID = req.body.roomID;
  const prefix = req.body.roomPrefix;
  const number = req.body.roomNumber;
  const currentSearch = req.body.currentSearch;

  try {
    //Update the room's data in the database, send a response with the updated list of rooms
    const rooms = await data.editRoom(roomID, prefix, number, currentSearch);
    res.status(200).json({ rooms: rooms });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.post('/add', async (req, res) => {
  const prefix = req.body.roomPrefix;
  const number = req.body.roomNumber;

  try {
    //Create a new room in the database, send a response with the updated list of rooms
    const rooms = await data.addRoom(prefix, number);
    res.status(200).json({ rooms: rooms });
  }
  catch (e) {
    //Send response with error to client.
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

module.exports = router;
