const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const User = require('../models/users');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.create({
    username: req.body.username,
    password: req.body.password
  }).then(user => {
    res.json(user)
  }).catch(error => next(error))
});

router.post('/login', (req, res, next) => {
  if(!req.session.user) {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
      res.statusCode = 401;
      res.end('You are not logged in');
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    User.findOne({username: username})
        .then((user) => {
          if (user === null) {
            const err = new Error('User ' + username + ' does not exist!');
            err.status = 403;
            return next(err);
          }
          else if (user.password !== password) {
            const err = new Error('Your password is incorrect!');
            err.status = 403;
            return next(err);
          }
          else if (user.username === username && user.password === password) {
            req.session.user = 'authenticated';
            res.end('You are authenticated!')
          }
        })
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    const err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
