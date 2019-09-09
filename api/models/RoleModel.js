const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
        translation: {
            type: String
        },
        level: {
            type: Number,
            min: 0,
            max: 5
        }
    },
    {timestamps: true});

module.exports = mongoose.model('Role', roleSchema);
