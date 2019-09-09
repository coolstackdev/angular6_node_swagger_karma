const Subscription = require('../models/SubscriptionModel');
const Balance = require('../models/BalanceModel');
const BalanceController = require('../controllers/BalanceController');
const Subject = require('../models/SubjectModel');
const SE = require('../../config/error.config');
const cron = require('node-cron');
const Settings = require('../models/SettingsModel');
const User = require('../models/UserModel');
const helper = require('../helper/NotificationHelper');

module.exports = {
    getSubscriptionsManage: getSubscriptionsManage,
    getSubscriptions: getSubscriptions,
    setSubscription: setSubscription,
    updateSubscription: updateSubscription,
    deleteSubscription: deleteSubscription,
    findSubscription: findSubscription,
    buySubject: buySubject,
    activeSubscriptions: activeSubscriptions,
    findEnding: findEnding
};

function getSubscriptionsManage(req, res) {
    Subscription
        .find()
        .sort({promoCode: -1, validTo: 1, price: -1})
        .exec((err, subscriptions) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({subscriptions: subscriptions});
        });
}

function findSubscription(req, res) {
    Subscription
        .findOne({offlineCode: req.query.code})
        .collation({locale: 'en', strength: 2})
        .exec((err, subscriptions) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({subscription: subscriptions});
        });
}

function getSubscriptions(req, res) {
    const dateEndOfToday = new Date();
    dateEndOfToday.setHours(0, 0, 0, 0);

    Subscription
        .find({
            $or: [
                {
                    status: true,
                    repeatable: true,
                    promoCode: {
                        $exists: false
                    },
                    $or: [
                        {
                            validTo: {
                                $gt: dateEndOfToday
                            }
                        }, {
                            validTo: {
                                $exists: false
                            }
                        }
                    ]
                },
                {
                    status: true,
                    repeatable: false,
                    promoCode: {
                        $exists: false
                    },
                    validTo: {
                        $exists: false
                    }
                }
            ]
        })
        .exec((err, subscriptions) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({subscriptions: subscriptions});
        });
}

function setSubscription(req, res) {
    if (req.body._id) {
        Subscription
            .findOneAndUpdate({_id: req.body._id}, req.body, {
                upsert: true,
                new: true
            })
            .exec((err, subscription) => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                res._end({subscription: subscription});
            })
    } else {
        const subscription = new Subscription(req.body);
        subscription
            .save((err, subscription) => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                res._end({subscription: subscription});
            });
    }
}

function updateSubscription(req, res) {
    res._end();
    // TODO: deprecated
    // const subscription = new Subscription(req.body);
    // if (subscription.status === 3)
    //     return res._end(new SE('The subscription was closed', SE.STATUS.FORBIDDEN, SE.CODE.ERROR_EDIT_CLOSED_SUBSCRIPTION));
    //
    // Subscription
    //     .updateOne({_id: subscription._id}, subscription, {new: true})
    //     .exec((err, data) => {
    //         if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
    //         res._end({subscription: data});
    //     })
}

function deleteSubscription(req, res) {
    let ids = req.query.ids.split(',');
    Subscription
        .deleteMany({'_id': {$in: ids}})
        .exec((err, subs) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            return res._end({success: true});
        });
}

