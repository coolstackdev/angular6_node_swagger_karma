const Balance = require('../models/BalanceModel');
const SE = require('../../config/error.config');

module.exports = {
    getBalance: getBalance,
    setBalance: setBalance
};

/**
 * @description Get student balance by promise
 * @param user
 */
function getBalance(user) {
    return new Promise((resolve, reject) => {
        Balance
            .aggregate([
                {
                    $match: {
                        user: user._id,
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
                if (err) return reject(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                user = user.toObject();
                user.points = data[0] && data[0].total || 0;
                resolve(user);
            });
    });
}

function setBalance(currentUserId, subscription) {
    const balance = new Balance({
        'user': currentUserId,
        'cashFlow': subscription.points,
        'status': true,
        'type': 0,
        'paymentStatus': 2,
        'subscription': subscription._id
    });

    return new Promise((resolve, reject) => {
        balance.save((err) => {
            if (err) return reject(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
            resolve();
        });
    })
}
