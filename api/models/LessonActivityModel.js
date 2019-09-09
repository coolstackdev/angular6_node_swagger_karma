const mongoose = require('mongoose');

require('./LessonModel');
require('./UserModel');

const LessonActivitySchema = new mongoose.Schema({
        finished: {
            type: Boolean,
            default: false
        },
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        doneDate: {
            type: String
        }
    },
    {timestamps: true});

module.exports = mongoose.model('LessonActivity', LessonActivitySchema);
