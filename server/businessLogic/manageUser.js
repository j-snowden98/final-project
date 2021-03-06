const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const data = require('../persistence/persist_admin.js');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/search', async (req, res) => {
  const filter = req.query.filter;

  try {
    const users = await data.searchUsers(filter);
    console.log(users);
    return res.status(200).json({ users: users });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.get('/permissions', async (req, res) => {
  const userID = req.query.userID;

  try {
    const permissions = await data.getPermissions(userID);
    console.log(permissions);
    return res.status(200).json({ permissions: permissions });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.post('/register', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;
  const permissions = req.body.permissions;

  try {
    //Creates hashed password to be stored in DB
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, async function(err, hash) {
        if(!err) {
          console.log(hash);
          //Uses DB model to save user with credentials, role and permissions to the database
          const users = await data.addUser(username, hash, role, permissions);
          res.status(200).json({ users: users });
        }
      });
    });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.post('/edit', async (req, res) => {
  const userID = req.body.userID;
  const username = req.body.username;
  const role = req.body.role;
  const permissions = req.body.permissions;
  const currentSearch = req.body.currentSearch;

  try {
    const users = await data.editUser(userID, username, role, currentSearch);
    if (await users) {
      const pmsnSet = await data.setPermissions(userID, permissions);
      if (await pmsnSet) {
        res.status(200).json({ users: users });
      }
    }

  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.post('/password', async (req, res) => {
  const userID = req.body.userID;
  const password = req.body.password;

  try {
    //Creates hashed password to be stored in DB
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, async function(err, hash) {
        if(!err) {
          //If password has hashed successfully, update the password in the database
          await data.resetPassword(userID, hash);
          res.status(200).json({ success: true });
        }
      });
    });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

router.post('/deactivate', async (req, res) => {
  const userID = req.body.userID;
  try {
    //Attempt to deactivate the user account. Send back an updated list of users to the client
    users = await data.deactivateUser(userID);
    res.status(200).json({ users: users });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }
});

module.exports = router;
