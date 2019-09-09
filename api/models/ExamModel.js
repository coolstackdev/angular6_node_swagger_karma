const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School'
        },
        timeEstimate: {
            type: Number
        },
        dueTo: {
            type: Date
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        quizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz'
            }
        ],
    },
    {timestamps: true});

module.exports = mongoose.model('Exam', ExamSchema);
