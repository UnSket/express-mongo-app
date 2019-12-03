const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const passport = require('passport');

const User = require('../models/User');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, body) => {
    if (err) {
      return next(err);
    }
    passport.authenticate('local')(req, res, () => {
      res.json({success: true, status: 'Registration Successful!'});
    });
  })
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({success: true, status: 'You are successfully logged in!'});
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
