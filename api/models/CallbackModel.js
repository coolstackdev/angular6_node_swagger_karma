const mongoose = require('mongoose');

require('./UserModel');

const callbackSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        calltime: {
            type: String,
            required: true
        },
        calldate: {
            type: Date,
            required: true
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        },
        reason: {
            type: String
        },
        status: {
            // 0 - Uncalled, 1 - Called, 2 - Unavailable (retry later)
            type: String,
            default: 'Uncalled'
        },
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {timestamps: true});

callbackSchema.virtual('callDateTime').get(function () {
    return this.calldate.setHours(parseInt(this.calltime.split(':')[0]),parseInt(this.calltime.split(':')[1]), 0,0);
});

module.exports = mongoose.model('Callback', callbackSchema);
