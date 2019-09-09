const mongoose = require('mongoose');

require('./UserModel');

const groupSchema = new mongoose.Schema({
        name: {
            type: String
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Group', groupSchema);

