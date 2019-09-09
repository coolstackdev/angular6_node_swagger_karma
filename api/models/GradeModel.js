const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
        level: {
            type: String,
            unique: true
        },
        category: {
            type: String
        },
        min: {
            type: Number,
            min: 1,
            max: 100
        },
        max: {
            type: Number,
            min: 1,
            max: 100
        },
        translation: {
            type: String
        }
    },
    {timestamps: true});

module.exports = mongoose.model('Grade', gradeSchema);

