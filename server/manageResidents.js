const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');
const getResidents = require('.searchResidents.js');

const router = express.router();


module.exports = router;
