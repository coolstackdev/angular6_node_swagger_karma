const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
        name: {
            type: String
        },
        promoCode: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true
        },
        points: {
            type: Number
        },
        price: {
            type: Number
        },
        validTo: {
            type: Date
        },
        validDays: {
            type: Number
        },
        status: {
            type: Boolean,
            default: true
        },
        currency: {
            type: String,
            default: ""
        },
        repeatable: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
