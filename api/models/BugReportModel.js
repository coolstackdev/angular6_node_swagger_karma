const mongoose = require('mongoose');

const bugreportSchema = new mongoose.Schema({
        text: {
            type: String
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {timestamps: true});

module.exports = mongoose.model('BugReport', bugreportSchema);
