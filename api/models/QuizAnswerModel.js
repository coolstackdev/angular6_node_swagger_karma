const mongoose = require('mongoose');
const NotificationHelper = require('../helper/NotificationHelper');
const User = require('../models/UserModel');
const i18n = require('i18n');

require('./QuizModel');
require('./UserModel');

const answers = [
    {
        title: String,
        subtitle: String,
        variant: String,
        options: [
            {
                value: String
            }
        ],
        answer: mongoose.Schema.Types.Mixed,
        answerDescription: String,
        correct: {
            type: Boolean,
            default: false
        }
    }
];

const quizAnswerSchema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        accessCode: {
            type: String
        },
        timeEstimate: {
            type: Number
        },
        timeSpent: {
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
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        quizzes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz'
            }
        ],
        finished: {
            type: Boolean,
            default: false
        },
        answers: answers,
        questionsTotal: {
            type: Number,
            default: 0
        },
        questionsCorrect: {
            type: Number,
            default: 0
        },
        history: [
            {
                createdAt: {
                    type: Date
                },
                answers: answers,
                questionsTotal: {
                    type: Number,
                    default: 0
                },
                questionsCorrect: {
                    type: Number,
                    default: 0
                }
            }
        ],
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam'
        }
    },
    {timestamps: true}
);

//deleteMany
quizAnswerSchema.pre('remove', function (next) {
    return false;
    // next();
});

quizAnswerSchema.post('save', (doc, next) => {
    quizNotification(doc);
    next();
});

quizAnswerSchema.post('findOneAndUpdate', (doc, next) => {
    quizNotification(doc);
    next();
});

const quizNotification = doc => {
    if (!doc.finished && !!doc.user && doc.answers.length === 0 && doc.user.toString() !== doc.author.toString()) {
        User.findById(doc.user)
            .then(user => {
                if (!!doc.quiz) {
                    NotificationHelper.sendNotification(user, 5, 'application.notification.newHomework', 'homework');

                    NotificationHelper.sendPushNotification(user._id, i18n.__({
                        phrase: 'application.notification.newHomework',
                        locale: user.language
                    }), 'homework');
                } else {
                    NotificationHelper.sendNotification(user, 6, 'application.notification.newExam', 'exams');

                    NotificationHelper.sendPushNotification(user._id, i18n.__({
                        phrase: 'application.notification.newExam',
                        locale: user.language
                    }), 'exams');
                }
            })
            .catch(console.error);
    }
};

module.exports = mongoose.model('QuizAnswer', quizAnswerSchema);
