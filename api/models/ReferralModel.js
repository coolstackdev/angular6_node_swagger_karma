const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
    },
    {timestamps: true});

module.exports = mongoose.model('Referral', referralSchema);
