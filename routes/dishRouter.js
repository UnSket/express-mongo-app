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
            .populate('comments.author')
            .then(dishes => res.json(dishes))
            .catch(next);
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then(dish => res.json(dish))
            .catch(next)
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.remove({})
            .then(dbResponse => res.json(dbResponse))
            .catch(next)
    });

dishRouter.route('/:dishId')
    .get((req,res,next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then(dish => res.json(dish))
            .catch(next)
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/'+ req.params.dishId);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        console.log(JSON.stringify(req.params), JSON.stringify(req.body));
        Dishes.findByIdAndUpdate(req.params.dishId, {$set: req.body}, {new: true})
            .then(dish => res.json(dish), e => console.error(e))
            .catch(next)
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
            .populate('comments.author')
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
                req.body.author = req.user._id;
                dish.comments.push(req.body);
                dish.save()
                    .then(dish => {
                        Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then(dish => res.json(dish.comments));
                    })
            })
            .catch(next)
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/'
            + req.params.dishId + '/comments');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

dishRouter.route('/:dishId/comments/:commentId')
    .get((req,res,next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                    res.json(dish.comments.id(req.params.commentId));
                }
                else if (dish == null) {
                    const err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    const err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(authenticate.verifyUser, async (req, res, next) => {
        try {
            const dish = await Dishes.findById(req.params.dishId)
                .populate('comments.author');
            if (dish == null) {
                const err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            const comment = dish.comments.id(req.params.commentId);
            if (!comment) {
                const err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);
            }


            const currentUser = req.user;
            if (!currentUser._id.equals(comment.author._id)) {
                const err = new Error('You could not modify alien comment');
                err.status = 403;
                return next(err);
            }


            if (req.body.rating) {
                comment.rating = req.body.rating;
            }
            if (req.body.comment) {
                comment.comment = req.body.comment;
            }
            await dish.save();

            const updatedDish = await Dishes.findById(dish._id)
                .populate('comments.author');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(updatedDish);
        } catch (e) {
            next(e);
        }
    })
    .delete(authenticate.verifyUser, async (req, res, next) => {
        try {
            const dish = await Dishes.findById(req.params.dishId).populate('comments.author');

            if (!dish) {
                const err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }

            const comment = dish.comments.id(req.params.commentId);

            if (!comment) {
                const err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);
            }

            const currentUser = req.user;
            if (!currentUser._id.equals(comment.author._id)) {
                const err = new Error('You could not modify alien comment');
                err.status = 403;
                return next(err);
            }


            dish.comments.id(req.params.commentId).remove();
            await dish.save();
            const updatedDish = await Dishes.findById(dish._id)
                .populate('comments.author');

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(updatedDish);
        } catch (e) {
            next(e);
        }
    });

module.exports = dishRouter;
