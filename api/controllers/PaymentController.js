const SE = require('../../config/error.config');
const orangePaymentHelper = require('../helper/orangePaymentHelper');
const TransactionModel = require('../models/TransactionModel');
const Balance = require('../models/BalanceModel');
const User = require('../models/UserModel');
const Settings = require('../models/SettingsModel');
const paypal = require('paypal-rest-sdk');
const async = require('async');
const NotificationHelper = require('../helper/NotificationHelper');
const i18n = require('i18n');

paypal.configure({
    'mode': process.env.PAYPAL_MODE, //sandbox or live
    'client_id': process.env.PAYPAL_CLIENTID, // please provide your client id here
    'client_secret': process.env.PAYPAL_SECRET // provide your client secret here
});

module.exports = {
    orangePayment: orangePayment,
    paypalWebhook: paypalWebhook,
    getOrangePayments: getOrangePayments,
    getPaypalPayments: getPaypalPayments,
    savePaypalTransaction: savePaypalTransaction,
    orangeCallbackGET: orangeCallbackGET,
    orangeCallbackPOST: orangeCallbackPOST,
    orangeCancelGET: orangeCancelGET,
    orangeCancelPOST: orangeCancelPOST,
    orangeNotificationGET: orangeNotificationGET,
    orangeNotificationPOST: orangeNotificationPOST
};

/*
    Orange banking
*/

function orangeCallbackGET(req, res) {
    console.log('orangeCallbackGET ===');
    res.redirect('/payment-success');
}

function orangeCallbackPOST(req, res) {
    console.log('orangeCallbackPOST ===');
    res._end({'body': req.body, 'params:': req.params, 'query:': req.query});
}

function orangeCancelGET(req, res) {
    console.log('orangeCancelGET ===');
    res.redirect('/payment-cancel');
}

function orangeCancelPOST(req, res) {
    console.log('orangeCancelPOST ===');
    res._end({'body': req.body, 'params:': req.params, 'query:': req.query});
}

function orangeNotificationGET(req, res) {
    console.log('orangeNotificationGET ===');
    res._end({'body': req.body, 'params:': req.params, 'query:': req.query});
}

function orangeNotificationPOST(req, res) {
    console.log('orangeNotificationPOST ===', req.body);
    TransactionModel.findOneAndUpdate({'notificationId': req.body.notif_token}, {status: req.body.status}, {new: true})
        .exec((err, transaction) => {
            if (err) console.error();
            console.log('Change transaction status ', transaction);

            const mongoose = require('mongoose');
            if (req.body.status === 'SUCCESS') {
                const userBalance = new Balance({
                    user: transaction.user,
                    status: true,
                    type: 0,
                    paymentStatus: 2,
                    amount: transaction.amount,
                    cashFlow: transaction.points
                });
                User
                    .findOne({_id: mongoose.mongo.ObjectId(transaction.user)})
                    .exec((err, user) => {
                        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                        if (!!user && !user.firstSubscriptionDone) {
                            Settings
                                .findOne({name: 'referralAmount'})
                                .exec(async (err, ref) => {
                                    if (ref.percent > 0) {
                                        Balance.insertMany([{
                                            cashFlow: 0 - transaction.points * (ref.percent / 100),
                                            user: user.referral,
                                            type: 8,
                                            status: true,
                                            referralFrom: user._id,
                                            paymentStatus: 2
                                        }, {
                                            cashFlow: 0 - transaction.points * (ref.percent / 100),
                                            user: user._id,
                                            type: 9,
                                            status: true,
                                            referralTo: user.referral,
                                            paymentStatus: 2
                                        }], (err, docs) => {
                                            if (err) console.log(err);
                                            if (docs) {
                                                console.log("Referral points added");
                                                user.firstSubscriptionDone = true;
                                                NotificationHelper.sendNotification(user._id, 1, 'application.notification.offlineBalanceChange', 'balance');
                                                NotificationHelper.sendPushNotification(user._id, i18n.__({
                                                    phrase: 'application.notification.offlineBalanceChange'
                                                }), 'balance');
                                                NotificationHelper.sendNotification(user.referral, 1, 'application.notification.offlineBalanceChange', 'balance');
                                                NotificationHelper.sendPushNotification(user.referral, i18n.__({
                                                    phrase: 'application.notification.offlineBalanceChange'
                                                }), 'balance');
                                                user.save()
                                            }
                                        });
                                    }
                                })
                        }
                    });
                userBalance.save((err, data) => {
                    if (err) console.error(err);
                    console.log(data);
                })
            }
        });

    res._end({});
}

function orangePayment(req, res) {
    orangePaymentHelper.orangePaymentMethod(req.user, req.body.amount, req.body.points)
        .then(res._end)
        .catch(res._end)
}

function getOrangePayments(req, res) {
    Balance
        .find({type: 0})
        .populate('user')
        .sort('-updatedAt')
        .exec((err, payments) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({payments: payments});
        })
}

function getPaypalPayments(req, res) {
    Balance
        .find({type: 1})
        .populate('user')
        .exec((err, payments) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({payments: payments});
        })
}

/*
    Paypal banking
*/

// start payment process
function paypalWebhook(req, res) {
    console.log(req.body);
    if (req.body.event_type === 'PAYMENT.SALE.COMPLETED' && req.body.resource.state === 'completed') {
        async.waterfall([
            (callback) => {
                Settings.find().exec()
                    .then(settings => callback(null, settings))
                    .catch(console.error)
            },
            (settings, callback) => {
                let pricePerPoint = settings.find(settings => settings.name === 'pricePerPoint').value;
                console.log('pricePerPoint = ', pricePerPoint);

                TransactionModel.findOne({'request.response.id': req.body.resource.parent_payment})
                    .exec()
                    .then(transaction => {
                        transaction.result = req.body;
                        transaction.save();

                        console.log('transaction = ', transaction);
                        let balance = new Balance({
                            type: 1,
                            status: true,
                            user: transaction.user,
                            cashFlow: Math.round(parseFloat(req.body.resource.amount.total) / pricePerPoint),
                            paymentStatus: 2
                        });
                        balance.save()
                            .then(console.log)
                            .catch(console.error);
                        return callback(null)
                    })
                    .catch(console.error)
            }
        ], (err, result) => {
            if (err) return res._end();
            console.log('All ok');
            res._end();
        });
    }
}

function savePaypalTransaction(req, res) {
    let transaction = new TransactionModel({
        request: req.body,
        user: req.user._id,
        type: 1
    });
    transaction.save()
        .then(console.log)
        .catch(console.error);
}

