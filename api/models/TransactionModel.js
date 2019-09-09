const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
        request: {},
        result: {},
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: Number //0 - Orange, 1 - paypal, 2 - offline payment
        },
        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subscription'
        },
        amount: Number,
        points: Number,
        status: String,
        notificationId: String,
        orderId: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Transaction', transactionSchema);
