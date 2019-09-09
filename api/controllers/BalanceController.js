const Balance = require('../models/BalanceModel');
const Subscription = require('../models/SubscriptionModel');
const NotificationHelper = require('../helper/NotificationHelper');
const i18n = require('i18n');
const SE = require('../../config/error.config');
const async = require('async');
const Settings = require('../models/SettingsModel');
const User = require('../models/UserModel');

module.exports = {
    createPaymentPromocode: createPaymentPromocode,
    updateBalance: updateBalance,
    setBalance: setBalance,
    getUserBalance: getUserBalance,
    getOfflinePayments: getOfflinePayments,
    createOfflineCompanyPayment: createOfflineCompanyPayment,
    getAllUserBalances: getAllUserBalances,
    adminSetBalance: adminSetBalance
};

function createOfflineCompanyPayment(req, res) {
    const userBalance = new Balance({
        offlineCode: req.body.offlineCode,
        offlineCompany: req.body.offlineCompany,
        file: req.body.file,
        user: req.user._id,
        type: 2
    });
    userBalance.save(err => {
        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
        res._end({balance: userBalance});
    })
}

function createPaymentPromocode(req, res) {
    const userBalance = new Balance({
        offlineCode: req.body.promoCode.toLowerCase(),
        user: req.user._id,
        type: 2
    });
    const queryWithValidTo = {
        promoCode: userBalance.offlineCode.toLowerCase(),
        validTo: {$exists: true, $gte: Date.now()},
        status: true
    };
    const queryWithoutValidTo = {
        promoCode: userBalance.offlineCode.toLowerCase(),
        validTo: {$exists: false},
        status: true
    };

    async.waterfall([
        // Check this promo code in admin promo code list
        (callback) => {
            Subscription.findOne({
                $or: [
                    queryWithValidTo,
                    queryWithoutValidTo
                ]
            })
                .exec((err, subscription) => {
                    if (err) return callback(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                    if (!subscription) return callback(new SE('Promo code hasn\'t been found in database', SE.STATUS.BAD_REQUEST, SE.CODE.INVALID_WRONG_PROMOCODE));

                    userBalance.cashFlow = subscription.points;
                    userBalance.status = true;
                    userBalance.paymentStatus = 2;
                    return callback(null, userBalance, subscription.repeatable);
                })
        },
        (userBalance, repeatableSubscription, callback) => {
            Balance.count({offlineCode: userBalance.offlineCode, user: req.user._id})
                .exec((err, isSameCode) => {
                    if (err) return callback(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                    if (isSameCode !== 0 && !repeatableSubscription) return callback(new SE('This promo code has already used', SE.STATUS.BAD_REQUEST, SE.CODE.INVALID_DUPLICATE_PROMOCODE));
                    return callback(null, userBalance);
                });
        },
        (userBalance, callback) => {
            userBalance.save(err => {
                if (err) return callback(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                return callback(null, userBalance);
            })
        }
    ], (err, userBalance) => {
        console.log("000000000000000000vd");
        User
            .findOne({_id: req.user._id})
            .exec((err, user) => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                if (!!user && !user.firstSubscriptionDone) {
                    console.log("11111111");
                    Settings
                        .findOne({name: 'referralAmount'})
                        .exec((err, ref) => {
                            if (ref.percent > 0) {
                                console.log("Will add some percent");
                                Balance.insertMany([{
                                    cashFlow: userBalance.cashFlow * (ref.percent / 100),
                                    user: user.referral,
                                    type: 8,
                                    status: true,
                                    referralFrom: user._id,
                                    paymentStatus: 2
                                }, {
                                    cashFlow: userBalance.cashFlow * (ref.percent / 100),
                                    user: user._id,
                                    type: 9,
                                    status: true,
                                    referralTo: user.referral,
                                    paymentStatus: 2
                                }], (err, docs) => {
                                    if (err) console.log(err);
                                    if (docs) {
                                        console.log("inserted");
                                        user.firstSubscriptionDone = true;
                                        user.save()
                                    }
                                });
                            }
                        })
                } else if (!!user) {
                    Balance
                        .find({
                            type: 8,
                            status: false,
                            paymentStatus: 0,
                            $or: [{user: user._id, referralTo: user.referral}, {
                                user: user.referral,
                                referralFrom: user._id
                            }]
                        })
                        .exec((err, balances) => {
                            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                            if (balances.length > 0) {
                                console.log("222222222");
                                console.log('balances ', balances, ' END');
                                balances.forEach(function (item) {
                                    item.status = true;
                                    item.paymentStatus = 2;
                                    item.type = (item.referralTo) ? 9 : 8;
                                    item.save();
                                    NotificationHelper.sendNotification(item.user, 1, 'application.notification.offlineBalanceChange', 'balance');
                                    NotificationHelper.sendPushNotification(item.user, i18n.__({
                                        phrase: 'application.notification.offlineBalanceChange'
                                    }), 'balance');
                                })
                            }
                        })
                }
                res._end({balance: userBalance});
            });
    });
}

/**
 * @description Change status to activated and add points
 * @param req
 * @param res
 */
function updateBalance(req, res) {
    const query = req.body;
    if (query.paymentStatus === 2) {
        query.status = true;
        query.activatedBy = req.user._id;
    }
    Balance
        .findById(req.body._id)
        .exec((err, balance) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            balance = Object.assign(balance, query);
            balance.save(err => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                User
                    .findOne({_id: balance.user})
                    .exec((err, user) => {
                        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                        if (!!user && !user.firstSubscriptionDone) {
                            console.log("33333333333");
                            Settings
                                .findOne({name: 'referralAmount'})
                                .exec((err, ref) => {
                                    if (ref.percent > 0) {
                                        console.log('user.referral ', user.referral);
                                        console.log('user._id ', user._id);
                                        Balance.insertMany([{
                                            cashFlow: balance.cashFlow * (ref.percent / 100),
                                            user: user.referral,
                                            type: 8,
                                            status: true,
                                            referralFrom: user._id,
                                            paymentStatus: 2
                                        }, {
                                            cashFlow: balance.cashFlow * (ref.percent / 100),
                                            user: user._id,
                                            type: 9,
                                            status: true,
                                            referralTo: user.referral,
                                            paymentStatus: 2
                                        }], (err, docs) => {
                                            if (err) console.log(err);
                                            if (docs) {
                                                console.log("444444");
                                                NotificationHelper.sendNotification(user._id, 1, 'application.notification.offlineBalanceChange', 'balance');
                                                NotificationHelper.sendPushNotification(user._id, i18n.__({
                                                    phrase: 'application.notification.offlineBalanceChange'
                                                }), 'balance');
                                                NotificationHelper.sendNotification(user.referral, 1, 'application.notification.offlineBalanceChange', 'balance');
                                                NotificationHelper.sendPushNotification(user.referral, i18n.__({
                                                    phrase: 'application.notification.offlineBalanceChange'
                                                }), 'balance');
                                                console.log("inserted");
                                                user.firstSubscriptionDone = true;
                                                user.save()
                                            }
                                        });
                                    }
                                })
                        } else if (!!user && user.firstSubscriptionDone) {
                            console.log("66666666666666666");
                            Balance
                                .find({
                                    type: 8,
                                    status: false,
                                    paymentStatus: 0,
                                    $or: [{user: user._id, referralTo: user.referral}, {
                                        user: user.referral,
                                        referralFrom: user._id
                                    }]
                                })
                                .populate('user referralTo referralFrom')
                                .exec((err, balances) => {
                                    console.log('balances ', balances);
                                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                    if (balances.length > 0) {
                                        console.log("888888888888888");
                                        balances.forEach(function (item) {
                                            item.status = true;
                                            item.paymentStatus = 2;
                                            item.type = (item.referralTo) ? 9 : 8;
                                            item.save();
                                            NotificationHelper.sendNotification(item.user, 1, 'application.notification.offlineBalanceChange', 'balance');
                                            NotificationHelper.sendPushNotification(item.user, i18n.__({
                                                phrase: 'application.notification.offlineBalanceChange'
                                            }), 'balance');
                                        })
                                    }
                                })
                        }
                    });
                res._end({balance: balance});

            });
        })
}

