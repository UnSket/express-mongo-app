const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const Dishes = require('../models/Dish');
const authenticate = require('../authenticate');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());
dishRouter.use(morgan('dev'));

dishRouter.route('/')
    .get(authenticate.verifyUser, (req,res,next) => {
        Dishes.find({})
            .then(dishes => res.json(dishes))
            .catch(next);
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.create(req.body)
            .then(dish => res.json(dish))
            .catch(next)
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Dishes.remove({})
            .then(dbResponse => res.json(dbResponse))
            .catch(next)
    });

dishRouter.route('/:dishId')
    .get((req,res,next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => res.json(dish))
            .catch(next)
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/'+ req.params.dishId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        console.log(JSON.stringify(req.params), JSON.stringify(req.body));
        Dishes.findByIdAndUpdate(req.params.dishId, {$set: req.body}, {new: true})
            .then(dish => res.json(dish), e => console.error(e))
            .catch(next)
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Dishes.findByIdAndDelete(req.params.dishId)
            .then(dish => res.json(dish))
            .catch(next)
    });

const generate404 = (text, next) => {
    const error = new Error(text);
    return next(error);
};

dishRouter.route('/:dishId/comments')
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (!dish) {
                    return generate404('Dish not found', next);
                }
                res.json(dish.comments);
            })
            .catch(next)
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (!dish) {
                    return generate404('Dish not found', next);
                }
                dish.comments.push(req.body);
                dish.save()
                    .then(dish => res.json(dish.comments))
            })
            .catch(next)
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/'
            + req.params.dishId + '/comments');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (!dish) {
                    return generate404('Dish not found', next);
                }
                dish.comments = [];
                dish.save()
                    .then(dish => res.json(dish));
            })
            .catch(next)
    });

module.exports = dishRouter;
