const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
        registrationId: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {timestamps: true});

module.exports = mongoose.model('Device', DeviceSchema);