function buySubject(req, res) {
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
        .exec((err, data) => {
            if (err) return new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND);
            if (!data[0]) return res._end(new SE("Not enough points", SE.STATUS.PAYMENT_REQUIRED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));

            Balance.findOne({
                user: req.user._id,
                subjects: req.body.subject,
                status: true,
                grade: req.user.grade,
                type: 4,
                validTo: {$exists: true}
            }, function (err, bal) {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                console.log(bal);
                if (bal) {
                    const balance = new Balance();
                    Subject.findOne({_id: req.body.subject}, function (err, subject) {
                        if (err) return new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND);
                        switch (req.body.period) {
                            case 'Week':
                                if (data[0].total >= subject.costWeek) {
                                    balance.validTo = bal.validTo.setDate(bal.validTo.getDate() + 7);
                                    balance.cashFlow = 0 - subject.costWeek;
                                } else return res._end(new SE("Not enough points", SE.STATUS.PAYMENT_REQUIRED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                                break;
                            case 'Month':
                                if (data[0].total >= subject.costMonth) {
                                    balance.validTo = bal.validTo.setDate(bal.validTo.getDate() + 30);
                                    balance.cashFlow = 0 - subject.costMonth;
                                } else return res._end(new SE("Not enough points.", SE.STATUS.PAYMENT_REQUIRED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                                break;
                            case 'Year':
                                if (data[0].total >= subject.costYear) {
                                    balance.validTo = bal.validTo.setDate(bal.validTo.getDate() + 365);
                                    balance.cashFlow = 0 - subject.costYear;
                                } else return res._end(new SE(err.message, SE.STATUS.PAYMENT_REQUIRED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                                break;
                        }
                        if (balance.validTo) {
                            balance.user = req.user._id;
                            balance.subjects.push(req.body.subject);
                            balance.status = true;
                            balance.paymentStatus = 2;
                            balance.type = 4;
                            balance.grade = req.user.grade;
                            balance.save(err => {
                                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                                bal.status = false;
                                bal.save(err => {
                                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                                });
                                res._end({balance: balance});
                            })
                        }
                    });
                } else {
                    const s = new Date();
                    const balance = new Balance();
                    balance.user = req.user._id;
                    Subject.findOne({_id: req.body.subject}, (err, subject) => {
                        if (err) return new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND);
                        switch (req.body.period) {
                            case 'Week':
                                if (data[0].total >= subject.costWeek) {
                                    balance.validTo = s.setDate(s.getDate() + 7);
                                    balance.cashFlow = 0 - subject.costWeek;
                                } else {
                                    return res._end(new SE("Not enough points", SE.STATUS.PAYMENT_REQUIRED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                                }
                                break;
                            case 'Month':
                                if (data[0].total >= subject.costMonth) {
                                    balance.validTo = s.setDate(s.getDate() + 30);
                                    balance.cashFlow = 0 - subject.costMonth;
                                } else {
                                    return res._end(new SE("Not enough points", SE.STATUS.PAYMENT_REQUIRED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                                }
                                break;
                            case 'Year':
                                if (data[0].total >= subject.costYear) {
                                    balance.validTo = s.setDate(s.getDate() + 365);
                                    balance.cashFlow = 0 - subject.costYear;
                                } else {
                                    return res._end(new SE("Not enough points", SE.STATUS.PAYMENT_REQUIRED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                                }
                                break;
                        }
                        // User
                        //     .findOne({_id: req.user._id})
                        //     .exec((err, user) => {
                        //         if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                        //         if (!!user && !user.firstSubscriptionDone) {
                        //             Settings
                        //                 .findOne({name: 'referralAmount'})
                        //                 .exec(async (err, ref) => {
                        //                     if (ref.percent > 0) {
                        //                            Balance.insertMany([{
                        //                                     cashFlow: 0 - balance.cashFlow*(ref.percent/100),
                        //                                     user : user.referral,
                        //                                     type: 8,
                        //                                     status: false,
                        //                                     referralFrom: user._id,
                        //                                     paymentStatus: 0
                        //                                 }, {
                        //                                     cashFlow: 0 - balance.cashFlow*(ref.percent/100),
                        //                                     user : user._id,
                        //                                     type: 8,
                        //                                     status: false,
                        //                                     referralTo: user.referral,
                        //                                     paymentStatus: 0
                        //                                 }], (err, docs) => {
                        //                            if (err) console.log(err);
                        //                            if (docs) {
                        //                                console.log("inserted");
                        //                                user.firstSubscriptionDone = true;
                        //                                user.save()
                        //                            }
                        //                            });
                        //                     }
                        //                 })
                        //
                        //         }
                        //     });
                        balance.subjects.push(req.body.subject);
                        balance.status = true;
                        balance.paymentStatus = 2;
                        balance.type = 4;
                        balance.grade = req.user.grade;
                        balance.save(function (err, data) {
                            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                            res._end({balance: data});
                        });
                    });
                }
            })
        })
}

function activeSubscriptions(req, res) {
    Balance
        .find({$and: [{user: req.user._id}, {validTo: {$gte: Date.now()}}, {subjects: {$exists: true}}]})
        .populate('subjects')
        .exec((err, active) => {
            if (err) return new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND);
            let arr = [];
            active.forEach(function (item) {
                if (!arr.indexOf(item.subjects[0]) >= 0) {
                    arr.push(item.subjects[0]);
                }
            });
            res._end({subjects: arr});
        })
}

function findEnding(req, res) {
    cron.schedule('59 23 * * *', () => {
        let date = new Date();
        date.setDate(date.getDate() + 7);
        Balance
            .find({$and: [{validTo: {$lt: date}}, {validTo: {$gte: Date.now()}}]})
            .exec((err, ending) => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                if (ending.length > 0) {
                    ending.forEach(function (item) {
                        helper.sendNotification(item.user._id, 4, 'application.notification.subscriptionEnd', 'subscription');
                    })
                }
            })
    })
}


