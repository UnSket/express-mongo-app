const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const authenticate = require('../authenticate');

const Leaders = require('../models/Leader');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());
leaderRouter.use(morgan('dev'));

leaderRouter.route('/')
    .get((req,res,next) => {
        Leaders.find({})
            .then(leaders => res.json(leaders))
            .catch(next);
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Leaders.create(req.body)
            .then(leader => res.json(leader))
            .catch(next)
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Leaders.remove({})
            .then(dbResponse => res.json(dbResponse))
            .catch(next)
    });

leaderRouter.route('/:leaderId')
    .get((req,res,next) => {
        Leaders.findById(req.params.leaderId)
            .then(leader => res.json(leader))
            .catch(next)
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /leaderes/'+ req.params.leaderId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        console.log(JSON.stringify(req.params), JSON.stringify(req.body));
        Leaders.findByIdAndUpdate(req.params.leaderId, {$set: req.body}, {new: true})
            .then(leader => res.json(leader), e => console.error(e))
            .catch(next)
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Leaders.findByIdAndDelete(req.params.leaderId)
            .then(leader => res.json(leader))
            .catch(next)
    });

module.exports = leaderRouter;
