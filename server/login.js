const express = require('express');
const bodyParser = require('body-parser');
const data = require('./db/model_mysql.js');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";

const router = express.Router();

async function addUser(username, password, role) {
  bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
          if(!err) {
            console.log(hash);
            data.addUser(username, hash, role)
          }
      });
  });
}

async function attemptLogin(username, password, cb) {
  const user = await data.getHash(username);
  let hash = await user.password;
  let userID = await user.id;
  console.log(hash);
  bcrypt.compare(password, hash, function(err, res) {
    console.log(res);
    return (userID);
  });
}

module.exports = {
  addUser: addUser,
  attemptLogin: attemptLogin
};
