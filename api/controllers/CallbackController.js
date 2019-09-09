const Callback = require('../models/CallbackModel');
const SE = require('../../config/error.config');
const User = require('../models/UserModel');
const SettingsModel = require('../models/SettingsModel');
const Balance = require('../models/BalanceModel');
const Subject = require('../models/SubjectModel');

module.exports = {
    setCallback: setCallback,
    getCallbacks: getCallbacks,
    userCallbackAccess: userCallbackAccess,
    callbackAccess: callbackAccess,
    declineCallback: declineCallback
};

function setCallback(req, res) {
    const callback = new Callback(req.body);

    Subject
        .findOne({_id: callback.subject})
        .exec((err, subject) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            Balance
                .aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            status: true,
                            paymentStatus: 2,
                            type: {$ne: 8}
                        }
                    }, {
                        $group: {
                            _id: '$user',
                            total: {$sum: "$cashFlow"}
                        }
                    }
                ])
                .exec((err, balance) => {
                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                    if (req.user.role.level > 2) {
                        callback.caller = req.user._id;
                        Callback
                            .findOneAndUpdate({_id: callback._id}, callback, {
                                upsert: true,
                                new: true
                            })
                            .exec((err, data) => {
                                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                res._end({callback: data});
                            })
                    } else {
                        if (!req.body.user) callback.user = req.user._id;
                        if (balance[0].total > subject.callbackCost) {
                            Callback
                                .findOneAndUpdate({_id: callback._id}, callback, {
                                    upsert: true,
                                    new: true
                                })
                                .exec((err, data) => {
                                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                    if (data.status === 'Called') {
                                        Balance
                                            .findOneAndUpdate({
                                                user: callback.user,
                                                type: 5,
                                                paymentStatus: 0,
                                                cashFlow: 0 - limit.callbackCost,
                                                callback: data._id
                                            }, {paymentStatus: 2, status: true}, {
                                                upsert: true,
                                                new: false
                                            })
                                            .exec((err, complete) => {
                                                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                                return res._end({callback: data})
                                            })
                                    } else {
                                        let balance = new Balance();
                                        balance.cashFlow = 0 - subject.callbackCost;
                                        balance.user = req.user._id;
                                        balance.type = 5;
                                        balance.paymentStatus = 0;
                                        balance.callback = data._id;
                                        balance.save(function (err) {
                                            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                                            res._end({callback: data});
                                        });
                                    }
                                })
                        } else {
                            return res._end(new SE('Not enough points', SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                        }
                    }
                });
        });
}

function callbackAccess(req, res) {
    Subject
        .findOne({_id: req.query.subject})
        .exec((err, subject) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            Balance
                .aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            status: true,
                            paymentStatus: 2,
                            type: {$ne: 8}
                        }
                    }, {
                        $group: {
                            _id: '$user',
                            total: {$sum: "$cashFlow"}
                        }
                    }
                ])
                .exec((err, balance) => {
                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                    Callback.find({
                        user: req.user._id,
                        subject: req.query.subject,
                        status: {$ne: 'Called'}
                    }, function (err, callback) {
                        if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

                        let result = {};
                        result.isEnought = subject.callbackCost < balance[0].total;
                        result.isRequested = callback.length > 0;
                        return res._end(result)
                    })
                });
        })
}

function getCallbacks(req, res) {

    Callback
        .find()
        .populate('subject user')
        .populate({path: 'caller', select: 'name lastName username -_id'})
        .exec((err, callbacks) => {
            if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            //Sort by two fields in virtual property
            callbacks = callbacks.sort((cbA, cbB)  => {
                return cbB.callDateTime - cbA.callDateTime;
            });

            if (req.user.role.level === 5) {
                let arr = [];
                callbacks.forEach(function (item) {
                    if (!item.subject || !item.user) {
                    } else {
                        arr.push(item);
                    }
                });
                return res._end({callbacks: arr});
            } else {
                User
                    .findOne({_id: req.user._id})
                    .exec((err, user) => {
                        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                        let arr = [];
                        callbacks.forEach(function (item) {
                            if (!item.subject || !item.user) {
                            } else {
                                if (user.subjects.indexOf(item.subject._id) >= 0) {
                                    arr.push(item);
                                }
                            }
                        });
                        return res._end({callbacks: arr});
                    })
            }
        });
}

function declineCallback(req, res) {
    Callback
        .find({user: req.user._id, subject: req.body.subject})
        .sort({createdAt: -1})
        .exec((err, userCallbacksBySubject) => {
            if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            let currentCallback = userCallbacksBySubject[0];

            if (currentCallback.hasOwnProperty('status') && currentCallback.status === 'Called') {
                return res._end(new SE('Can\'t decline called callback.', SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.INVALID_DECLINE_CALLED_CALLBACK));
            } else {
                Callback
                    .deleteOne({_id: currentCallback._id})
                    .exec((err, callback) => {
                        if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_DELETE));

                        Balance
                            .deleteOne({
                                callback: currentCallback._id,
                                user: currentCallback.user,
                                type: 5,
                                paymentStatus: 0
                            })
                            .exec((err, complete) => {
                                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                return res._end({success: true, message: 'Callback declined.'});
                            })
                    })
            }
        })
}

function userCallbackAccess(req, res) {
    Callback
        .find({user: req.user._id})
        .sort({createdAt: -1})
        .exec((err, callbacks) => {
            if (err) return res._end(new SE(err, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            if (callbacks.length === 0) return res._end({access: true});
            if (callbacks[0].status === 'Unavailable' || callbacks[0].status === 'Uncalled') return res._end({access: false});
            res._end({access: true});
        })
}
