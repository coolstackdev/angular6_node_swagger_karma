const mongoose = require('mongoose');

require('./SubjectModel');
require('./GradeModel');

const quizSchema = new mongoose.Schema({
        title: String,
        subtitle: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        translate: {
            type: String
        },
        grade: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        },
        grades: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grade'
        }],
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        points: {
            type: Number,
            required: true
        },
        saveOptions: {
            subject: String,
            grade: String
        },
        questions: [
            {
                title: String,
                subtitle: String,
                variant: String,
                options: [
                    {
                        value: String,
                        description: {
                            type: String,
                            default: ""
                        }
                        //image: String
                    }
                ],
                answer: mongoose.Schema.Types.Mixed,
                answerDescription: String
            }
        ]
    },
    {timestamps: true});

module.exports = mongoose.model('Quiz', quizSchema);