/**
 * @description Returns amount of user's points ( consists of paid points and quiz points)
 * @param req
 * @param res
 */
function getUserBalance(req, res) {
    const dateEndOfToday = new Date();
    dateEndOfToday.setHours(0, 0, 0, 0);

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
                $lookup: {
                    from: 'subjects',
                    localField: 'subjects',
                    foreignField: '_id',
                    as: 'subjects'
                }
            }, {
                $facet: {
                    history: [
                        {
                            $sort: {updatedAt: -1}
                        }
                    ],
                    subscriptions: [
                        {
                            $match: {
                                'subjects.0': {$exists: true},
                                'validTo': {
                                    $gt: dateEndOfToday
                                }
                            }
                        }, {
                            $unwind: '$subjects'
                        }, {
                            $group: {
                                _id: '$subjects._id',
                                subject: {$last: '$subjects'},
                                validTo: {$last: '$validTo'}
                            }
                        }
                    ],
                    balance: [
                        {
                            $match: {
                                status: true,
                                paymentStatus: 2,
                                type: {$ne: 8}
                            }
                        },
                        {
                            $group: {
                                _id: '$user',
                                total: {$sum: "$cashFlow"}
                            }
                        }
                    ]
                }
            }
        ])
        .exec((err, data) => {
            if (err) res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            if (!!data[0].history) {
                Promise.all(data[0].history.map((item) => {
                    return new Promise((resolve, reject) => {
                        if (item.referralTo || item.referralFrom) {
                            let query;
                            item.referralTo ? query = {_id: item.referralTo} : query = {_id: item.referralFrom};
                            // console.log(query);
                            User
                                .findOne(query)
                                .exec((err, user) => {
                                    if (err) res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                    if (!!user) {
                                        item.referralTo ? item.referralTo = user : item.referralFrom = user;
                                        resolve(item);
                                    } else {
                                        // console.log(user);
                                        resolve(item);
                                    }
                                })
                        } else {
                            resolve(item);
                        }
                    })
                })).then(history => {
                    data[0].history = history;
                    data[0].balance = data[0].balance[0] || {total: 0};
                    return res._end(data[0]);
                })
            } else {
                data[0].balance = data[0].balance[0] || {total: 0};
                return res._end(data[0]);
            }
        });
}

function setBalance(req, res) {
    Balance
        .findOneAndUpdate({user: req.body.user}, {
            cashFlow: req.body.points,
            user: req.body.user,
        }, {upsert: true, new: true})
        .exec((err, data) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({balance: data});
        })
}

function adminSetBalance(req, res) {
    let balance = new Balance();
    balance.user = req.body.user;
    balance.cashFlow = req.body.points;
    balance.type = 7;
    balance.paymentStatus = 2;
    balance.status = true;
    balance.save();
    return res._end({success: true, message: 'Points added', points: balance.cashFlow});
}

function getAllUserBalances(req, res) {
    Balance
        .find({user: req.query.user})
        .select('type status cashFlow updatedAt -_id')
        .exec((err, balances) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            return res._end({transactions: balances})
        })
}

function getOfflinePayments(req, res) {
    Balance.find({'status': req.query.status, 'type': 2})
        .populate('user activatedBy offlineCompany')
        .sort({createdAt: -1})
        .exec((err, allOfflineBalances) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
            res._end({balances: allOfflineBalances});
        })
}


