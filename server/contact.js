const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');
const jwt = require('jsonwebtoken');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/all', async (req, res) => {
  //username, password, role

});

module.exports = router;
