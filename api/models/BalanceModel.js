const mongoose = require('mongoose');
const NotificationHelper = require('../helper/NotificationHelper');
const User = require('./UserModel');
const i18n = require('i18n');
const async = require('async');

require('./UserModel');
require('./CompanyModel');
require('./GradeModel');

const validateOfflineCode = function(offlineCode) {
    const re = /^[a-zA-Z0-9#&-_]*$/gm;
    return re.test(offlineCode)
};

const balanceSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        cashFlow: {
            type: Number,
            default: 0
        },
        amount: Number,
        points: Number,
        referralFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            // somebody used you like a referral
        },
        referralTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            // you used somebody as referral
        },
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription',
        },
        type: {
            type: Number
            //0 - Orange, 1 - Paypal, 2 - Offline, 3 - quiz Points, 4 - buy subject, 5 - for callback, 6 - for question, 7 - admin change, 8 = referral
        },
        status: {
            type: Boolean,
            default: false
            //false: not active, true: activated
        },
        offlineCode: {
            type: String,
            lowercase: true,
            trim: true,
            validate: [validateOfflineCode, 'Please fill a valid promo code address'],
        },
        offlineCompany: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        paymentStatus: {
            type: Number,
            default: 0
            // 0 - Payment on hold.
            // -1 - Payment canceled
            // 1 - Payment on verification.
            // 2 - Payment complete
        },
        activatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        validTo: {
            type: Date
        },
        subjects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject'
            }
        ],
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        },
        file: {
            type: String
        },
        callback: {
            //It's necessary for call back cancellation
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Callback'
        }
    },
    {timestamps: true});

balanceSchema.post('save', (doc, next) => {
    console.log(" save ");
    balanceNotification(doc);
    next();
});

balanceSchema.post('findOneAndUpdate', (doc, next) => {
    console.log(" findoneandupdate ");
    balanceNotification(doc);
    next();
});

const balanceNotification = doc => {
    if (!doc.status && doc.paymentStatus !== 2) {
        return;
    };
    if (doc.paymentStatus === 2 && doc.user && doc.activatedBy) {
        async.parallel({
            activatorLvl: (callback) => {
                User.findById(doc.activatedBy)
                    .populate('role')
                    .exec((err, activatorUser) => {
                        if (err) return console.error(err);

                        return callback(null, activatorUser.role.level);
                    })
            },
            user: (callback) => {
                User.findById(doc.user)
                    .exec((err, user) => {
                        if (err) return console.error(err);

                        return callback(null, user);
                    })
            }
        }, (err, results) => {
            if (err) return console.error(err);
            // results is now equals to: {one: 1, two: 2}
            if (results.activatorLvl === 5) {
                NotificationHelper.sendNotification(results.user._id, 1, 'application.notification.offlineBalanceChange', 'balance');
                NotificationHelper.sendPushNotification(results.user._id, i18n.__({
                    phrase: 'application.notification.offlineBalanceChange',
                    locale: results.user.language
                }), 'balance');
            }
        });
    } else {
        User
            .findById(doc.user)
            .populate('role')
            .exec((err, user) => {
                if (!user) return;
                if (user.role.level <= 5) {
                    console.log('User 2 = ', user);
                    NotificationHelper.sendNotification(user._id, 1, 'application.notification.balanceChange', 'balance');
                    NotificationHelper.sendPushNotification(user._id, i18n.__({
                        phrase: 'application.notification.balanceChange',
                        locale: user.language
                    }), 'balance');
                }
            });
    }
};

module.exports = mongoose.model('Balance', balanceSchema);
