const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const authenticate = require('../authenticate');

const Promotion = require('../models/Promotion');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());
promotionRouter.use(morgan('dev'));

promotionRouter.route('/')
    .get((req,res,next) => {
        Promotion.find({})
            .then(promotions => res.json(promotions))
            .catch(next);
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Promotion.create(req.body)
            .then(promotion => res.json(promotion))
            .catch(next)
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Promotion.remove({})
            .then(dbResponse => res.json(dbResponse))
            .catch(next)
    });

promotionRouter.route('/:promotionId')
    .get((req,res,next) => {
        Promotion.findById(req.params.promotionId)
            .then(promotion => res.json(promotion))
            .catch(next)
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotiones/'+ req.params.promotionId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        console.log(JSON.stringify(req.params), JSON.stringify(req.body));
        Promotion.findByIdAndUpdate(req.params.promotionId, {$set: req.body}, {new: true})
            .then(promotion => res.json(promotion), e => console.error(e))
            .catch(next)
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Promotion.findByIdAndDelete(req.params.promotionId)
            .then(promotion => res.json(promotion))
            .catch(next)
    });

module.exports = promotionRouter;
