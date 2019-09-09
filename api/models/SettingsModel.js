const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
        name: {
            type: String
        },
        value: {
            type: Number
        },
        percent: {
            type: Number
        },
        text: {
            type: String
        }
    },
    {timestamps: true});

module.exports = mongoose.model('Settings', SettingsSchema);
