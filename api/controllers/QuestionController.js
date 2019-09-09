const Question = require('../models/QuestionModel');
const Subject = require('../models/SubjectModel');
const Chat = require('../models/ChatModel');
const SE = require('../../config/error.config');
const Balance = require('../models/BalanceModel');
const NotificationHelper = require('../helper/NotificationHelper');
const i18n = require('i18n');

module.exports = {
    setQuestion: setQuestion,
    getQuestions: getQuestions,
    getQuestionSearch: getQuestionSearch,
    getQuestionChat: getQuestionChat,
    answerQuestion: answerQuestion,
    getQuestion: getQuestion
};

function setQuestion(req, res) {
    let question = new Question(req.body);
    question.grade = req.user.grade;
    question.author = req.user._id;

    Subject
        .findOne({_id: req.body.subject})
        .exec((err, limit) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            Balance
                .aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            status: true,
                            paymentStatus: 2,
                            type: {$ne: 8}
                        }
                    }, {
                        $group: {
                            _id: '$user',
                            total: {$sum: "$cashFlow"}
                        }
                    }
                ])
                .exec((err, balance) => {
                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                    console.log(balance[0].total, ' >>>>>>>>>>>>>>> ', limit.questionCost);
                    if (balance[0].total >= limit.questionCost) {
                        Question
                            .findOneAndUpdate({_id: question._id}, question, {
                                upsert: true,
                                new: true
                            })
                            .exec((err, data) => {
                                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                                let balance = new Balance();
                                balance.cashFlow = 0 - limit.questionCost;
                                balance.user = req.user._id;
                                balance.type = 6;
                                balance.save(function (err) {
                                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                                    res._end({question: data});
                                })
                            })
                    } else {
                        res._end(new SE('Not enough points', SE.STATUS.METHOD_NOT_ALLOWED, SE.CODE.ERROR_NOT_ENOUGH_POINTS));
                    }
                });
        });
}

function getQuestions(req, res) {
    Question
        .find({author: req.user._id})
        .select('-__v')
        .populate({path: 'subject', select: '-_id icon name translation'})
        .sort({
            updatedAt: -1
        })
        .exec((err, questions) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            Promise.all(questions.map((item) => {
                return new Promise((resolve, reject) => {
                    Chat
                        .find({question: item._id})
                        .populate({path: 'sender', select: '-_id name lastName'})
                        .sort({
                            updatedAt: 1
                        })
                        .exec((err, messages) => {
                            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                            item = item.toObject();
                            item.answers = messages;
                            resolve(item);
                        })
                })
            })).then(result => {
                return res._end({questions: result});
            })
        });
}

function getQuestionChat(req, res) {
    Chat
        .find({question: req.query.id})
        .sort({createdAt: -1})
        .exec((err, messages) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            res._end({messages: messages});
        })
}

function getQuestion(req, res) {
    Question
        .findOne({_id: req.query.id})
        .sort({createdAt: -1})
        .exec((err, question) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
            if (!!question) {
                Chat
                    .find({question: question._id})
                    .populate({path: 'sender', select: '-_id name lastName'})
                    .sort({
                        updatedAt: 1
                    })
                    .exec((err, messages) => {
                        if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                        question = question.toObject();
                        question.answers = messages;
                        res._end({question: question});
                    })
            }
        })
}

