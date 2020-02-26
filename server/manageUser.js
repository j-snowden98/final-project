const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/admin_model_mysql.js');

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

router.post('/register', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  try {
    //Creates hashed password to be stored in DB
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, async function(err, hash) {
        if(!err) {
          console.log(hash);
          //Uses DB model to save user with credentials and role to DB
          await data.addUser(username, hash, role);
          res.status(200).send({ 'user': username });
        }
      });
    });
  }
  catch (e) {
    console.log(e);
    return res.status(500).send('Server error!');
  }

});
module.exports = router;
