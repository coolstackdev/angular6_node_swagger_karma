const mongoose = require('mongoose');

require('./UserModel');
require('./GradeModel');
require('./SubjectModel');

const questionSchema = new mongoose.Schema({
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        },
        question: {
            type: String
        },
        resolved: {
            type: Boolean,
            default: false
        }
    },
    {timestamps: true});

module.exports = mongoose.model('Question', questionSchema);