function getQuestionSearch(req, res) {
    const query = {
        resolved: (req.query.resolved !== 'false') ? true : {$ne: true}
    };

    if (req.user.role.level !== 5) {
        query.subject = {$in: req.user.subjects};
    }

    // console.log(query);

    Question
        .find(query)
        .populate('author subject grade')
        .sort({
            updatedAt: -1
        })
        .exec((err, questions) => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

            Promise.all(questions.map((item) => {
                return new Promise((resolve, reject) => {
                    Chat
                        .find({question: item._id})
                        .populate({path: 'sender', select: '-_id name lastName'})
                        .sort({
                            updatedAt: 1
                        })
                        .exec((err, messages) => {
                            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                            item = item.toObject();
                            item.answers = messages;
                            resolve(item);
                        })
                })
            })).then(result => {
                return res._end({questions: result});
            });
        });
    // if (req.query.answered == 'true') {
    //     const query = {};
    //     if (req.user.role.level !== 5) {
    //         query.subject = {$in: req.user.subjects};
    //         query.resolved = false;
    //     } else {
    //         query.resolved = false;
    //     }
    //     Question
    //         .find(query)
    //         .populate('author subject grade')
    //         .sort({
    //             updatedAt: -1
    //         })
    //         .exec((err, questions) => {
    //             if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
    //             Promise.all(questions.map((item) => {
    //                 return new Promise((resolve, reject) => {
    //                     Chat
    //                         .find({question: item._id})
    //                         .populate({path: 'sender', select: '-_id name lastName'})
    //                         .sort({
    //                             updatedAt: 1
    //                         })
    //                         .exec((err, messages) => {
    //                             if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
    //                             item = item.toObject();
    //                             item.answers = messages;
    //                             resolve(item);
    //                         })
    //                 })
    //             })).then(result => {
    //                 return res._end({questions: result.filter(result => result.answers.length > 0)});
    //             })
    //         })
    // } else {
    //     const query = {};
    //     if (req.query.hasOwnProperty('resolved')) {
    //         query.resolved = req.query.resolved;
    //     }
    //
    //     if (req.user.role.level !== 5) {
    //         query.subject = {$in: req.user.subjects};
    //     }
    //     console.log(query, ' QUERY');
    //
    //     Question
    //         .find(query)
    //         .populate('author subject grade')
    //         .sort({
    //             updatedAt: -1
    //         })
    //         .exec((err, questions) => {
    //             if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
    //             Promise.all(questions.map((item) => {
    //                 return new Promise((resolve, reject) => {
    //                     Chat
    //                         .find({question: item._id})
    //                         .populate({path: 'sender', select: '-_id name lastName'})
    //                         .sort({
    //                             updatedAt: 1
    //                         })
    //                         .exec((err, messages) => {
    //                             if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
    //                             item = item.toObject();
    //                             item.answers = messages;
    //                             resolve(item);
    //                         })
    //                 })
    //             })).then(result => {
    //                 if (req.query.answered === 'false') {
    //                     return res._end({questions: result.filter(result => result.answers.length < 1)});
    //                 } else {
    //                     return res._end({questions: result.filter(result => result)});
    //                 }
    //             })
    //         })
    // }
}



function answerQuestion(req, res) {
    if (!req.body.resolved) {
        Question
            .findOne({_id: req.body.question})
            .exec((err, quest) => {
                if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));

                let response = new Chat(req.body);
                response.sender = req.user._id;
                response.recipient = quest.author;
                response.save(err => {
                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                });

                quest.resolved = false;
                quest.save(function (err) {
                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
                    NotificationHelper.sendNotification(quest.author, 1, 'application.notification.questionAnswer', 'question');
                    NotificationHelper.sendPushNotification(quest.author, i18n.__({
                        phrase: 'application.notification.questionAnswer'
                    }), 'question');
                    Chat
                        .find({question: quest._id})
                        .populate({path: 'sender', select: '-_id name lastName'})
                        .sort({
                            updatedAt: 1
                        })
                        .exec((err, messages) => {
                            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                            quest = quest.toObject();
                            console.log(messages.length, ' !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                            quest.answers = messages;
                            res._end({question: quest});
                        });
                })
            })
    } else {
        let author;
        if (!!req.body.question) {
            Question
                .findOne({_id: req.body.question})
                .exec((err, quest) => {
                    if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_FIND));
                    if (!!quest) {
                        author = quest.author;
                    } else {
                        author = req.user._id;
                    }
                })
        }
        let response = new Chat(req.body);
        response.sender = req.user._id;
        response.save(err => {
            if (err) return res._end(new SE(err.message, SE.STATUS.INTERNAL_SERVER_ERROR, SE.CODE.ERROR_MONGODB_SAVING));
            NotificationHelper.sendNotification(author, 1, 'application.notification.questionAnswer', 'question');
            NotificationHelper.sendPushNotification(author, i18n.__({
                phrase: 'application.notification.questionAnswer'
            }), 'question');
            res._end({message: response});

        });
        response.populate('question').execPopulate().then(data => {
            data.question.resolved = req.body.resolved;
            data.question.save();
        });
    }

}

