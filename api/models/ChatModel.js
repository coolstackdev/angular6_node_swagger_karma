const mongoose = require('mongoose');
const NotificationHelper = require('../helper/NotificationHelper');
const i18n = require('i18n');

require('./UserModel');
require('./GroupModel');
require('./QuestionModel');
const Question = require('./QuestionModel');

const chatSchema = new mongoose.Schema({
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        },
        message: {
            type: String
        },
        isRead: {
            type: Boolean,
            default: false
        },
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        }
    },
    {
        timestamps: true
    }
);


chatSchema.post('save', (doc, next) => {
    answerNotification(doc);
    next();
});


const answerNotification = doc => {
    if (doc.question && doc.sender && doc.message) {
        Question
            .findById(doc.question)
            .populate('author')
            .exec((err, quest) => {
                if (quest && quest.author) {
                    //send notification if answer teacher
                    if (quest.author._id.toString() !== doc.sender.toString()) {
                        NotificationHelper.sendNotification(quest.author._id, 3, 'application.notification.questionAnswer', 'question');
                        NotificationHelper.sendPushNotification(quest.author._id, i18n.__({
                            phrase: 'application.notification.questionAnswer',
                            locale: quest.author.language
                        }), 'question');
                    }
                }
            })
    }
};

module.exports = mongoose.model('Chat', chatSchema);

